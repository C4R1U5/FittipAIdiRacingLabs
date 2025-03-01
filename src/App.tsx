import React, { useEffect } from 'react';
import MainMenu from './components/MainMenu';
import TrackCanvas from './components/TrackCanvas';
import TrackEditor from './components/TrackEditor';
import Leaderboard from './components/Leaderboard';
import Garage from './components/Garage';
import { useGameStore } from './state/gameStore';
import './styles.css';

const App: React.FC = () => {
  const { 
    currentScreen,
    isRacing,
    availableVehicles,
    selectedVehicleId,
    availableTracks,
    selectedTrackId,
    editorTrack,
    player,
    aiRacers,
    leaderboards,
    setCurrentScreen,
    setIsRacing,
    selectVehicle,
    selectTrack,
    startRace,
    endRace,
    createNewTrack,
    saveTrack,
    addLeaderboardEntry
  } = useGameStore();
  
  // Find the selected track
  const selectedTrack = selectedTrackId 
    ? availableTracks.find(track => track.id === selectedTrackId)
    : null;
  
  // Handle key presses for player controls during race
  useEffect(() => {
    if (!isRacing || !player) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      switch(event.key) {
        case 'ArrowUp':
          player.isAccelerating = true;
          break;
        case 'ArrowDown':
          player.isBraking = true;
          break;
        case 'ArrowLeft':
          player.isTurningLeft = true;
          break;
        case 'ArrowRight':
          player.isTurningRight = true;
          break;
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      switch(event.key) {
        case 'ArrowUp':
          player.isAccelerating = false;
          break;
        case 'ArrowDown':
          player.isBraking = false;
          break;
        case 'ArrowLeft':
          player.isTurningLeft = false;
          break;
        case 'ArrowRight':
          player.isTurningRight = false;
          break;
        case 'Escape':
          // End race early
          setIsRacing(false);
          setCurrentScreen('menu');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRacing, player, setIsRacing, setCurrentScreen]);
  
  // End race after player finishes
  const handleRaceFinished = (time: number) => {
    endRace(time);
  };
  
  return (
    <div className="app">
      {currentScreen === 'menu' && (
        <MainMenu
          onStartGame={() => {
            if (selectedVehicleId && selectedTrackId) {
              startRace();
            } else {
              alert('Please select a vehicle and track first!');
            }
          }}
          onOpenTrackEditor={() => createNewTrack()}
          onOpenGarage={() => setCurrentScreen('garage')}
          onOpenLeaderboard={() => setCurrentScreen('leaderboard')}
        />
      )}
      
      {currentScreen === 'race' && selectedTrack && player && (
        <TrackCanvas
          track={selectedTrack}
          vehicles={[player.vehicle, ...aiRacers.map(racer => racer.vehicle)]}
          isRacing={isRacing}
        />
      )}
      
      {currentScreen === 'editor' && editorTrack && (
        <TrackEditor
          initialTrack={editorTrack}
          onSave={saveTrack}
          onCancel={() => setCurrentScreen('menu')}
        />
      )}
      
      {currentScreen === 'garage' && (
        <Garage
          availableVehicles={availableVehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={(vehicle) => selectVehicle(vehicle.id)}
          onClose={() => setCurrentScreen('menu')}
        />
      )}
      
      {currentScreen === 'leaderboard' && selectedTrack && (
        <Leaderboard
          entries={leaderboards[selectedTrackId as string]?.entries || []}
          trackName={selectedTrack.name}
          onClose={() => setCurrentScreen('menu')}
        />
      )}
    </div>
  );
};

export default App; 