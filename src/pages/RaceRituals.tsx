import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { BackToMenu } from './CommandHub';
import styles from '../styles/RaceRituals.module.css';
import type { Track } from '../types/Track';
import type { Vehicle } from '../types/Vehicle';

export const RaceRituals: React.FC = () => {
  const navigate = useNavigate();
  const {
    availableTracks,
    availableVehicles,
    selectedTrack,
    selectedVehicle,
    selectTrack,
    selectVehicle,
    setCurrentTrack,
    setCurrentVehicle,
  } = useGameStore();

  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);

  const handleTrackSelect = (track: Track) => {
    selectTrack(track.id);
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    selectVehicle(vehicle.id);
  };

  const handlePrevVehicle = () => {
    setCurrentVehicleIndex((prev) =>
      prev === 0 ? availableVehicles.length - 1 : prev - 1
    );
  };

  const handleNextVehicle = () => {
    setCurrentVehicleIndex((prev) =>
      prev === availableVehicles.length - 1 ? 0 : prev + 1
    );
  };

  const handleStartRace = () => {
    if (selectedTrack && selectedVehicle) {
      setCurrentTrack(selectedTrack);
      setCurrentVehicle(selectedVehicle);
      navigate('/race');
    }
  };

  return (
    <div className={styles.container}>
      <BackToMenu />
      <div className={styles.header}>
        <h1>RACE RITUALS</h1>
        <p>Select your track and vehicle</p>
      </div>

      <div className={styles.content}>
        <section className={styles.trackSelection}>
          <h2>SELECT TRACK</h2>
          <div className={styles.trackGrid}>
            {availableTracks.map((track) => (
              <button
                key={track.id}
                className={`${styles.trackCard} ${
                  selectedTrack?.id === track.id ? styles.selected : ''
                } ${track.classification === 'invalid' ? styles.invalid : ''}`}
                onClick={() => handleTrackSelect(track)}
              >
                <div className={styles.trackInfo}>
                  <div className={styles.trackHeader}>
                    <h3>{track.name}</h3>
                    {track.classification === 'invalid' && (
                      <span className={styles.warningBadge} title={track.validationErrors?.join('\n')}>
                        ⚠️
                      </span>
                    )}
                  </div>
                  <div className={styles.trackDetails}>
                    <span className={styles.surface}>{track.surface}</span>
                    <span className={styles.difficulty}>{track.difficulty}</span>
                    <span className={styles.classification}>{track.classification}</span>
                  </div>
                  <p>{track.commentary}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.vehicleSelection}>
          <h2>SELECT VEHICLE</h2>
          <div className={styles.vehicleCarousel}>
            <button
              className={`${styles.carouselButton} ${styles.prev}`}
              onClick={handlePrevVehicle}
            >
              ◀
            </button>

            <div className={styles.vehicleDisplay}>
              {availableVehicles.map((vehicle, index) => (
                <div
                  key={vehicle.id}
                  className={`${styles.vehicleCard} ${
                    index === currentVehicleIndex ? styles.active : ''
                  } ${selectedVehicle?.id === vehicle.id ? styles.selected : ''}`}
                  style={{
                    transform: `translateX(${(index - currentVehicleIndex) * 100}%)`,
                  }}
                  onClick={() => handleVehicleSelect(vehicle)}
                >
                  <div
                    className={styles.vehicleColor}
                    style={{ backgroundColor: vehicle.visuals.color }}
                  />
                  <h3>{vehicle.name}</h3>
                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <label>Speed</label>
                      <div className={styles.statBar}>
                        <div style={{ width: `${vehicle.speed}%` }} />
                      </div>
                    </div>
                    <div className={styles.stat}>
                      <label>Acceleration</label>
                      <div className={styles.statBar}>
                        <div style={{ width: `${vehicle.acceleration}%` }} />
                      </div>
                    </div>
                    <div className={styles.stat}>
                      <label>Handling</label>
                      <div className={styles.statBar}>
                        <div style={{ width: `${vehicle.handling}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              className={`${styles.carouselButton} ${styles.next}`}
              onClick={handleNextVehicle}
            >
              ▶
            </button>
          </div>
        </section>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.startButton}
          disabled={!selectedTrack || !selectedVehicle}
          onClick={handleStartRace}
        >
          START RACE
        </button>
      </div>
    </div>
  );
}; 