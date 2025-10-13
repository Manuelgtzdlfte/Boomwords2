import './gameHandler.css';
import { useState, useEffect, useRef } from 'react';
import { wordBank, type Difficulty } from '../../components/wordBanks/index';
import { useNavigate } from 'react-router-dom';
import { LetterCard } from '../../components/letterCard/letterCard';
import { userService } from '../../components/userService/userService';
import { datos, guardarDatosIA } from '../../components/iaLearned/iaLearned';
import { GamePopUp } from '../../components/gamePopUp/gamePopUp';


interface GamePageProps {
  difficulty: Difficulty;
}

// Preguntas capciosas para tiempo extra
const questions = [
  {
    question: 'Un avión choca en la frontera entre México y Estados Unidos. ¿En qué país entierran a los supervivientes? \n 1)Mexico \n 2)Estados Unidos \n 3)Ninguno',
    answer: 3 // No se entierran a los supervivientes
  },
  {
    question: '¿Cuántos meses tienen 28 días? \n 1)1 \n 2)3 \n 3)4 \n 5)Todos', 
    answer: 5 // Todos los meses tienen al menos 28 días
  },
  {
    question: 'Un granjero tiene 15 ovejas y se le mueren todas menos 9. ¿Cuántas ovejas le quedan?\n 1)1 \n 2)9 \n 3)4 \n 5)Todas \n 5)Ninguna', 
    answer: 2 // "Todas menos 9" significa que le quedan 9
  },
  {
    question: 'Tienes una cerilla y entras en una habitación donde hay una lámpara de aceite, una vela y una estufa de leña. ¿Qué enciendes primero? \n 1)lámpara de aceite \n 2)vela \n 3)cerillo \n 3)estufa de leña',
    answer: 3 // La cerilla (match)
  },
  {
    question: '¿Qué pesa más: un kilo de plumas o un kilo de plomo? \n 1)Plumas \n 2)plomo \n 3)ninguno',
    answer: 3 // Pesan igual, ambos son un kilo
  },
  {
    question: 'Un tren eléctrico viaja a 100 km/h hacia el norte. El viento sopla hacia el sur a 10 km/h. ¿Hacia dónde se dirige el humo?\n 1)Norte \n 2)Sur \n 3)Este \n 4)ninguno \n 5)Oeste \n 6)Poniente',
    answer: 4 // Los trenes eléctricos no echan humo
  },
  {
    question: 'Si 5 máquinas hacen 5 artículos en 5 minutos, ¿cuánto tiempo tardarán 100 máquinas en hacer 100 artículos? Responde solo con el numero de minutos',
    answer: 5 // Siguen tardando 5 minutos
  }
];

interface DatosAprendizaje {
  historial: Record<string, number>;
  total_aprendido: number;
}

class IA_Ahorcado {
  private letras_comunes: string[];
  private datos: DatosAprendizaje;
  private palabras_adivinadas: string[];

  constructor(datosAprendizaje: DatosAprendizaje) {
    // Letras comunes como fallback, pero la IA aprenderá sus propias preferencias
    this.letras_comunes = ['e', 'a', 'o', 's', 'n', 'r', 'i', 'l', 'd', 't'];
    this.datos = datosAprendizaje;
    this.palabras_adivinadas = [];
  }

  // 🔄 GUARDAR APRENDIZAJE - Actualiza y guarda lo aprendido
  guardar_aprendizaje(): void {
    // Calcular total aprendido sumando todos los valores del historial
    this.datos.total_aprendido = Object.values(this.datos.historial).reduce((sum, value) => sum + value, 0);
    
    // Guardar en localStorage para persistir entre sesiones
    guardarDatosIA(this.datos);
    
    console.log("💾 IA guardada - Total aprendido:", this.datos.total_aprendido);
  }

