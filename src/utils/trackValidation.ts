import { Track, TrackSegment } from '../types/Track';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const validateSegmentConnection = (current: TrackSegment, next: TrackSegment): boolean => {
  const tolerance = 0.001; // Small tolerance for floating-point comparisons
  return (
    Math.abs(current.end.x - next.start.x) < tolerance &&
    Math.abs(current.end.y - next.start.y) < tolerance
  );
};

const validateSegment = (segment: TrackSegment): string[] => {
  const errors: string[] = [];

  if (!segment.id) {
    errors.push(`Segment missing ID`);
  }

  if (segment.width <= 0) {
    errors.push(`Segment ${segment.id}: Invalid width (${segment.width})`);
  }

  if (!segment.start || typeof segment.start.x !== 'number' || typeof segment.start.y !== 'number') {
    errors.push(`Segment ${segment.id}: Invalid start coordinates`);
  }

  if (!segment.end || typeof segment.end.x !== 'number' || typeof segment.end.y !== 'number') {
    errors.push(`Segment ${segment.id}: Invalid end coordinates`);
  }

  return errors;
};

export const validateTrack = (track: Track): ValidationResult => {
  const errors: string[] = [];
  console.log(`Validating track: ${track.name} (${track.id})`);

  // Check basic properties
  if (!track.id || !track.name) {
    errors.push('Track missing required properties (id or name)');
  }

  // Validate segments
  if (!Array.isArray(track.segments) || track.segments.length === 0) {
    errors.push('Track has no segments');
  } else {
    // Check individual segments
    track.segments.forEach((segment, index) => {
      const segmentErrors = validateSegment(segment);
      errors.push(...segmentErrors);

      // Check connection with next segment
      if (index < track.segments.length - 1) {
        const nextSegment = track.segments[index + 1];
        if (!validateSegmentConnection(segment, nextSegment)) {
          errors.push(
            `Segment ${segment.id} does not connect properly to segment ${nextSegment.id}`
          );
        }
      }
    });

    // Check if track is closed (last segment connects to first)
    const firstSegment = track.segments[0];
    const lastSegment = track.segments[track.segments.length - 1];
    if (!validateSegmentConnection(lastSegment, firstSegment)) {
      errors.push('Track is not closed (last segment doesn\'t connect to first)');
    }
  }

  // Validate checkpoints
  if (!Array.isArray(track.checkpoints) || track.checkpoints.length === 0) {
    errors.push('Track has no checkpoints');
  } else {
    // Check checkpoint properties
    track.checkpoints.forEach((checkpoint) => {
      if (!checkpoint.id) {
        errors.push('Checkpoint missing ID');
      }
      if (typeof checkpoint.position?.x !== 'number' || typeof checkpoint.position?.y !== 'number') {
        errors.push(`Checkpoint ${checkpoint.id}: Invalid position`);
      }
      if (typeof checkpoint.order !== 'number' || checkpoint.order < 0) {
        errors.push(`Checkpoint ${checkpoint.id}: Invalid order`);
      }
    });

    // Check checkpoint order sequence
    const orders = track.checkpoints.map(cp => cp.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i) {
        errors.push('Checkpoint order sequence is not continuous');
        break;
      }
    }
  }

  if (errors.length > 0) {
    console.warn(`Track validation failed for ${track.name}:`, errors);
  } else {
    console.log(`Track ${track.name} validated successfully`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 