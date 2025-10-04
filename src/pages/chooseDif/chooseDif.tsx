import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './chooseDif.css'
import { userService } from '../../components/userService/userService'; 

export const ChooseDif = () => {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({ 
    username: '', 
    highScore: 0, 
    gamesPlayed: 0 
  });
  
  useEffect(() => {
    // Get current user stats
    const currentUser = userService.getCurrentUser();
    if (currentUser) {
      setUserStats({
        username: currentUser.username,
        highScore: currentUser.highScore,
        gamesPlayed: currentUser.gamesPlayed
      });
    }
  }, []);
  
  const goToGame = (difficulty: string) => {
    console.log(`Selected difficulty: ${difficulty}`);
    navigate(`/game/${difficulty}`);
  }
  
  const handleLogout = () => {
    userService.logout();
    navigate('/'); 
  }
  
  return (
    <div className="chooseDif">
      {/* User Stats Panel */}
      <div className="user-stats-panel">
        <div className="stats-header">
          <h3>PLAYER STATS</h3>
          <button className="logout-btn" onClick={handleLogout}>LOGOUT</button>
        </div>
        <div className="stats-content">
          <div className="stat-item">
            <span className="stat-label">AGENT:</span>
            <span className="stat-value">{userStats.username || 'Guest'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">HIGH SCORE:</span>
            <span className="stat-value">{userStats.highScore}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">MISSIONS:</span>
            <span className="stat-value">{userStats.gamesPlayed}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">RANK:</span>
            <span className="stat-value">
              {userStats.highScore >= 1000 ? 'ELITE' : 
               userStats.highScore >= 500 ? 'VETERAN' : 
               userStats.highScore >= 100 ? 'AGENT' : 'ROOKIE'}
            </span>
          </div>
        </div>
        <div className="stats-footer">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min((userStats.highScore / 1000) * 100, 100)}%` }}
            ></div>
          </div>
          <span className="progress-text">NEXT RANK: {1000 - userStats.highScore} PTS</span>
        </div>
      </div>
      
      {/* Existing Difficulty Buttons */}
      <div className="difficulty-container">
        <div className="button-wrapper">
          <button className="glitched-button" onClick={() => goToGame('facil')}>
            Facil
            <div className="glitch-layers">
              <div className="glitch-layer layer-1">Facil</div> 
              <div className="glitch-layer layer-2">Facil</div>
            </div>
            <div className="noise"></div>
            <div className="glitch-slice"></div>
          </button>
        </div>
        
        <div className="button-wrapper">
          <button className="glitched-button" onClick={() => goToGame('medio')}>
            Medio
            <div className="glitch-layers">
              <div className="glitch-layer layer-1">Medio</div> 
              <div className="glitch-layer layer-2">Medio</div>
            </div>
            <div className="noise"></div>
            <div className="glitch-slice"></div>
          </button>
        </div>
        
        <div className="button-wrapper">
          <button className="glitched-button" onClick={() => goToGame('dificil')}>
            Dificil
            <div className="glitch-layers">
              <div className="glitch-layer layer-1">Dificil</div> 
              <div className="glitch-layer layer-2">Dificil</div>
            </div>
            <div className="noise"></div>
            <div className="glitch-slice"></div>
          </button>
        </div>
      </div>
      
      {/* Existing Radio Controls */}
      <div className="radio-controls">
        <div className="radio-item">
          <div className="radio-dot"></div>
          <span>RADIO</span>
        </div>
        <div className="radio-item">
          <div className="radio-dot"></div>
          <span>OFF</span>
        </div>
        <div className="tnt-label">TNT</div>
      </div>
    </div>
  );
}