import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/CommandHub.module.css';

const Settings: React.FC = () => {
  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        Back to Menu
      </Link>
      <div className={styles.contentWrapper}>
        <h1>Control Tower - Settings</h1>
        <p>Game settings and configurations coming soon...</p>
      </div>
    </div>
  );
};

export default Settings; 