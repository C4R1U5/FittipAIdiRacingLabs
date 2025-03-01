import { Track, TrackSegment } from '../models/Track';

/**
 * Utility functions for track manipulation and validation
 */
export class TrackUtils {
  /**
   * Add a segment to a track with auto-snapping
   */
  static addSegmentWithAutoSnap(
    segments: TrackSegment[],
    newSegment: TrackSegment
  ): TrackSegment[] {
    if (segments.length === 0) {
      // First segment doesn't need snapping
      return [newSegment];
    }
    
    // Find the last segment
    const lastSegment = segments[segments.length - 1];
    
    // Calculate the end point of the last segment
    const lastEndPoint = this.calculateSegmentEndPoint(lastSegment);
    
    // Snap the new segment to the end point of the last segment
    const snappedSegment: TrackSegment = {
      ...newSegment,
      position: lastEndPoint,
      // Inherit rotation from the last segment for better continuity
      rotation: lastSegment.rotation
    };
    
    return [...segments, snappedSegment];
  }
  
  /**
   * Calculate the end point of a segment
   */
  static calculateSegmentEndPoint(segment: TrackSegment): { x: number, y: number } {
    if (segment.type === 'straight') {
      const length = segment.length || 100;
      const radians = segment.rotation * Math.PI / 180;
      
      return {
        x: segment.position.x + Math.sin(radians) * length,
        y: segment.position.y - Math.cos(radians) * length
      };
    } else if (segment.type === 'curve') {
      const radius = segment.radius || 100;
      const angle = segment.angle || 90; // In degrees
      const startRadians = segment.rotation * Math.PI / 180;
      const endRadians = ((segment.rotation + angle) % 360) * Math.PI / 180;
      
      // Calculate center of the curve
      const centerX = segment.position.x - Math.cos(startRadians) * radius;
      const centerY = segment.position.y - Math.sin(startRadians) * radius;
      
      // Calculate end point
      return {
        x: centerX + Math.cos(endRadians) * radius,
        y: centerY + Math.sin(endRadians) * radius
      };
    } else {
      // For checkpoints or other segments, just return the position
      return { ...segment.position };
    }
  }
  
  /**
   * Check if a track forms a complete loop
   */
  static validateTrackCompletion(track: Track): boolean {
    if (track.segments.length < 3) {
      // Need at least 3 segments to form a loop
      return false;
    }
    
    // Calculate the end point of the last segment
    const lastSegment = track.segments[track.segments.length - 1];
    const lastEndPoint = this.calculateSegmentEndPoint(lastSegment);
    
    // Calculate distance to starting point
    const startPoint = track.segments[0].position;
    const distance = Math.sqrt(
      Math.pow(lastEndPoint.x - startPoint.x, 2) +
      Math.pow(lastEndPoint.y - startPoint.y, 2)
    );
    
    // If the end is close enough to the start, it's a loop
    return distance < 30; // 30 pixel tolerance
  }
  
  /**
   * Auto-place checkpoints along the track
   */
  static autoPlaceCheckpoints(track: Track, count: number = 3): Track {
    if (track.segments.length < count) {
      return track; // Not enough segments
    }
    
    const checkpoints = [];
    
    // Place checkpoints evenly along the track
    for (let i = 1; i <= count; i++) {
      const segmentIndex = Math.floor((i * track.segments.length) / (count + 1));
      const segment = track.segments[segmentIndex];
      
      // Place checkpoint in the middle of the segment
      if (segment.type === 'straight') {
        const length = segment.length || 100;
        const radians = segment.rotation * Math.PI / 180;
        
        checkpoints.push({
          x: segment.position.x + Math.sin(radians) * (length / 2),
          y: segment.position.y - Math.cos(radians) * (length / 2)
        });
      } else {
        // For curves or other segments, just use the segment position
        checkpoints.push({ ...segment.position });
      }
    }
    
    return {
      ...track,
      checkpoints
    };
  }
  
