import { v4 as uuidv4 } from 'uuid';
import { 
  Track, 
  TrackSegment, 
  TrackCheckpoint, 
  Point2D 
} from '../types/Track';
import { ControlPoint } from '../types/TrackEditor';
import { validateTrack } from '../utils/trackValidation';

export class TrackBuilderService {
  private static instance: TrackBuilderService;
  private readonly SECTOR_COLORS = ['#FF0000', '#00FF00', '#0000FF'];

  private constructor() {}

  public static getInstance(): TrackBuilderService {
    if (!TrackBuilderService.instance) {
      TrackBuilderService.instance = new TrackBuilderService();
    }
    return TrackBuilderService.instance;
  }

  private calculateSegmentLength(start: Point2D, end: Point2D): number {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private calculateSegmentAngle(start: Point2D, end: Point2D): number {
    return Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
  }

  private calculateSectorPoints(controlPoints: ControlPoint[]): number[] {
    const totalPoints = controlPoints.length;
    const minSectors = 3;
    const pointsPerSector = Math.floor(totalPoints / minSectors);
    const remainingPoints = totalPoints % minSectors;

    // Calculate sector boundaries
    const sectorPoints: number[] = [];
    let currentPoint = 0;

    for (let i = 0; i < minSectors - 1; i++) {
      currentPoint += pointsPerSector + (i < remainingPoints ? 1 : 0);
      sectorPoints.push(currentPoint);
    }

    return sectorPoints;
  }

  private createSectorCheckpoint(
    position: Point2D,
    angle: number,
    order: number,
    sectorNumber: number
  ): TrackCheckpoint {
    return {
      id: `checkpoint-s${sectorNumber}`,
      position,
      angle,
      order,
      sectorColor: this.SECTOR_COLORS[sectorNumber % this.SECTOR_COLORS.length]
    };
  }

  public controlPointsToTrack(
    controlPoints: ControlPoint[],
    trackWidth: number,
    trackName: string
  ): Track {
    if (controlPoints.length < 3) {
      throw new Error('Track must have at least 3 control points');
    }

    const segments: TrackSegment[] = [];
    const checkpoints: TrackCheckpoint[] = [];
    const sectorPoints = this.calculateSectorPoints(controlPoints);
    let currentSector = 0;
    let checkpointOrder = 1;

    // Create segments and checkpoints
    for (let i = 0; i < controlPoints.length; i++) {
      const current = controlPoints[i];
      const next = i === controlPoints.length - 1 ? controlPoints[0] : controlPoints[i + 1];

      const startPoint = current.position;
      const endPoint = next.position;
      const length = this.calculateSegmentLength(startPoint, endPoint);
      const angle = this.calculateSegmentAngle(startPoint, endPoint);

      // Create segment with sector color
      segments.push({
        id: `segment-${i}`,
        type: 'straight',
        width: trackWidth,
        startPoint,
        endPoint,
        length,
        position: startPoint,
        angle,
        sectorColor: this.SECTOR_COLORS[currentSector % this.SECTOR_COLORS.length]
      });

      // Add checkpoint if this is a sector boundary
      if (i === 0) {
        // Start checkpoint
        checkpoints.push(this.createSectorCheckpoint(startPoint, angle, checkpointOrder++, currentSector));
      } else if (sectorPoints.includes(i)) {
        // Sector checkpoint
        currentSector++;
        checkpoints.push(this.createSectorCheckpoint(startPoint, angle, checkpointOrder++, currentSector));
      } else if (i === controlPoints.length - 1) {
        // Final checkpoint (at start position)
        checkpoints.push(this.createSectorCheckpoint(controlPoints[0].position, angle, checkpointOrder++, currentSector));
      }
    }

    const track: Track = {
      id: `track-${Date.now()}`,
      name: trackName,
      segments,
      checkpoints,
      classification: 'custom',
      surface: 'asphalt',
      difficulty: 'intermediate',
      author: 'User',
      createdAt: new Date().toISOString(),
      sectors: currentSector + 1
    };

    // Validate the track
    const validation = validateTrack(track);
    if (!validation.isValid) {
      throw new Error(`Invalid track: ${validation.errors.join(', ')}`);
    }

    return track;
  }

  public trackToControlPoints(track: Track): ControlPoint[] {
    return track.segments.map((segment, index) => ({
      id: `control-${index}`,
      position: segment.startPoint,
      type: 'normal'
    }));
  }

  public validateTrack(track: Track): { isValid: boolean; errors: string[] } {
    return validateTrack(track);
  }

  private calculateDefaultHandle(
    point: ControlPoint,
    otherPoint: ControlPoint,
    isOutgoing: boolean
  ): Point2D {
    const dx = otherPoint.position.x - point.position.x;
    const dy = otherPoint.position.y - point.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const handleLength = distance / 3; // Standard Bezier curve handle length

    // If outgoing, handle extends toward next point
    // If incoming, handle extends from previous point
    const factor = isOutgoing ? 1 : -1;

    return {
      x: point.position.x + (dx / distance) * handleLength * factor,
      y: point.position.y + (dy / distance) * handleLength * factor
    };
  }

  private createCheckpoint(position: Point2D, angle: number, order: number): TrackCheckpoint {
    return {
      id: uuidv4(),
      position,
      angle,
      order
    };
  }
} 