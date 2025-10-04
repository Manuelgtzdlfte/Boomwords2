import { createHashRouter, useParams } from 'react-router-dom';  // 🆕 Cambiar a createHashRouter
import { MainPage } from '../pages/MainPage/mainPage';
import { SetYourName } from '../pages/setName/setYourName';
import { ChooseDif } from '../pages/chooseDif/chooseDif'
import { GameHandler } from '../pages/game/gameHanler';

// Extracts the URL parameter
const GameHandlerWrapper = () => {
  const { difficulty } = useParams();
  
  // Validates difficulty and provide default
  const validDifficulty = difficulty as 'facil' | 'medio' | 'dificil';
  
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