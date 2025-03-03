import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/TrackArchitects.module.css';

export const TrackArchitects: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>APEX ARCHITECTS</h1>
        <p>Track Builder Coming Soon</p>
      </div>
      <div className={styles.content}>
        <div className={styles.placeholder}>
          <p>Track design tools are under construction</p>
          <button onClick={() => navigate('/')}>Return to Menu</button>
        </div>
      </div>
    </div>
  );
}; 