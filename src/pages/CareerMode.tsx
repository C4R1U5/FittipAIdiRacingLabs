import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/CommandHub.module.css';

const CareerMode: React.FC = () => {
  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        Back to Menu
      </Link>
      <div className={styles.contentWrapper}>
        <h1>Throttle Scrawl - Career Mode</h1>
        <p>Career Mode features coming soon...</p>
      </div>
    </div>
  );
};

export default CareerMode; 