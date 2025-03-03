import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/CommandHub.module.css';

const HallOfTimes: React.FC = () => {
  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        Back to Menu
      </Link>
      <div className={styles.contentWrapper}>
        <h1>Hall of Times - Leaderboards</h1>
        <p>Global rankings and achievements coming soon...</p>
      </div>
    </div>
  );
};

export default HallOfTimes; 