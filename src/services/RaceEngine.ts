import { Track, TrackSegment, Point2D } from '../types/Track';
import { Vehicle } from '../types/Vehicle';

interface RaceState {
  vehicle: {
    position: Point2D;
    velocity: Point2D;
    angle: number;
    speed: number;
    acceleration: number;
    isAccelerating: boolean;
    isBraking: boolean;
    steeringAngle: number;
  };
  track: Track & {
    segments: Array<TrackSegment & { width: number }>;
  };
  currentCheckpoint: number;
  lapTime: number;
  bestLapTime: number | null;
  isRacing: boolean;
  currentLap: number;
}

export class RaceEngine {
  private static instance: RaceEngine;
  private state: RaceState | null = null;
  private lastTimestamp: number = 0;
  private readonly PHYSICS_STEP = 1000 / 60; // 60 FPS

  // Physics constants
  private readonly MAX_SPEED = 300; // pixels per second
  private readonly ACCELERATION = 250; // pixels per second squared
  private readonly BRAKE_FORCE = 400; // pixels per second squared
  private readonly DRAG = 0.98; // air resistance (higher = less drag)
  private readonly STEERING_SPEED = 2.5; // degrees per frame
  private readonly GRIP = 0.92; // lateral friction
  private readonly OFF_TRACK_FRICTION = 0.7; // friction when off track
  private readonly CHECKPOINT_RADIUS = 50; // radius to detect checkpoint crossing

  private constructor() {}

  public static getInstance(): RaceEngine {
    if (!RaceEngine.instance) {
      RaceEngine.instance = new RaceEngine();
    }
    return RaceEngine.instance;
  }

  public startRace(track: Track, vehicle: Vehicle): void {
    // Initialize race at the first checkpoint
    const startCheckpoint = track.checkpoints.find(cp => cp.order === 1);
    if (!startCheckpoint) throw new Error('Track must have a start checkpoint');

    this.state = {
      vehicle: {
        position: { ...startCheckpoint.position },
        velocity: { x: 0, y: 0 },
        angle: startCheckpoint.angle,
        speed: 0,
        acceleration: 0,
        isAccelerating: false,
        isBraking: false,
        steeringAngle: 0
      },
      track,
      currentCheckpoint: 1,
      lapTime: 0,
      bestLapTime: null,
      isRacing: true,
      currentLap: 1
    };

    this.lastTimestamp = performance.now();
    requestAnimationFrame(this.update.bind(this));
  }

  public handleInput(input: {
    accelerate: boolean;
    brake: boolean;
    turnLeft: boolean;
    turnRight: boolean;
  }): void {
    if (!this.state || !this.state.isRacing) return;

    this.state.vehicle.isAccelerating = input.accelerate;
    this.state.vehicle.isBraking = input.brake;
    this.state.vehicle.steeringAngle = 
      (input.turnLeft ? -1 : 0) + (input.turnRight ? 1 : 0);
  }

  private update(timestamp: number): void {
    if (!this.state || !this.state.isRacing) return;

    const deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    // Update physics
    this.updateVehiclePhysics(deltaTime);
    
    // Check checkpoints
    this.checkCheckpoints();

    // Update lap time
    this.state.lapTime += deltaTime;

    // Request next frame
    requestAnimationFrame(this.update.bind(this));
  }

  private updateVehiclePhysics(deltaTime: number): void {
    if (!this.state) return;
    const v = this.state.vehicle;

    // Update acceleration
    if (v.isAccelerating) {
      v.speed += this.ACCELERATION * deltaTime;
    } else if (v.isBraking) {
      v.speed -= this.BRAKE_FORCE * deltaTime;
    }

    // Apply drag
    v.speed *= Math.pow(this.DRAG, deltaTime * 60);

    // Clamp speed
    v.speed = Math.max(0, Math.min(v.speed, this.MAX_SPEED));

    // Update steering (more responsive at lower speeds)
    const steeringFactor = Math.max(0.3, Math.min(1, v.speed / this.MAX_SPEED));
    v.angle += v.steeringAngle * this.STEERING_SPEED * steeringFactor;

    // Convert speed and angle to velocity
    const angleRad = v.angle * (Math.PI / 180);
    v.velocity.x = Math.cos(angleRad) * v.speed;
    v.velocity.y = Math.sin(angleRad) * v.speed;

    // Apply grip (lateral friction)
    v.velocity.x *= this.GRIP;
    v.velocity.y *= this.GRIP;

    // Check track boundaries before updating position
    const isOnTrack = this.isOnTrack(v.position);
    if (!isOnTrack) {
      // Apply additional friction when off track
      v.speed *= this.OFF_TRACK_FRICTION;
    }

    // Update position
    v.position.x += v.velocity.x * deltaTime;
    v.position.y += v.velocity.y * deltaTime;
  }

  private isOnTrack(position: Point2D): boolean {
    if (!this.state) return false;

    // Find the closest segment
    let minDistance = Infinity;
    let closestSegment: TrackSegment | null = null;

    this.state.track.segments.forEach((segment: TrackSegment) => {
      const distance = this.pointToSegmentDistance(position, segment);
      if (distance < minDistance) {
        minDistance = distance;
        closestSegment = segment;
      }
    });

    // Check if within track width plus a small margin
    return closestSegment ? minDistance <= (closestSegment.width / 2 + 5) : false;
  }

  private pointToSegmentDistance(point: Point2D, segment: TrackSegment): number {
    const { startPoint, endPoint } = segment;
    
    const A = point.x - startPoint.x;
    const B = point.y - startPoint.y;
    const C = endPoint.x - startPoint.x;
    const D = endPoint.y - startPoint.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = startPoint.x;
      yy = startPoint.y;
    } else if (param > 1) {
      xx = endPoint.x;
      yy = endPoint.y;
    } else {
      xx = startPoint.x + param * C;
      yy = startPoint.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  private checkCheckpoints(): void {
    if (!this.state) return;
    const v = this.state.vehicle;

    const nextCheckpoint = this.state.track.checkpoints.find(
      cp => cp.order === this.state.currentCheckpoint
    );

    if (!nextCheckpoint) return;

    // Check if vehicle is within checkpoint radius
    const distance = Math.sqrt(
      Math.pow(v.position.x - nextCheckpoint.position.x, 2) +
      Math.pow(v.position.y - nextCheckpoint.position.y, 2)
    );

    if (distance < this.CHECKPOINT_RADIUS) {
      this.state.currentCheckpoint++;
      
      // Check if lap is complete
      if (this.state.currentCheckpoint > this.state.track.checkpoints.length) {
        this.completeLap();
      }
    }
  }

  private completeLap(): void {
    if (!this.state) return;

    // Update best lap time
    if (!this.state.bestLapTime || this.state.lapTime < this.state.bestLapTime) {
      this.state.bestLapTime = this.state.lapTime;
    }

    // Reset for next lap
    this.state.currentCheckpoint = 1;
    this.state.lapTime = 0;
    this.state.currentLap++;
  }

  public getRaceState(): RaceState | null {
    return this.state;
  }

  public endRace(): void {
    this.state = null;
  }
} 