  // 🧠 APRENDER DE CADA PALABRA - Método principal de aprendizaje
  aprender_de_palabra(palabra_adivinada: string, letras_usadas: string[]): void {
    console.log("🧠 IA aprendiendo de palabra:", palabra_adivinada);
    
    // 1. APRENDER DE LETRAS USADAS (con diferente peso para aciertos/errores)
    for (let letra of letras_usadas) {
      // Si la letra no existe en el historial, inicializarla
      if (!this.datos.historial[letra]) {
        this.datos.historial[letra] = 1; // Valor inicial para letras nuevas
      }
      
      // 📊 Dar más peso a letras correctas (3 puntos) que a incorrectas (0.5 puntos)
      if (palabra_adivinada.includes(letra)) {
        this.datos.historial[letra] += 3; // Acierto - la letra es útil
        console.log(`   ✅ Aprendió acierto con '${letra}': +3`);
      } else {
        this.datos.historial[letra] += 0.5; // Error - pero al menos se intentó
        console.log(`   ❌ Aprendió error con '${letra}': +0.5`);
      }
    }

    // 2. APRENDER PATRONES - Guardar palabras completas para análisis futuro
    this.palabras_adivinadas.push(palabra_adivinada);
    
    // 3. APRENDER COMBINACIONES DE LETRAS - Dígrafos comunes en español
    this.aprender_combinaciones(palabra_adivinada);
    
    // 💾 Guardar todo el aprendizaje
    this.guardar_aprendizaje();
    
    // 📈 Mostrar estadísticas en consola para debugging
    this.mostrar_estadisticas();
  }

  // 🔤 APRENDER COMBINACIONES - Mejora el reconocimiento de patrones
  private aprender_combinaciones(palabra: string): void {
    // Dígrafos comunes en español (2 letras que forman un sonido)
    const digrafos_comunes = ['ch', 'll', 'qu', 'rr', 'gu', 'gü'];
    
    for (let digrafo of digrafos_comunes) {
      if (palabra.includes(digrafo)) {
        // 📚 Dar bonus a ambas letras del dígrafo cuando aparecen juntas
        this.datos.historial[digrafo[0]] += 1;
        this.datos.historial[digrafo[1]] += 1;
        console.log(`   🔤 Aprendió dígrafo '${digrafo}': bonus +1 a ambas letras`);
      }
    }
  }

  // 📊 MOSTRAR ESTADÍSTICAS - Para debugging y ver qué está aprendiendo
  private mostrar_estadisticas(): void {
    const stats = this.obtener_estadisticas();
    console.log("📊 Estadísticas IA - Top 5 letras:", stats.topLetras.slice(0, 5));
  }

  // 💡 SUGERIR LETRA - Método principal para ayudar al jugador
  sugerir_letra(letras_probadas: string[], palabra_actual?: string): string | null {
    console.log("💡 IA buscando sugerencia... Letras probadas:", letras_probadas);
    
    // 🎯 ESTRATEGIA 1: USAR TODO EL ALFABETO COMO BASE
    let letras_posibles: Record<string, number> = {};
    const alfabeto = 'abcdefghijklmnñopqrstuvwxyz'; // Alfabeto español completo
    
    for (let letra of alfabeto) {
      // Solo considerar letras que no se han probado
      if (!letras_probadas.includes(letra)) {
        // Usar frecuencia aprendida o valor por defecto si es nueva
        letras_posibles[letra] = this.datos.historial[letra] || 1;
      }
    }

    // 🎯 ESTRATEGIA 2: USAR CONTEXTO DE LA PALABRA ACTUAL (si hay pistas)
    if (palabra_actual && palabra_actual.includes('_')) {
      const sugerencia_contexto = this.sugerir_por_contexto(palabra_actual, letras_probadas);
      if (sugerencia_contexto) {
        console.log(`   🎯 Sugerencia por contexto: '${sugerencia_contexto}'`);
        return sugerencia_contexto;
      }
    }

    // 🎯 ESTRATEGIA 3: PRIORIZAR VOCALES AL INICIO
    if (this.deberia_sugerir_vocal(letras_probadas, palabra_actual)) {
      const vocal = this.sugerir_vocal(letras_probadas);
      if (vocal) {
        console.log(`   🅰️ Sugerencia vocal: '${vocal}'`);
        return vocal;
      }
    }

    // 🎯 ESTRATEGIA 4: ELEGIR MEJOR LETRA BASADA EN APRENDIZAJE
    if (Object.keys(letras_posibles).length > 0) {
      const mejor_letra = this.elegir_mejor_letra(letras_posibles);
      console.log(`   🏆 Mejor letra según aprendizaje: '${mejor_letra}'`);
      return mejor_letra;
    }
    
    // 🎯 ESTRATEGIA 5: FALLBACK A LETRAS COMUNES (último recurso)
    for (let letra of this.letras_comunes) {
      if (!letras_probadas.includes(letra)) {
        console.log(`   🔄 Fallback a letra común: '${letra}'`);
        return letra;
      }
    }
    
    console.log("   ❌ No hay sugerencias disponibles");
    return null;
  }

