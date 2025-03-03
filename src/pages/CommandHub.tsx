import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import styles from '../styles/CommandHub.module.css';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  className: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'quick-race',
    title: 'QUICK RACE',
    description: 'Jump straight into the action!',
    icon: '🏁',
    route: '/race-rituals',
    className: styles.quickRace
  },
  {
    id: 'campaign',
    title: 'THROTTLE SCRAWL',
    description: 'Master the campaign mode',
    icon: '🏆',
    route: '/career-mode',
    className: styles.campaign
  },
  {
    id: 'track-editor',
    title: 'APEX ARCHITECTS',
    description: 'Design your dream tracks',
    icon: '📐',
    route: '/track-architects',
    className: styles.trackEditor
  },
  {
    id: 'garage',
    title: 'PIT SUITE',
    description: 'Tune and customize your rides',
    icon: '🔧',
    route: '/garage',
    className: styles.garage
  },
  {
    id: 'leaderboard',
    title: 'HALL OF TIMES',
    description: 'View global rankings',
    icon: '⏱️',
    route: '/hall-of-times',
    className: styles.leaderboard
  },
  {
    id: 'options',
    title: 'CONTROL TOWER',
    description: 'Adjust your settings',
    icon: '🎮',
    route: '/settings',
    className: styles.options
  },
  {
    id: 'archive',
    title: 'THE ARCHIVE',
    description: 'Browse custom tracks',
    icon: '📚',
    route: '/track-archive',
    className: styles.archive
  }
];

// Back button component
const BackToMenu: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button 
      className={styles.backButton}
      onClick={() => navigate('/')}
    >
      {'< Back to Menu'}
    </button>
  );
};

export const CommandHub: React.FC = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { tracks, selectedTrack, selectedVehicle } = useGameStore();

  const handleMenuSelect = (route: string) => {
    setIsTransitioning(true);
    const element = document.querySelector(`.${styles.container}`);
    if (element) {
      element.classList.add(styles.transition);
      setTimeout(() => {
        navigate(route);
      }, 300);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isTransitioning) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev === 0 ? MENU_ITEMS.length - 1 : prev - 1
        );
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev === MENU_ITEMS.length - 1 ? 0 : prev + 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        handleMenuSelect(MENU_ITEMS[selectedIndex].route);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, isTransitioning]);

  // Get track of the day (first official track for now)
  const trackOfTheDay = tracks.find(track => track.classification === 'official');

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>FITTIPALDI</h1>
          <h2 className={styles.subtitle}>RACING LABS</h2>
        </div>

        <div className={styles.menuContainer}>
          {MENU_ITEMS.map((item, index) => (
            <button
              key={item.id}
              className={`${styles.menuItem} ${item.className}`}
              onClick={() => !isTransitioning && handleMenuSelect(item.route)}
              onMouseEnter={() => !isTransitioning && setSelectedIndex(index)}
              aria-selected={selectedIndex === index}
              disabled={isTransitioning}
            >
              <span className={styles.icon}>{item.icon}</span>
              <div className={styles.content}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className={styles.trackOfTheDay}>
          <h4>TRACK OF THE DAY</h4>
          <div className={styles.trackPreview}>
            <div className={styles.trackInfo}>
              <p className={styles.trackName}>
                {trackOfTheDay?.name || 'LOADING...'}
              </p>
              <p className={styles.trackStats}>
                Best: 1:24.653 - Senna Jr.
              </p>
            </div>
            <div className={styles.miniMap}>
              {/* Placeholder for track minimap */}
              🏎️
            </div>
          </div>
        </div>
      </div>

      <div className={styles.debugPanel}>
        <p>PHASE: COMMAND_HUB</p>
        <p>TRACK: {selectedTrack?.name || 'NONE'}</p>
        <p>VEHICLE: {selectedVehicle?.name || 'NONE'}</p>
        <p>TRANSITIONING: {isTransitioning ? 'YES' : 'NO'}</p>
      </div>
    </div>
  );
};

// Export the BackToMenu component for use in other pages
export { BackToMenu }; 