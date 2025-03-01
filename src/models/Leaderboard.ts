import Vehicle from './Vehicle';

/**
 * Leaderboard entry interface
 */
export interface LeaderboardEntry {
  id: string;
  trackId: string;
  playerName: string;
  vehicle: Vehicle;
  time: number; // Time in milliseconds
  date: number; // Timestamp
}

/**
 * Leaderboard interface
 */
export interface Leaderboard {
  trackId: string;
  entries: LeaderboardEntry[];
}

/**
 * Create a new leaderboard entry
 */
export const createLeaderboardEntry = (
  trackId: string,
  playerName: string,
  vehicle: Vehicle,
  time: number
): LeaderboardEntry => {
  return {
    id: `entry-${Date.now()}`,
    trackId,
    playerName,
    vehicle,
    time,
    date: Date.now()
  };
};

/**
 * Create a new empty leaderboard
 */
export const createLeaderboard = (trackId: string): Leaderboard => {
  return {
    trackId,
    entries: []
  };
};

/**
 * Add an entry to a leaderboard
 */
export const addLeaderboardEntry = (
  leaderboard: Leaderboard,
  entry: LeaderboardEntry
): Leaderboard => {
  // Ensure the entry is for the correct track
  if (entry.trackId !== leaderboard.trackId) {
    return leaderboard;
  }
  
  return {
    ...leaderboard,
    entries: [...leaderboard.entries, entry]
  };
};

/**
 * Get top N entries from a leaderboard
 */
export const getTopEntries = (
  leaderboard: Leaderboard,
  count: number = 10
): LeaderboardEntry[] => {
  return [...leaderboard.entries]
    .sort((a, b) => a.time - b.time)
    .slice(0, count);
}; 