import { useNavigate } from 'react-router-dom';
import './mainPage.css'

export const MainPage = () => {
  const navigate = useNavigate();
  const goToSetName = () => {
    navigate('/setYourName');
  }
  
  return (
    <div className="main-page-body">
      <div className="gameContainer">
        <h1 className="gameTitle">Boomwords</h1>
        <div className="button-wrapper bomb-position-adjustment">
          <button className="glitched-button" onClick={goToSetName}>
            JUGAR
            <div className="glitch-layers">
              <div className="glitch-layer layer-1">JUGAR</div> 
              <div className="glitch-layer layer-2">JUGAR</div>
            </div>
            <div className="noise"></div>
            <div className="glitch-slice"></div>
          </button>
        </div>
      </div>
    </div>
  );
}