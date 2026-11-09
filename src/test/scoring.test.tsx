import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GameHandler, calculateScoreByDifficulty } from '../pages/game/gameHanler';
import { userService } from '../components/userService/userService';
import { ChooseDif } from '../pages/chooseDif/chooseDif';

describe('Sistema de Puntaje (Puntos Base, Bonificaciones, Multiplicadores y Penalizaciones)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Cálculo matemático de puntaje (calculateScoreByDifficulty)', () => {
    it('calcula correctamente los puntos base según la dificultad cuando el tiempo restante es 0', () => {
      expect(calculateScoreByDifficulty('facil', 0)).toBe(50);
      expect(calculateScoreByDifficulty('medio', 0)).toBe(75);
      expect(calculateScoreByDifficulty('dificil', 0)).toBe(100);
    });

    it('calcula correctamente la bonificación de tiempo restante (Math.floor(remainingTime * 0.75))', () => {
      // facil: 50 + floor(120 * 0.75 = 90) = 140
      expect(calculateScoreByDifficulty('facil', 120)).toBe(140);
      // medio: 75 + floor(90 * 0.75 = 67.5 -> 67) = 142
      expect(calculateScoreByDifficulty('medio', 90)).toBe(142);
      // dificil: 100 + floor(60 * 0.75 = 45) = 145
      expect(calculateScoreByDifficulty('dificil', 60)).toBe(145);
    });

    it('aplica penalizaciones y multiplicadores respetando el límite inferior de 0 puntos', () => {
      // Base 100 + bonus 45 = 145; menos penalización de 20 = 125; por multiplicador 2 = 250
      expect(calculateScoreByDifficulty('dificil', 60, 20, 2)).toBe(250);

      // Si la penalización supera el puntaje total, nunca devuelve valores negativos
      expect(calculateScoreByDifficulty('facil', 10, 500, 1)).toBe(0);

      // Manejo seguro de tiempos negativos o NaN
      expect(calculateScoreByDifficulty('medio', -25)).toBe(75);
      expect(calculateScoreByDifficulty('medio', Number.NaN)).toBe(75);
    });
  });

  describe('Acumulación, penalizaciones en partida y sincronización del marcador del jugador', () => {
    it('refleja la penalización de tiempo por errores en el puntaje final y actualiza el récord del usuario en tiempo real', () => {
      userService.registerUser('ScoreMaster', 'score@boom.com', 'pass1234');
      const loggedIn = userService.loginUser('ScoreMaster', 'pass1234')!;
      userService.setCurrentUser(loggedIn);

      // Seleccionar primera palabra de 'facil' ("bomba")
      vi.spyOn(Math, 'random').mockReturnValue(0);

      render(
        <MemoryRouter>
          <GameHandler difficulty="facil" />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('Introduce una letra') as HTMLInputElement;
      const guessLetter = (char: string) => {
        fireEvent.change(input, { target: { value: char } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      };

      // Fallar 2 letras ('z', 'x') -> -10 segundos (de 120s a 110s)
      act(() => {
        guessLetter('z');
        guessLetter('x');
      });
      expect(screen.getByText('Tiempo: 110s')).toBeInTheDocument();

      // Completar "bomba" ('b', 'o', 'm', 'a') con 110s restantes
      // Puntaje esperado: 50 (base facil) + floor(110 * 0.75 = 82.5 -> 82) = 132
      act(() => {
        guessLetter('b');
        guessLetter('o');
        guessLetter('m');
        guessLetter('a');
      });

      expect(screen.getByText('Puntuación Final: 132')).toBeInTheDocument();
      expect(screen.getByText(/Ganaste con 132 puntos/i)).toBeInTheDocument();

      // Verificar que tanto la base de usuarios como la sesión activa reflejen el nuevo highScore y gamesPlayed
      const currentUser = userService.getCurrentUser();
      expect(currentUser?.highScore).toBe(132);
      expect(currentUser?.gamesPlayed).toBe(1);
    });

    it('conserva el highScore máximo cuando una partida posterior obtiene menor puntaje y actualiza el rango en ChooseDif', () => {
      userService.registerUser('ElitePlayer', 'elite@boom.com', 'elite123');
      const user = userService.loginUser('ElitePlayer', 'elite123')!;
      userService.setCurrentUser(user);

      // Primera misión: 1100 puntos (Rango ELITE)
      userService.updateHighScore('ElitePlayer', 1100);
      // Segunda misión: 400 puntos (No debe sobrescribir el récord de 1100, pero sí incrementar gamesPlayed a 2)
      userService.updateHighScore('ElitePlayer', 400);

      const updated = userService.getCurrentUser()!;
      expect(updated.highScore).toBe(1100);
      expect(updated.gamesPlayed).toBe(2);

      render(
        <MemoryRouter>
          <ChooseDif />
        </MemoryRouter>
      );

      expect(screen.getByText('ElitePlayer')).toBeInTheDocument();
      expect(screen.getByText('1100')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('ELITE')).toBeInTheDocument();
      expect(screen.getByText('NEXT RANK: 0 PTS')).toBeInTheDocument();
    });
  });
});
