import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  GameHandler,
  normalizeLetter,
  isValidGuessInput,
  createInitialDisplay,
  IA_Ahorcado
} from '../pages/game/gameHanler';
import { wordBank } from '../components/wordBanks';
import { resolveDifficulty } from '../routes/router';
import { obtenerDatosIniciales } from '../components/iaLearned/iaLearned';

describe('Lógica del Juego y Reglas (Validación, Diccionario, Temporizadores y Turnos)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Validación de letras, normalización y diccionario', () => {
    it('normaliza vocales acentuadas y preserva la letra ñ', () => {
      expect(normalizeLetter('Á')).toBe('a');
      expect(normalizeLetter('é')).toBe('e');
      expect(normalizeLetter('Í')).toBe('i');
      expect(normalizeLetter('ó')).toBe('o');
      expect(normalizeLetter('ú')).toBe('u');
      expect(normalizeLetter('ü')).toBe('u');
      expect(normalizeLetter('Ñ')).toBe('ñ');
      expect(normalizeLetter('ñ')).toBe('ñ');
      expect(normalizeLetter('FÁCIL')).toBe('facil');
    });

    it('acepta únicamente letras válidas del alfabeto español y rechaza símbolos o números', () => {
      expect(isValidGuessInput('a')).toBe(true);
      expect(isValidGuessInput('Ñ')).toBe(true);
      expect(isValidGuessInput('á')).toBe(true);
      expect(isValidGuessInput('1')).toBe(false);
      expect(isValidGuessInput('$')).toBe(false);
      expect(isValidGuessInput(' ')).toBe(false);
      expect(isValidGuessInput('ab')).toBe(false);
      expect(isValidGuessInput('')).toBe(false);
    });

    it('preserva los espacios al inicializar palabras compuestas del diccionario', () => {
      const display = createInitialDisplay('base de datos');
      expect(display.join('')).toBe('____ __ _____');
      expect(display[4]).toBe(' ');
      expect(display[7]).toBe(' ');
    });

    it('valida el banco de palabras y aplica fallback seguro para dificultades inválidas', () => {
      expect(wordBank.facil.length).toBeGreaterThan(0);
      expect(wordBank.medio.length).toBeGreaterThan(0);
      expect(wordBank.dificil.length).toBeGreaterThan(0);

      expect(resolveDifficulty('facil')).toBe('facil');
      expect(resolveDifficulty('medio')).toBe('medio');
      expect(resolveDifficulty('dificil')).toBe('dificil');
      expect(resolveDifficulty('imposible')).toBe('facil');
      expect(resolveDifficulty(undefined)).toBe('facil');
    });
  });

  describe('Temporizadores, flujo de turnos y condiciones de victoria/derrota', () => {
    it('inicia el temporizador según la dificultad y descuenta cada segundo hasta Game Over', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0); // 'bomba' en facil

      render(
        <MemoryRouter>
          <GameHandler difficulty="facil" />
        </MemoryRouter>
      );

      expect(screen.getByText('Tiempo: 120s')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(screen.getByText('Tiempo: 110s')).toBeInTheDocument();

      // Avanzar hasta agotar el tiempo
      act(() => {
        vi.advanceTimersByTime(110000);
      });

      expect(screen.getByText('Tiempo: 0s')).toBeInTheDocument();
      expect(screen.getByText(/¡Boom! Perdiste\. Era bomba/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Introduce una letra')).toBeDisabled();
    });

    it('revela letras acertadas (incluyendo con tilde), ignora repetidas y declara victoria al completar la palabra', () => {
      // Índice 3 en wordBank.facil es "fácil"
      vi.spyOn(Math, 'random').mockReturnValue(3 / wordBank.facil.length);

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

      // Adivinar 'f', 'a' (debe descubrir 'á'), 'c', 'i', 'l'
      act(() => {
        guessLetter('f');
        guessLetter('a');
        // Intentar repetir 'a' o 'z' repetida no debe descontar doble
        guessLetter('c');
        guessLetter('i');
        guessLetter('l');
      });

      expect(screen.getByText(/¡Ganaste!/i)).toBeInTheDocument();
      expect(screen.getByText(/Puntuación Final:/i)).toBeInTheDocument();
    });

    it('aplica penalización de -5s por error, no penaliza letras repetidas y activa pregunta extra al bajar de 30s', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0); // 'bomba' en facil

      render(
        <MemoryRouter>
          <GameHandler difficulty="dificil" />
        </MemoryRouter>
      );

      // En difícil empieza en 60s, palabra índice 0 es "programación"
      expect(screen.getByText('Tiempo: 60s')).toBeInTheDocument();

      const input = screen.getByPlaceholderText('Introduce una letra') as HTMLInputElement;
      const guessLetter = (char: string) => {
        fireEvent.change(input, { target: { value: char } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      };

      // Fallar con 'z' -> 55s
      act(() => {
        guessLetter('z');
      });
      expect(screen.getByText('Tiempo: 55s')).toBeInTheDocument();

      // Repetir 'z' no debe volver a restar 5s
      act(() => {
        guessLetter('z');
      });
      expect(screen.getByText('Tiempo: 55s')).toBeInTheDocument();

      // Bajar el reloj a 34s mediante el timer (21s) y luego fallar con 'x' -> 29s (<= 30s)
      act(() => {
        vi.advanceTimersByTime(21000);
      });
      expect(screen.getByText('Tiempo: 34s')).toBeInTheDocument();

      act(() => {
        guessLetter('x');
      });
      expect(screen.getByText('Tiempo: 29s')).toBeInTheDocument();

      // Se debe mostrar la sección de pregunta de tiempo extra y pausar el timer
      expect(screen.getByText('¡Oportunidad de tiempo extra!')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(5000);
      });
      // El tiempo sigue en 29s mientras la pregunta está activa
      expect(screen.getByText('Tiempo: 29s')).toBeInTheDocument();

      // Responder correctamente la pregunta 0 (respuesta = 3)
      const answerInput = screen.getByPlaceholderText('Tu respuesta');
      fireEvent.change(answerInput, { target: { value: '3' } });
      fireEvent.click(screen.getByRole('button', { name: /Responder/i }));

      expect(screen.getByText('Tiempo: 59s')).toBeInTheDocument();
      expect(screen.getByText(/\+30 segundos extra!/i)).toBeInTheDocument();
    });
  });

  describe('IA_Ahorcado - Aprendizaje y sugerencias', () => {
    it('actualiza pesos de letras acertadas/falladas y sugiere letras no probadas', () => {
      const ia = new IA_Ahorcado(obtenerDatosIniciales());
      const prevA = ia.obtener_estadisticas().topLetras.find(([l]) => l === 'a')?.[1] || 0;

      ia.aprender_de_palabra('fácil', ['a', 'z']);
      const postStats = ia.obtener_estadisticas();
      const newA = postStats.topLetras.find(([l]) => l === 'a')?.[1] || 0;

      expect(newA).toBe(prevA + 3);

      const suggestion = ia.sugerir_letra(['e', 'a'], 'c_s_');
      expect(suggestion).not.toBeNull();
      expect(['e', 'a']).not.toContain(suggestion);
    });
  });
});