  // 🔍 SUGERIR POR CONTEXTO - Analiza patrones en la palabra parcial
  private sugerir_por_contexto(palabra: string, letras_probadas: string[]): string | null {
    // 📚 Patrones comunes en español (letra que suele seguir a ciertos patrones)
    const patrones_comunes: Record<string, string> = {
      'qu': 'e',    // que, qui
      'gu': 'e',    // gue, gui
      'ci': 'a',    // cia, cio
      'll': 'a',    // lla, lle
      'ch': 'e',    // che, cha
      'br': 'a',    // bra, bre
      'bl': 'a',    // bla, ble
      'tr': 'e',    // tre, tra
      'cr': 'e',    // cre, cra
    };

    // 🔎 Buscar patrones en la palabra actual
    for (let i = 0; i < palabra.length - 1; i++) {
      const par_actual = palabra[i] + palabra[i + 1];
      const letra_sugerida = patrones_comunes[par_actual];
      
      // ✅ Verificar que existe el patrón y la letra sugerida no ha sido probada
      if (letra_sugerida && !letras_probadas.includes(letra_sugerida)) {
        return letra_sugerida;
      }
    }

    return null;
  }

  // 🅰️ DECIDIR SI SUGERIR VOCAL - Estrategia para palabras largas
  private deberia_sugerir_vocal(letras_probadas: string[], palabra_actual?: string): boolean {
    const vocales = ['a', 'e', 'i', 'o', 'u'];
    const vocales_probadas = letras_probadas.filter(l => vocales.includes(l));
    
    // 📏 Sugerir vocal si: pocas vocales probadas Y palabra es larga
    return vocales_probadas.length < 2 && (!palabra_actual || palabra_actual.length > 5);
  }

  // 🅰️ SUGERIR VOCAL - Ordenadas por frecuencia en español
  private sugerir_vocal(letras_probadas: string[]): string | null {
    const vocales_orden = ['e', 'a', 'o', 'i', 'u']; // Orden de frecuencia en español
    for (let vocal of vocales_orden) {
      if (!letras_probadas.includes(vocal)) {
        return vocal;
      }
    }
    return null;
  }

  // 🎲 ELEGIR MEJOR LETRA - Balance entre explotación y exploración
  private elegir_mejor_letra(letras_posibles: Record<string, number>): string {
    // 🎯 ESTRATEGIA: 80% elegir entre top 3, 20% explorar otras opciones
    const umbral_aleatoriedad = 0.2; // 20% de chance de explorar
    
    if (Math.random() < umbral_aleatoriedad) {
      // 🔍 EXPLORACIÓN: elegir aleatoriamente entre las top 5
      const top5 = Object.keys(letras_posibles)
        .sort((a, b) => letras_posibles[b] - letras_posibles[a])
        .slice(0, 5);
      const letra_explorada = top5[Math.floor(Math.random() * top5.length)];
      console.log(`   🔍 Exploración: '${letra_explorada}' (aleatoria de top 5)`);
      return letra_explorada;
    } else {
      // 🏆 EXPLOTACIÓN: elegir la mejor letra disponible
      const mejor_letra = Object.keys(letras_posibles).reduce((a, b) => 
        letras_posibles[a] > letras_posibles[b] ? a : b
      );
      console.log(`   🏆 Explotación: '${mejor_letra}' (mejor frecuencia)`);
      return mejor_letra;
    }
  }

