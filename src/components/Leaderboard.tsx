import React from 'react';
import { LeaderboardEntry } from '../models/Leaderboard';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  trackName: string;
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, trackName, onClose }) => {
  // Sort entries by time (ascending)
  const sortedEntries = [...entries].sort((a, b) => a.time - b.time);
  
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="leaderboard">
      <h2>Leaderboard: {trackName}</h2>
      
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Position</th>
            <th>Player</th>
            <th>Vehicle</th>
            <th>Time</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.length > 0 ? (
            sortedEntries.map((entry, index) => (
              <tr key={entry.id} className={index === 0 ? 'first-place' : ''}>
                <td>{index + 1}</td>
                <td>{entry.playerName}</td>
                <td>{`${entry.vehicle.make} ${entry.vehicle.model}`}</td>
                <td>{formatTime(entry.time)}</td>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No records yet. Be the first to set a time!</td>
            </tr>
          )}
        </tbody>
      </table>
      
      <button className="close-button" onClick={onClose}>
        Close
      </button>
    </div>
  );
};

export default Leaderboard; 