import { createHashRouter, useParams } from 'react-router-dom';  // 🆕 Cambiar a createHashRouter
import { MainPage } from '../pages/MainPage/mainPage';
import { SetYourName } from '../pages/setName/setYourName';
import { ChooseDif } from '../pages/chooseDif/chooseDif'
import { GameHandler } from '../pages/game/gameHanler';
import { type Difficulty, wordBank } from '../components/wordBanks';

export const resolveDifficulty = (difficulty?: string): Difficulty => {
  if (difficulty && difficulty in wordBank) {
    return difficulty as Difficulty;
  }
  return 'facil';
};

// Extracts the URL parameter
const GameHandlerWrapper = () => {
  const { difficulty } = useParams();
  
  // Validates difficulty and provide default
  const validDifficulty = resolveDifficulty(difficulty);
  
  return <GameHandler difficulty={validDifficulty} />;
};

// 🆕 Cambiar a createHashRouter
export default createHashRouter([
  {
    path: '/',
    element: <MainPage />,
  },
  {
    path: '/setYourName',
    element: <SetYourName />,
  },
  {
    path: '/chooseDif',
    element: <ChooseDif />,
  },
  {
    path: '/game/:difficulty',
    element: <GameHandlerWrapper />, 
  },
]);
