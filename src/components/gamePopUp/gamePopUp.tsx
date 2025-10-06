import './gamePopUp.css';

interface GamePopupProps {
  isOpen: boolean;
  message: string;
  onPlayAgain: () => void;
  onChooseDifficulty: () => void;
}

export const GamePopUp = ({ isOpen, message, onPlayAgain, onChooseDifficulty }: GamePopupProps) => {
    if (!isOpen) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>{message}</h2>
                <div className="popup-buttons">
                    {/* Botón Jugar Otra Vez */}
                    <div className="button-wrapper">
                        <button 
                            className="glitched-button" 
                            onClick={onPlayAgain}
                        >
                            🎮 Jugar Otra Vez
                            <div className="glitch-layers">
                                <div className="glitch-layer layer-1">🎮 Jugar Otra Vez</div>
                                <div className="glitch-layer layer-2">🎮 Jugar Otra Vez</div>
                            </div>
                            <div className="noise"></div>
                            <div className="glitch-slice"></div>
                        </button>
                    </div>

                    {/* Botón Elegir Dificultad */}
                    <div className="button-wrapper">
                        <button 
                            className="glitched-button"
                            onClick={onChooseDifficulty}
                        >
                            🧩 Elegir Dificultad
                            <div className="glitch-layers">
                                <div className="glitch-layer layer-1">🧩 Elegir Dificultad</div>
                                <div className="glitch-layer layer-2">🧩 Elegir Dificultad</div>
                            </div>
                            <div className="noise"></div>
                            <div className="glitch-slice"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};