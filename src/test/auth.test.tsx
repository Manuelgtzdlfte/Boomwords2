import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { userService } from '../components/userService/userService';
import { SetYourName } from '../pages/setName/setYourName';
import { ChooseDif } from '../pages/chooseDif/chooseDif';

describe('Módulo de Login y Autenticación (userService & UI)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe('userService - Registro, Login y Persistencia', () => {
    it('registra un nuevo usuario correctamente y persiste en localStorage', () => {
      const registered = userService.registerUser('AgentZero', 'zero@boomwords.com', 'secret123');
      expect(registered).toBe(true);

      const users = userService.getUsers();
      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({
        username: 'AgentZero',
        email: 'zero@boomwords.com',
        accessKey: 'secret123',
        highScore: 0,
        gamesPlayed: 0
      });
    });

    it('rechaza registros con username o email duplicados (case-insensitive) o campos vacíos', () => {
      expect(userService.registerUser('   ', 'a@b.com', '123456')).toBe(false);
      expect(userService.registerUser('player1', '   ', '123456')).toBe(false);
      expect(userService.registerUser('player1', 'a@b.com', '   ')).toBe(false);

      expect(userService.registerUser('PlayerOne', 'one@test.com', 'pass123')).toBe(true);
      expect(userService.registerUser('playerone', 'other@test.com', 'pass123')).toBe(false);
      expect(userService.registerUser('PlayerTwo', 'ONE@TEST.COM', 'pass123')).toBe(false);
    });

    it('valida credenciales en loginUser y rechaza contraseñas o usuarios inválidos', () => {
      userService.registerUser('GamerPro', 'pro@boom.com', 'key9876');

      expect(userService.loginUser('GamerPro', 'key9876')).not.toBeNull();
      expect(userService.loginUser('  gamerpro  ', 'key9876')?.username).toBe('GamerPro');
      expect(userService.loginUser('GamerPro', 'wrongkey')).toBeNull();
      expect(userService.loginUser('UnknownUser', 'key9876')).toBeNull();
    });

    it('gestiona tokens de sesión, expiración y limpieza ante datos corruptos', () => {
      userService.registerUser('TokenUser', 'token@boom.com', 'validKey1');
      const user = userService.loginUser('TokenUser', 'validKey1')!;
      userService.setCurrentUser(user);

      expect(userService.getCurrentUser()?.username).toBe('TokenUser');

      // Simular token expirado
      const expiredToken = btoa(
        JSON.stringify({ username: 'TokenUser', expires: Date.now() - 10000 })
      );
      localStorage.setItem('boomwords_current_user', expiredToken);

      expect(userService.validateToken(expiredToken)).toBeNull();
      expect(userService.getCurrentUser()).toBeNull();
      expect(localStorage.getItem('boomwords_current_user')).toBeNull();

      // Simular JSON corrupto en localStorage
      localStorage.setItem('boomwords_users', '{invalid_json');
      expect(userService.getUsers()).toEqual([]);
    });

    it('cierra la sesión correctamente con logout y recupera contraseña por email', () => {
      userService.registerUser('RecoverMe', 'recover@boom.com', 'mySecretKey');
      const user = userService.loginUser('RecoverMe', 'mySecretKey')!;
      userService.setCurrentUser(user);

      expect(userService.recoverPassword('RECOVER@boom.com')).toBe('mySecretKey');
      expect(userService.recoverPassword('nonexistent@boom.com')).toBeNull();

      userService.logout();
      expect(userService.getCurrentUser()).toBeNull();
      expect(localStorage.getItem('boomwords_current_user')).toBeNull();
      expect(localStorage.getItem('boomwords_user_data')).toBeNull();
    });
  });

  describe('Componente SetYourName y ChooseDif (Flujo de UI)', () => {
    it('muestra errores de validación cuando las credenciales son inválidas o vacías', () => {
      render(
        <MemoryRouter initialEntries={['/setYourName']}>
          <Routes>
            <Route path="/setYourName" element={<SetYourName />} />
          </Routes>
        </MemoryRouter>
      );

      const submitBtn = screen.getByRole('button', { name: /ACCESS_SYSTEM/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Access key is required')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/USERNAME/i), { target: { value: 'ab' } });
      fireEvent.change(screen.getByLabelText(/ACCESS_KEY/i), { target: { value: '123' } });
      fireEvent.click(submitBtn);

      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
      expect(screen.getByText('Access key must be at least 6 characters')).toBeInTheDocument();
    });

    it('permite registrar una cuenta, iniciar sesión y cerrar sesión desde ChooseDif', () => {
      vi.useFakeTimers();

      render(
        <MemoryRouter initialEntries={['/setYourName']}>
          <Routes>
            <Route path="/" element={<div>Main Home</div>} />
            <Route path="/setYourName" element={<SetYourName />} />
            <Route path="/chooseDif" element={<ChooseDif />} />
          </Routes>
        </MemoryRouter>
      );

      // Cambiar a modo Registro
      fireEvent.click(screen.getByRole('button', { name: /Need an account\? Register/i }));

      fireEvent.change(screen.getByLabelText(/USERNAME/i), { target: { value: 'NeoAgent' } });
      fireEvent.change(screen.getByLabelText(/EMAIL/i), { target: { value: 'neo@matrix.com' } });
      fireEvent.change(screen.getByLabelText(/ACCESS_KEY/i), { target: { value: 'matrix123' } });

      fireEvent.click(screen.getByRole('button', { name: /CREATE_ACCOUNT/i }));

      act(() => {
        vi.advanceTimersByTime(1100);
      });

      // Debe haber navegado a /chooseDif y mostrar las estadísticas del agente
      expect(screen.getByText('NeoAgent')).toBeInTheDocument();
      expect(screen.getByText('ROOKIE')).toBeInTheDocument();

      // Ejecutar Logout
      fireEvent.click(screen.getByRole('button', { name: /LOGOUT/i }));
      expect(screen.getByText('Main Home')).toBeInTheDocument();
      expect(userService.getCurrentUser()).toBeNull();
    });
  });
});
