import { Track } from '../models/Track';
import { PowerUp, PowerUpType } from '../models/PowerUp';
import { Racer } from '../models/Racer';

/**
 * PowerUpManager handles spawning and applying power-ups
 */
export class PowerUpManager {
  private track: Track;
  private powerUps: PowerUp[] = [];
  private readonly maxPowerUps: number;
  private readonly spawnInterval: number; // ms
  private lastSpawnTime: number = 0;
  
  constructor(track: Track, maxPowerUps: number = 5, spawnInterval: number = 10000) {
    this.track = track;
    this.maxPowerUps = maxPowerUps;
    this.spawnInterval = spawnInterval;
  }
  
  /**
   * Update the power-up system
   */
  update(timestamp: number): void {
    // Spawn new power-ups if needed
    if (this.powerUps.length < this.maxPowerUps && 
        timestamp - this.lastSpawnTime > this.spawnInterval) {
      this.spawnPowerUp();
      this.lastSpawnTime = timestamp;
    }
  }
  
  /**
   * Spawn a random power-up on the track
   */
  private spawnPowerUp(): void {
    // Get a random position on the track
    const position = this.getRandomPositionOnTrack();
    
    // Choose a random power-up type
    const powerUpTypes: PowerUpType[] = ['boost', 'shield', 'oil', 'missile'];
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    // Create the power-up
    const powerUp: PowerUp = {
      id: `power-up-${Date.now()}`,
      type,
      position,
      active: true,
      duration: this.getPowerUpDuration(type)
    };
    
    this.powerUps.push(powerUp);
  }
  
  /**
   * Get a random position on the track
   */
  private getRandomPositionOnTrack(): { x: number, y: number } {
    // In a real implementation, we would use track segment data to find valid positions
    // For this skeleton implementation, we'll return a random position
    
    // Get a random track segment
    const segments = this.track.segments;
    const randomSegment = segments[Math.floor(Math.random() * segments.length)];
    
    // Generate a position near the segment
    return {
      x: randomSegment.position.x + (Math.random() * 50 - 25),
      y: randomSegment.position.y + (Math.random() * 50 - 25)
    };
  }
  
  /**
   * Get duration for specific power-up type
   */
  private getPowerUpDuration(type: PowerUpType): number {
    switch(type) {
      case 'boost':
        return 3000;  // 3 seconds
      case 'shield':
        return 5000;  // 5 seconds
      case 'oil':
        return 7000;  // 7 seconds (how long oil slick lasts)
      case 'missile':
        return 0;     // Instant effect
      default:
        return 5000;  // Default duration
    }
  }
  
  /**
   * Check if a racer has collected any power-ups
   */
  checkPowerUpCollection(racer: Racer): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      
      if (!powerUp.active) continue;
      
      // Calculate distance between racer and power-up
      const distance = Math.sqrt(
        Math.pow(racer.position.x - powerUp.position.x, 2) +
        Math.pow(racer.position.y - powerUp.position.y, 2)
      );
      
      // Check if racer has collected the power-up
      if (distance < 20) { // Collection radius
        this.applyPowerUp(racer, powerUp);
        
        // Remove power-up (except for oil slicks which stay on the track)
        if (powerUp.type !== 'oil') {
          this.powerUps.splice(i, 1);
        } else {
          powerUp.active = false; // Oil slick stays but can't be collected again
        }
      }
    }
  }
  
  /**
   * Apply power-up effects to a racer
   */
  private applyPowerUp(racer: Racer, powerUp: PowerUp): void {
    switch(powerUp.type) {
      case 'boost':
        // Apply speed boost
        racer.velocity *= 1.5;
        // Set boost effect timeout
        setTimeout(() => {
          // Reset velocity to normal (if still boosting)
          if (racer.velocity > racer.vehicle.performance.topSpeed / 3.6) {
            racer.velocity = racer.vehicle.performance.topSpeed / 3.6;
          }
        }, powerUp.duration);
        break;
        
      case 'shield':
        // Apply shield effect
        racer.hasShield = true;
        // Set shield effect timeout
        setTimeout(() => {
          racer.hasShield = false;
        }, powerUp.duration);
        break;
        
      case 'oil':
        // Oil slick stays on the track - no direct effect on collecting racer
        break;
        
      case 'missile':
        // Find the racer in front and slow them down
        this.applyMissileEffect(racer);
        break;
    }
  }
  
  /**
   * Apply missile effect - slow down the racer ahead
   */
  private applyMissileEffect(firingRacer: Racer): void {
    // Find the next racer ahead
    let targetRacer: Racer | null = null;
    let smallestPositiveDifference = Infinity;
    
    for (const racer of this.getRacers()) {
      if (racer === firingRacer) continue;
      
      // Calculate lap difference
      const lapDifference = racer.lap - firingRacer.lap;
      
      // If on the same lap or one lap ahead, check distance
      if (lapDifference >= 0 && lapDifference <= 1) {
        if (lapDifference === 0) {
          // On the same lap, check if ahead
          const checkpointDifference = 
            Math.max(...racer.checkpointsPassed) - 
            Math.max(...firingRacer.checkpointsPassed);
          
          if (checkpointDifference > 0 && checkpointDifference < smallestPositiveDifference) {
            smallestPositiveDifference = checkpointDifference;
            targetRacer = racer;
          }
        } else {
          // One lap ahead
          targetRacer = racer;
          break;
        }
      }
    }
    
    // Apply slow effect to target
    if (targetRacer && !targetRacer.hasShield) {
      targetRacer.velocity *= 0.5; // Slow down by 50%
    }
  }
  
  /**
   * Get all active racers in the game
   */
  private getRacers(): Racer[] {
    // In a real implementation, this would come from the RaceEngine
    // For this skeleton implementation, we'll return an empty array
    return [];
  }
  
  /**
   * Render all power-ups on the track
   */
  render(ctx: CanvasRenderingContext2D): void {
    this.powerUps.forEach(powerUp => {
      if (!powerUp.active) return;
      
      ctx.save();
      ctx.translate(powerUp.position.x, powerUp.position.y);
      
      // Draw different colors/shapes based on power-up type
      switch(powerUp.type) {
        case 'boost':
          ctx.fillStyle = '#00F';  // Blue
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(-7, 10);
          ctx.lineTo(7, 10);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'shield':
          ctx.fillStyle = '#0F0';  // Green
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'oil':
          ctx.fillStyle = '#000';  // Black
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'missile':
          ctx.fillStyle = '#F00';  // Red
          ctx.fillRect(-10, -5, 20, 10);
          break;
      }
      
      ctx.restore();
    });
  }
} 