/**
 * Types of track segments
 */
export type SegmentType = 'straight' | 'curve' | 'checkpoint';

/**
 * Track segment interface
 */
export interface TrackSegment {
  id: string;
  type: SegmentType;
  position: {
    x: number;
    y: number;
  };
  rotation: number; // Degrees
  length?: number; // For straight segments
  width?: number; // Track width
  radius?: number; // For curve segments
  angle?: number; // For curve segments, in degrees
}

/**
 * Track interface
 */
export interface Track {
  id: string;
  name: string;
  author: string;
  segments: TrackSegment[];
  startPosition: {
    x: number;
    y: number;
  };
  checkpoints: {
    x: number;
    y: number;
  }[];
}

/**
 * Create an empty track
 */
export const createEmptyTrack = (name: string = 'New Track', author: string = 'Player'): Track => {
  return {
    id: `track-${Date.now()}`,
    name,
    author,
    segments: [],
    startPosition: { x: 100, y: 300 },
    checkpoints: []
  };
};

/**
 * Add a segment to a track
 */
export const addSegment = (track: Track, segment: TrackSegment): Track => {
  return {
    ...track,
    segments: [...track.segments, segment]
  };
};

/**
 * Add a checkpoint to a track
 */
export const addCheckpoint = (track: Track, position: { x: number, y: number }): Track => {
  return {
    ...track,
    checkpoints: [...track.checkpoints, position]
  };
}; 