import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/CommandHub.module.css';

const TrackArchive: React.FC = () => {
  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        Back to Menu
      </Link>
      <div className={styles.contentWrapper}>
        <h1>The Archive - Track Collection</h1>
        <p>Historical tracks and special events coming soon...</p>
      </div>
    </div>
  );
};

export default TrackArchive; 