  /**
   * Check if a point is on a track segment
   */
  static isPointOnSegment(
    point: { x: number, y: number },
    segment: TrackSegment,
    tolerance: number = 15
  ): boolean {
    if (segment.type === 'straight') {
      return this.isPointOnStraightSegment(point, segment, tolerance);
    } else if (segment.type === 'curve') {
      return this.isPointOnCurveSegment(point, segment, tolerance);
    } else {
      // For checkpoints, just check distance to center
      const distance = Math.sqrt(
        Math.pow(point.x - segment.position.x, 2) +
        Math.pow(point.y - segment.position.y, 2)
      );
      
      return distance <= tolerance;
    }
  }
  
  /**
   * Check if a point is on a straight track segment
   */
  private static isPointOnStraightSegment(
    point: { x: number, y: number },
    segment: TrackSegment,
    tolerance: number
  ): boolean {
    const length = segment.length || 100;
    const width = segment.width || 30;
    const radians = segment.rotation * Math.PI / 180;
    
    // Calculate the end point
    const endX = segment.position.x + Math.sin(radians) * length;
    const endY = segment.position.y - Math.cos(radians) * length;
    
    // Vector from start to end
    const segVectorX = endX - segment.position.x;
    const segVectorY = endY - segment.position.y;
    const segLength = Math.sqrt(segVectorX * segVectorX + segVectorY * segVectorY);
    
    // Vector from start to point
    const pointVectorX = point.x - segment.position.x;
    const pointVectorY = point.y - segment.position.y;
    
    // Project point vector onto segment vector to find closest point
    const projection = (pointVectorX * segVectorX + pointVectorY * segVectorY) / segLength;
    
    // If projection is outside segment length, point is not on segment
    if (projection < 0 || projection > segLength) {
      return false;
    }
    
    // Calculate the closest point on the segment line
    const closestX = segment.position.x + (segVectorX * projection) / segLength;
    const closestY = segment.position.y + (segVectorY * projection) / segLength;
    
    // Calculate distance to the closest point
    const distance = Math.sqrt(
      Math.pow(point.x - closestX, 2) +
      Math.pow(point.y - closestY, 2)
    );
    
    // Check if the distance is within the track width (plus tolerance)
    return distance <= (width / 2 + tolerance);
  }
  
  /**
   * Check if a point is on a curved track segment
   */
  private static isPointOnCurveSegment(
    point: { x: number, y: number },
    segment: TrackSegment,
    tolerance: number
  ): boolean {
    const radius = segment.radius || 100;
    const angle = segment.angle || 90; // In degrees
    const width = segment.width || 30;
    const startRadians = segment.rotation * Math.PI / 180;
    
    // Calculate center of the curve
    const centerX = segment.position.x - Math.cos(startRadians) * radius;
    const centerY = segment.position.y - Math.sin(startRadians) * radius;
    
    // Calculate distance from point to center
    const distance = Math.sqrt(
      Math.pow(point.x - centerX, 2) +
      Math.pow(point.y - centerY, 2)
    );
    
    // Check if distance is within the radius range (plus tolerance)
    const innerRadius = radius - width / 2 - tolerance;
    const outerRadius = radius + width / 2 + tolerance;
    
    if (distance < innerRadius || distance > outerRadius) {
      return false;
    }
    
    // Calculate angle of point relative to center
    const pointAngle = Math.atan2(
      point.y - centerY,
      point.x - centerX
    ) * 180 / Math.PI;
    
    // Normalize angles to 0-360 range
    const normalizedStartAngle = ((startRadians * 180 / Math.PI) + 360) % 360;
    const normalizedEndAngle = ((normalizedStartAngle + angle) + 360) % 360;
    const normalizedPointAngle = (pointAngle + 360) % 360;
    
    // Check if point angle is within segment angle range
    if (normalizedEndAngle > normalizedStartAngle) {
      return normalizedPointAngle >= normalizedStartAngle && 
             normalizedPointAngle <= normalizedEndAngle;
    } else {
      // Handle case where end angle wraps around 360
      return normalizedPointAngle >= normalizedStartAngle || 
             normalizedPointAngle <= normalizedEndAngle;
    }
  }
} 