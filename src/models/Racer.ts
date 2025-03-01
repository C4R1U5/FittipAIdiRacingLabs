import Vehicle from './Vehicle';

/**
 * Racer type for AI and player racers
 */
export interface Racer {
  id: string;
  name: string;
  type: 'ai' | 'player';
  vehicle: Vehicle;
  
  // Position and movement
  position: {
    x: number;
    y: number;
  };
  rotation: number; // Degrees, 0 = up, 90 = right
  velocity: number; // Speed in m/s
  
  // Race state
  lap: number;
  checkpointsPassed: number[]; // Indices of checkpoints passed in current lap
  finished: boolean;
  finishTime: number; // Time in ms
  
  // Input state (for player-controlled racers)
  isAccelerating: boolean;
  isBraking: boolean;
  isTurningLeft: boolean;
  isTurningRight: boolean;
  
  // Power-up effects
  hasShield: boolean;
}

/**
 * Create a player racer
 */
export const createPlayerRacer = (name: string, vehicle: Vehicle): Racer => {
  return {
    id: `player-${Date.now()}`,
    name,
    type: 'player',
    vehicle,
    position: { x: 0, y: 0 },
    rotation: 0,
    velocity: 0,
    lap: 0,
    checkpointsPassed: [],
    finished: false,
    finishTime: 0,
    isAccelerating: false,
    isBraking: false,
    isTurningLeft: false,
    isTurningRight: false,
    hasShield: false
  };
};

/**
 * Create an AI racer
 */
export const createAIRacer = (name: string, vehicle: Vehicle, difficulty: 'easy' | 'medium' | 'hard'): Racer => {
  // In a real implementation, the AI difficulty would affect its behavior
  return {
    id: `ai-${Date.now()}`,
    name,
    type: 'ai',
    vehicle,
    position: { x: 0, y: 0 },
    rotation: 0,
    velocity: 0,
    lap: 0,
    checkpointsPassed: [],
    finished: false,
    finishTime: 0,
    // These inputs will be controlled by AI logic
    isAccelerating: false,
    isBraking: false,
    isTurningLeft: false,
    isTurningRight: false,
    hasShield: false
  };
};

/**
 * Update player racer inputs
 */
export const updatePlayerInput = (
  racer: Racer,
  inputs: {
    isAccelerating?: boolean;
    isBraking?: boolean;
    isTurningLeft?: boolean;
    isTurningRight?: boolean;
  }
): Racer => {
  return {
    ...racer,
    ...inputs
  };
}; 