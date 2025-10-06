import './gamePopUp.css'

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
            <button 
                className="popup-button play-again-btn"
                onClick={onPlayAgain}
            >
                🎮 Jugar Otra Vez
            </button>
            <button 
                className="popup-button difficulty-btn"
                onClick={onChooseDifficulty}
            >
                📊 Elegir Dificultad
            </button>
            </div>
        </div>
        </div>
    );

}
