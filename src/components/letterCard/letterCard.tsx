import './LetterCard.css';

interface LetterCardProps {
  letter: string;
  isRevealed?: boolean;
  isSpace?: boolean;
}

export const LetterCard = ({ letter, isRevealed = false, isSpace = false }: LetterCardProps) => {
  if (isSpace) {
    return <div className="letter-card space"></div>;
  }

  return (
    <div className={`letter-card ${isRevealed ? 'revealed' : 'hidden'}`}>
      <div className="card-front">
        <span className="letter">_</span>
      </div>
      <div className="card-back">
        <span className="letter">{letter.toUpperCase()}</span>
      </div>
    </div>
  );
};