  // 📈 OBTENER ESTADÍSTICAS - Para mostrar el estado del aprendizaje
  obtener_estadisticas(): { topLetras: [string, number][], totalAprendido: number } {
    const topLetras = Object.entries(this.datos.historial)
      .sort((a, b) => b[1] - a[1]) // Ordenar descendente por frecuencia
      .slice(0, 10); // Top 10 letras
    
    return {
      topLetras,
      totalAprendido: this.datos.total_aprendido
    };
  }
}

export const GameHandler = ({ difficulty }: GamePageProps) => {
  const navigate = useNavigate();
  const [selectedWord, setSelectedWord] = useState("");
  const [display, setDisplay] = useState<string[]>([]);
  const [time, setTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [finalScore, setFinalScore] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<{question: string, answer: number} | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [redeemedTime, setRedeemedTime] = useState(false);
  const [gameActive, setGameActive] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  // Instanciar la IA
  const ia = new IA_Ahorcado(datos);

  const normalizeLetter = (char: string): string => {
    if (char === 'ñ' || char === 'Ñ') return 'ñ';
    return char.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const goToChooseDif = () => {
    setShowPopup(false);
    navigate('/chooseDif');
  };
  
  const timerRef = useRef<number | null>(null);

  const calculateScore = (remainingTime: number): number => {
    const baseScores = {
      facil: 50,
      medio: 75,
      dificil: 100
    };
    
    const timeBonus = Math.floor(remainingTime * 0.75);
    return baseScores[difficulty] + timeBonus;
  };

  const updateUserStats = (score: number) => {
    const currentUser = userService.getCurrentUser();
    if (currentUser) {
      const newHighScore = Math.max(currentUser.highScore || 0, score);
      userService.updateHighScore(currentUser.username, newHighScore);
      console.log('Stats updated:', { username: currentUser.username, newHighScore });
    }
  };

  // Actualizar sugerencia cuando cambian las letras adivinadas
  useEffect(() => {
    const guessedArray = Array.from(guessedLetters);
    const newSuggestion = ia.sugerir_letra(guessedArray);
    setSuggestion(newSuggestion);
  }, [guessedLetters]);

  useEffect(() => {
    startGame();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [difficulty]);

  const startGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setGameActive(true); 
      setShowPopup(false);
    }

    const words = wordBank[difficulty];
    const newWord = words[Math.floor(Math.random() * words.length)];
    
    const initialTime = difficulty === "facil" ? 120 : difficulty === "medio" ? 90 : 60;

    setSelectedWord(newWord);
    setDisplay(Array(newWord.length).fill("_"));
    setTime(initialTime);
    setGameOver(false);
    setMessage("");
    setGuessedLetters(new Set());
    setFinalScore(0);
    setShowQuestion(false);
    setCurrentQuestion(null);
    setUserAnswer("");
    setRedeemedTime(false);

    timerRef.current = setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameOver(true);
          setMessage(`💥 ¡Boom! Perdiste. Era ${newWord}`);
          // La IA aprende también al perder
          ia.aprender_de_palabra(newWord, Array.from(guessedLetters));
          setPopupMessage(`💥 ¡Boom! La palabra era: ${newWord} 💥`);
          setShowPopup(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleGuess = (letter: string) => {
    if (gameOver || showQuestion || !gameActive) return;

    const normalizedGuess = normalizeLetter(letter);
    let found = false;

    const newDisplay = [...display];
    selectedWord.split("").forEach((char, i) => {
      const normalizedChar = normalizeLetter(char);
      
      if (normalizedChar === normalizedGuess) {
        newDisplay[i] = char;
        found = true;
      }
    });

    setDisplay(newDisplay);
    setGuessedLetters(prev => new Set([...prev, letter.toLowerCase()]));

    if (!found) {
      // Penalización por letra incorrecta: -5 segundos
      setTime(prevTime => Math.max(0, prevTime - 5));
      
      // Mostrar pregunta de tiempo extra cuando el tiempo sea bajo
      if (time <= 30 && !redeemedTime && !showQuestion) {
        setShowQuestion(true);
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        setCurrentQuestion(randomQuestion);
      }
    } else {
      // La IA aprende cuando acierta
      ia.aprender_de_palabra(selectedWord, [letter]);
    }

    // Verificar victoria
    if (!newDisplay.includes("_")) {
      const score = calculateScore(time);
      setFinalScore(score);
      updateUserStats(score);
      
      if (timerRef.current) clearInterval(timerRef.current);
      setGameOver(true);
      setMessage(`🎉 ¡Ganaste!`);
      setPopupMessage(`🎉 ¡Felicidades! Ganaste con ${score} puntos 🎉`);
      setShowPopup(true);
    }
  };

  const handleQuestionAnswer = () => {
    if (!currentQuestion) return;

    const userAnswerNum = parseInt(userAnswer);
    if (userAnswerNum === currentQuestion.answer) {
      // +30 segundos por respuesta correcta
      setTime(prevTime => prevTime + 30);
      setRedeemedTime(true);
      setShowQuestion(false);
      setCurrentQuestion(null);
      setUserAnswer("");
      setGameActive(true); // 🆕 Reactivar juego
      setMessage("✅ +30 segundos extra!");
      
      setTimeout(() => {
        const inputElement = document.getElementById("letter-input") as HTMLInputElement;
        if (inputElement) inputElement.focus();
      }, 50);
      
      setTimeout(() => setMessage(""), 3000);
    } else {
      setShowQuestion(false);
      setCurrentQuestion(null);
      setUserAnswer("");
      setGameActive(true); // 🆕 Reactivar juego
      setMessage("❌ Respuesta incorrecta. Sigue jugando!");
      
      setTimeout(() => {
        const inputElement = document.getElementById("letter-input") as HTMLInputElement;
        if (inputElement) inputElement.focus();
      }, 50);
      
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSubmit = () => {
    const inputElement = document.getElementById("letter-input") as HTMLInputElement;
    if (inputElement) {
      const letter = inputElement.value;
      if (letter.length === 1) {
        handleGuess(letter);
        inputElement.value = "";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showQuestion) {
        handleQuestionAnswer();
      } else {
        handleSubmit();
      }
    }
  };

  const useSuggestion = () => {
    if (suggestion) {
      handleGuess(suggestion);
    }
  };

  return (
    <div className="game-container">
      <h1>Boomwords - {difficulty}</h1>
      
      <div className="game-info">
        <div id="timer" className="timer">Tiempo: {time}s</div>
        <div id="message" className="message">{message}</div>
        {finalScore > 0 && (
          <div className="final-score">Puntuación Final: {finalScore}</div>
        )}
      </div>

      <div id="word-display" className="word-display">
        {display.map((letter, index) => (
          <LetterCard 
            key={index}
            letter={letter}
            isRevealed={letter !== '_'}
            isSpace={letter === ' '}
          />
        ))}
      </div>

      {!showQuestion ? (
        <>
          <div className="suggestion-section">
            {suggestion && time <= 40 && (
              <div className="suggestion">
                <span>💡 CONSEJO: '{suggestion.toUpperCase()}'</span>
                <button onClick={useSuggestion} className="use-suggestion-btn">
                  Usar esta letra
                </button>
              </div>
            )}
          </div>

          <div className="input-section">
            <input 
              id="letter-input"
              type="text" 
              maxLength={1}
              placeholder="Introduce una letra"
              disabled={gameOver || !gameActive}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="guessed-letters">
            Letras usadas: {Array.from(guessedLetters).join(", ")}
          </div>
        </>
      ) : (
        <div className="question-section">
          <h3>¡Oportunidad de tiempo extra!</h3>
          <p>Responde correctamente para ganar +30 segundos:</p>
          <p className="question-text">{currentQuestion?.question}</p>
          <input 
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Tu respuesta"
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleQuestionAnswer}>
            Responder
          </button>
        </div>
      )}
      <GamePopUp
      isOpen={showPopup}
      message={popupMessage}
      onPlayAgain={startGame}
      onChooseDifficulty={goToChooseDif}
    />
    </div>
  );
};