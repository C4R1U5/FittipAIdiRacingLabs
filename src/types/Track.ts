export type TrackClassification = 'official' | 'custom' | 'invalid';
export type TrackSurface = 'asphalt' | 'dirt' | 'mixed';
export type TrackDifficulty = 'beginner' | 'intermediate' | 'expert' | 'master';

export interface TrackSegment {
  type: 'straight' | 'curve' | 'chicane';
  length: number;
  angle?: number;  // For curves
  direction?: 'left' | 'right';  // For curves and chicanes
}

export interface TrackCheckpoint {
  position: number;  // Position along the track (0-100%)
  type: 'start' | 'finish' | 'sector';
  sectorNumber?: number;  // For sector checkpoints
}

export interface Track {
  id: string;
  name: string;
  segments: TrackSegment[];
  checkpoints: TrackCheckpoint[];
  surface: TrackSurface;
  difficulty: TrackDifficulty;
  author: string;
  createdAt: string;
  commentary?: string;
  classification: TrackClassification;
} 