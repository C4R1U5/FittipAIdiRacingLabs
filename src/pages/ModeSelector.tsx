import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/ModeSelector.module.css';

export const ModeSelector: React.FC = () => {
  const navigate = useNavigate();

  const handleModeSelect = (mode: string) => {
    switch (mode) {
      case 'quick-race':
        navigate('/race-rituals');
        break;
      case 'throttle-scrawl':
        navigate('/career');
        break;
      case 'apex-architects':
        navigate('/track-architects');
        break;
      case 'pit-suite':
        navigate('/garage');
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>FITTIPALDI</h1>
        <h2 className={styles.subtitle}>RACING LABS</h2>
      </div>

      <div className={styles.menuContainer}>
        <button
          className={`${styles.menuButton} ${styles.quickRace}`}
          onClick={() => handleModeSelect('quick-race')}
        >
          <span className={styles.icon}>🏁</span>
          <div className={styles.buttonContent}>
            <h3>QUICK RACE</h3>
            <p>Jump straight into the action!</p>
          </div>
        </button>

        <button
          className={`${styles.menuButton} ${styles.career}`}
          onClick={() => handleModeSelect('throttle-scrawl')}
        >
          <span className={styles.icon}>🏆</span>
          <div className={styles.buttonContent}>
            <h3>THROTTLE SCRAWL</h3>
            <p>Tackle the career campaign</p>
          </div>
        </button>

        <button
          className={`${styles.menuButton} ${styles.trackBuilder}`}
          onClick={() => handleModeSelect('apex-architects')}
        >
          <span className={styles.icon}>📐</span>
          <div className={styles.buttonContent}>
            <h3>APEX ARCHITECTS</h3>
            <p>Design your own racing tracks</p>
          </div>
        </button>

        <button
          className={`${styles.menuButton} ${styles.garage}`}
          onClick={() => handleModeSelect('pit-suite')}
        >
          <span className={styles.icon}>🔧</span>
          <div className={styles.buttonContent}>
            <h3>PIT SUITE</h3>
            <p>Customize and tune your vehicles</p>
          </div>
        </button>
      </div>

      <div className={styles.footer}>
        <div className={styles.trackOfTheDay}>
          <h4>TRACK OF THE DAY</h4>
          <p>SUNSET SPEEDWAY</p>
          <small>Best: 1:24.653 - Senna Jr.</small>
        </div>
      </div>
    </div>
  );
}; 