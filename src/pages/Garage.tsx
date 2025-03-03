import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/CommandHub.module.css';

const Garage: React.FC = () => {
  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        Back to Menu
      </Link>
      <div className={styles.contentWrapper}>
        <h1>Pit Suite - Garage</h1>
        <p>Vehicle customization and management coming soon...</p>
      </div>
    </div>
  );
};

export default Garage; 