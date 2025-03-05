export interface Point2D {
  x: number;
  y: number;
}

export interface ControlPoint {
  id: string;
  position: Point2D;
  handleIn?: Point2D;  // Control handle for incoming curve
  handleOut?: Point2D; // Control handle for outgoing curve
  type: 'normal' | 'sharp' | 'smooth';
}

export interface TrackEditorState {
  controlPoints: ControlPoint[];
  selectedPointId?: string;
  isDragging: boolean;
  trackWidth: number;
  gridSize: number;
  snapToGrid: boolean;
}

export interface BezierSegment {
  startPoint: Point2D;
  endPoint: Point2D;
  controlPoint1: Point2D;
  controlPoint2: Point2D;
}

export type EditorMode = 'add' | 'edit' | 'delete' | 'adjust-width'; 