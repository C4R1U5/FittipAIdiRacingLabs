import { Track } from '../models/Track';
import Vehicle from '../models/Vehicle';
import { Racer } from '../models/Racer';
import { PowerUp } from '../models/PowerUp';
import { PhysicsUtils } from '../utils/PhysicsUtils';

/**
 * RaceEngine handles vehicle movement, race logic, and collision detection
 */
export class RaceEngine {
  private track: Track;
  private racers: Racer[];
  private powerUps: PowerUp[];
  private timeElapsed: number = 0;
  private isRaceStarted: boolean = false;
  private isRaceFinished: boolean = false;
  private lastTimestamp: number = 0;
  
  constructor(track: Track, racers: Racer[] = []) {
    this.track = track;
    this.racers = racers;
    this.powerUps = [];
  }
  
  /**
   * Add a racer to the race
   */
  addRacer(racer: Racer): void {
    this.racers.push(racer);
  }
  
  /**
   * Start the race
   */
  startRace(): void {
    this.isRaceStarted = true;
    this.isRaceFinished = false;
    this.timeElapsed = 0;
    this.lastTimestamp = performance.now();
    
    // Position racers at the starting line
    this.positionRacersAtStart();
  }
  
  /**
   * Position all racers at the starting line
   */
  private positionRacersAtStart(): void {
    const startPos = this.track.startPosition;
    
    // Position each racer with slight offset
    this.racers.forEach((racer, index) => {
      racer.position = {
        x: startPos.x,
        y: startPos.y + (index * 20) // Offset each racer
      };
      racer.rotation = 0; // Starting direction
      racer.velocity = 0;
      racer.lap = 0;
      racer.checkpointsPassed = [];
    });
  }
  
  /**
   * Update the race state based on time delta
   */
  update(timestamp: number): void {
    if (!this.isRaceStarted || this.isRaceFinished) return;
    
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    this.timeElapsed += deltaTime;
    
    // Update each racer
    this.racers.forEach(racer => {
      if (racer.finished) return;
      
      this.updateRacerMovement(racer, deltaTime);
      this.checkCollisions(racer);
      this.checkCheckpoints(racer);
      this.checkLapCompletion(racer);
    });
    
    // Check if race is complete
    this.checkRaceCompletion();
  }
  
  /**
   * Update racer movement based on physics
   */
  private updateRacerMovement(racer: Racer, deltaTime: number): void {
    // Apply acceleration based on input
    if (racer.isAccelerating) {
      racer.velocity += PhysicsUtils.calculateAcceleration(
        racer.vehicle, 
        racer.velocity, 
        deltaTime
      );
    } else if (racer.isBraking) {
      racer.velocity -= PhysicsUtils.calculateBraking(
        racer.vehicle, 
        racer.velocity, 
        deltaTime
      );
    } else {
      // Apply drag when not accelerating or braking
      racer.velocity -= PhysicsUtils.calculateDrag(
        racer.vehicle, 
        racer.velocity, 
        deltaTime
      );
    }
    
    // Apply steering
    if (racer.isTurningLeft) {
      racer.rotation -= PhysicsUtils.calculateSteering(
        racer.vehicle, 
        racer.velocity, 
        deltaTime
      );
    } else if (racer.isTurningRight) {
      racer.rotation += PhysicsUtils.calculateSteering(
        racer.vehicle, 
        racer.velocity, 
        deltaTime
      );
    }
    
    // Ensure velocity stays within vehicle limits
    racer.velocity = Math.max(
      0, 
      Math.min(racer.velocity, racer.vehicle.performance.topSpeed / 3.6) // Convert km/h to m/s
    );
    
    // Calculate new position based on velocity and rotation
    const radians = racer.rotation * Math.PI / 180;
    const vx = Math.sin(radians) * racer.velocity * (deltaTime / 1000);
    const vy = -Math.cos(radians) * racer.velocity * (deltaTime / 1000);
    
    racer.position.x += vx;
    racer.position.y += vy;
  }
  
  /**
   * Check for collisions with track boundaries
   */
  private checkCollisions(racer: Racer): void {
    // Determine if the racer is on the track
    const isOnTrack = this.isPositionOnTrack(racer.position);
    
    if (!isOnTrack) {
      // Apply off-track penalty (slow down)
      racer.velocity *= 0.9;
    }
    
    // Also check collisions with other racers
    for (const otherRacer of this.racers) {
      if (otherRacer === racer) continue;
      
      const distance = Math.sqrt(
        Math.pow(racer.position.x - otherRacer.position.x, 2) +
        Math.pow(racer.position.y - otherRacer.position.y, 2)
      );
      
      if (distance < 20) { // Simple collision radius
        // Handle collision physics
        this.resolveCollision(racer, otherRacer);
      }
    }
  }
  
  /**
   * Check if a position is on the track
   */
  private isPositionOnTrack(position: { x: number, y: number }): boolean {
    // This would be a complex algorithm to check if the position is within the track boundaries
    // For simplicity, we'll return true in this skeleton code
    return true;
  }
  
  /**
   * Resolve collision between two racers
   */
  private resolveCollision(racer1: Racer, racer2: Racer): void {
    // Simple collision response
    racer1.velocity *= 0.8;
    racer2.velocity *= 0.8;
  }
  
  /**
   * Check if the racer has passed any checkpoints
   */
  private checkCheckpoints(racer: Racer): void {
    this.track.checkpoints.forEach((checkpoint, index) => {
      if (racer.checkpointsPassed.includes(index)) return;
      
      const distance = Math.sqrt(
        Math.pow(racer.position.x - checkpoint.x, 2) +
        Math.pow(racer.position.y - checkpoint.y, 2)
      );
      
      if (distance < 30) { // Checkpoint detection radius
        racer.checkpointsPassed.push(index);
      }
    });
  }
  
  /**
   * Check if the racer has completed a lap
   */
  private checkLapCompletion(racer: Racer): void {
    // Check if racer has passed all checkpoints
    if (racer.checkpointsPassed.length === this.track.checkpoints.length) {
      // Check if near start/finish line
      const distance = Math.sqrt(
        Math.pow(racer.position.x - this.track.startPosition.x, 2) +
        Math.pow(racer.position.y - this.track.startPosition.y, 2)
      );
      
      if (distance < 30) { // Start line detection radius
        racer.lap++;
        racer.checkpointsPassed = [];
        
        // Check if race is finished for this racer
        if (racer.lap >= 3) { // Assuming 3 laps per race
          racer.finished = true;
          racer.finishTime = this.timeElapsed;
        }
      }
    }
  }
  
  /**
   * Check if the race is complete
   */
  private checkRaceCompletion(): void {
    const allFinished = this.racers.every(racer => racer.finished);
    
    if (allFinished) {
      this.isRaceFinished = true;
    }
  }
  
  /**
   * Get results of the race
   */
  getRaceResults(): { racer: Racer, time: number }[] {
    return this.racers
      .filter(racer => racer.finished)
      .map(racer => ({
        racer,
        time: racer.finishTime
      }))
      .sort((a, b) => a.time - b.time);
  }
} 