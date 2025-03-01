import React from 'react';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenTrackEditor: () => void;
  onOpenGarage: () => void;
  onOpenLeaderboard: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenTrackEditor,
  onOpenGarage,
  onOpenLeaderboard
}) => {
  return (
    <div className="main-menu">
      <h1>ApexArchitects</h1>
      <div className="menu-container">
        <button onClick={onStartGame}>Start Race</button>
        <button onClick={onOpenTrackEditor}>Track Editor</button>
        <button onClick={onOpenGarage}>Garage</button>
        <button onClick={onOpenLeaderboard}>Leaderboard</button>
      </div>
      <div className="footer">
        <p>© 2023 ApexArchitects - A 2D Creative Racing Game</p>
      </div>
    </div>
  );
};

export default MainMenu; 