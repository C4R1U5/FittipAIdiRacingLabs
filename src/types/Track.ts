export interface TrackSegment {
  id: string;
  type: 'straight' | 'curve' | 'chicane';
  start: { x: number; y: number };
  end: { x: number; y: number };
  width: number;
}

export interface Checkpoint {
  x: number;
  y: number;
}

export interface Track {
  id: string;
  name: string;
  segments: TrackSegment[];
  checkpoints: Checkpoint[];
  surface: 'asphalt' | 'gravel' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  commentary: string;
  createdAt: Date;
  author: string;
} 