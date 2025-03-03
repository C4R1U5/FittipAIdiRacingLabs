export interface TrackSegment {
  id: string;
  type: 'straight' | 'curve' | 'chicane';
  start: { x: number; y: number };
  end: { x: number; y: number };
  width: number;
}

export interface Checkpoint {
  id: string;
  position: { x: number; y: number };
  order: number;
}

export type TrackClassification = 'official' | 'custom' | 'invalid';

export interface Track {
  id: string;
  name: string;
  segments: TrackSegment[];
  checkpoints: Checkpoint[];
  surface: 'asphalt' | 'dirt' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  commentary: string;
  createdAt: Date;
  author: string;
  classification: TrackClassification;
  validationErrors?: string[];
} 