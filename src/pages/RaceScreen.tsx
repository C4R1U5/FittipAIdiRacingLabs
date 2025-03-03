import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import styles from '../styles/RaceScreen.module.css';

export const RaceScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentTrack, currentVehicle } = useGameStore();

  if (!currentTrack || !currentVehicle) {
    navigate('/race-rituals');
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.trackInfo}>
          <h1>{currentTrack.name}</h1>
          <div className={styles.trackDetails}>
            <span className={styles.surface}>{currentTrack.surface}</span>
            <span className={styles.difficulty}>{currentTrack.difficulty}</span>
          </div>
        </div>

        <div className={styles.vehicleInfo}>
          <div
            className={styles.vehicleColor}
            style={{ backgroundColor: currentVehicle.visuals.color }}
          />
          <h2>{currentVehicle.name}</h2>
        </div>
      </div>

      <div className={styles.raceView}>
        <div className={styles.placeholder}>
          <p>Race View Coming Soon</p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <label>Speed</label>
              <span>{currentVehicle.speed}</span>
            </div>
            <div className={styles.stat}>
              <label>Acceleration</label>
              <span>{currentVehicle.acceleration}</span>
            </div>
            <div className={styles.stat}>
              <label>Handling</label>
              <span>{currentVehicle.handling}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.exitButton}
          onClick={() => navigate('/race-rituals')}
        >
          EXIT RACE
        </button>
      </div>
    </div>
  );
}; 