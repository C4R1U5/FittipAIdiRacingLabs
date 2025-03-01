import { Track, TrackSegment } from '../models/Track';
import Vehicle from '../models/Vehicle';

/**
 * TrackEngine handles the rendering and physics of the track
 */
export class TrackEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }
  
  /**
   * Render the track with all its segments
   */
  renderTrack(track: Track): void {
    this.clearCanvas();
    this.drawBackground();
    
    // Draw each segment
    track.segments.forEach(segment => {
      this.drawSegment(segment);
    });
    
    // Draw start/finish line
    if (track.startPosition) {
      this.drawStartLine(track.startPosition);
    }
    
    // Draw checkpoints
    track.checkpoints.forEach(checkpoint => {
      this.drawCheckpoint(checkpoint);
    });
  }
  
  /**
   * Render vehicles on the track
   */
  renderVehicles(vehicles: Vehicle[]): void {
    vehicles.forEach(vehicle => {
      this.drawVehicle(vehicle);
    });
  }
  
  /**
   * Clear the canvas
   */
  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Draw the track background
   */
  private drawBackground(): void {
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid lines for reference
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x < this.canvas.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y < this.canvas.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }
  
  /**
   * Draw a track segment
   */
  private drawSegment(segment: TrackSegment): void {
    this.ctx.save();
    this.ctx.translate(segment.position.x, segment.position.y);
    this.ctx.rotate(segment.rotation * Math.PI / 180);
    
    if (segment.type === 'straight') {
      this.drawStraightSegment(segment);
    } else if (segment.type === 'curve') {
      this.drawCurveSegment(segment);
    } else if (segment.type === 'checkpoint') {
      this.drawCheckpointSegment(segment);
    }
    
    this.ctx.restore();
  }
  
  /**
   * Draw a straight track segment
   */
  private drawStraightSegment(segment: TrackSegment): void {
    const width = segment.width || 30;
    const length = segment.length || 100;
    
    // Draw track background
    this.ctx.fillStyle = '#444';
    this.ctx.fillRect(-width / 2, -5, width, length + 10);
    
    // Draw track border
    this.ctx.strokeStyle = '#FFF';
    this.ctx.lineWidth = 2;
    
    // Left border
    this.ctx.beginPath();
    this.ctx.moveTo(-width / 2, 0);
    this.ctx.lineTo(-width / 2, length);
    this.ctx.stroke();
    
    // Right border
    this.ctx.beginPath();
    this.ctx.moveTo(width / 2, 0);
    this.ctx.lineTo(width / 2, length);
    this.ctx.stroke();
  }
  
  /**
   * Draw a curved track segment
   */
  private drawCurveSegment(segment: TrackSegment): void {
    const width = segment.width || 30;
    const radius = segment.radius || 100;
    const angle = segment.angle || 90; // Degrees
    
    // Draw track background
    this.ctx.fillStyle = '#444';
    this.ctx.beginPath();
    this.ctx.arc(0, radius, radius + width / 2, -Math.PI / 2, (angle * Math.PI / 180) - Math.PI / 2, false);
    this.ctx.arc(0, radius, radius - width / 2, (angle * Math.PI / 180) - Math.PI / 2, -Math.PI / 2, true);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw track borders
    this.ctx.strokeStyle = '#FFF';
    this.ctx.lineWidth = 2;
    
    // Outer border
    this.ctx.beginPath();
    this.ctx.arc(0, radius, radius + width / 2, -Math.PI / 2, (angle * Math.PI / 180) - Math.PI / 2, false);
    this.ctx.stroke();
    
    // Inner border
    this.ctx.beginPath();
    this.ctx.arc(0, radius, radius - width / 2, -Math.PI / 2, (angle * Math.PI / 180) - Math.PI / 2, false);
    this.ctx.stroke();
  }
  
  /**
   * Draw a checkpoint segment
   */
  private drawCheckpointSegment(segment: TrackSegment): void {
    const width = segment.width || 30;
    const length = 10;
    
    // Draw checkpoint
    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    this.ctx.fillRect(-width / 2, -5, width, length + 10);
    
    // Draw checkpoint border
    this.ctx.strokeStyle = '#0F0';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(-width / 2, -5, width, length + 10);
  }
  
  /**
   * Draw the start/finish line
   */
  private drawStartLine(position: { x: number, y: number }): void {
    this.ctx.save();
    this.ctx.translate(position.x, position.y);
    
    const width = 40;
    const height = 10;
    
    // Checkerboard pattern
    const squareSize = 5;
    this.ctx.fillStyle = '#000';
    
    for (let x = 0; x < width; x += squareSize) {
      for (let y = 0; y < height; y += squareSize) {
        if ((x + y) % (squareSize * 2) === 0) {
          this.ctx.fillRect(-width / 2 + x, y, squareSize, squareSize);
        }
      }
    }
    
    this.ctx.restore();
  }
  
  /**
   * Draw a checkpoint marker
   */
  private drawCheckpoint(position: { x: number, y: number }): void {
    this.ctx.save();
    this.ctx.translate(position.x, position.y);
    
    // Draw checkpoint marker
    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.strokeStyle = '#0F0';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
    this.ctx.stroke();
    
    this.ctx.restore();
  }
  
  /**
   * Draw a vehicle on the track
   */
  private drawVehicle(vehicle: Vehicle): void {
    // In a real implementation, this would use the vehicle's position and rotation
    // This is a simplified placeholder
    this.ctx.save();
    this.ctx.fillStyle = '#F00';
    this.ctx.fillRect(-10, -5, 20, 10);
    this.ctx.restore();
  }
} 