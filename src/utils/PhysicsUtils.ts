import Vehicle from '../models/Vehicle';

/**
 * Utility functions for physics and movement calculations
 */
export class PhysicsUtils {
  /**
   * Calculate acceleration based on vehicle properties
   * @param vehicle The vehicle to calculate acceleration for
   * @param currentSpeed Current speed in m/s
   * @param deltaTime Time since last update in ms
   * @returns Speed increase in m/s
   */
  static calculateAcceleration(
    vehicle: Vehicle,
    currentSpeed: number,
    deltaTime: number
  ): number {
    // Convert km/h to m/s for top speed
    const topSpeedMs = vehicle.performance.topSpeed / 3.6;
    
    // Base acceleration inversely proportional to 0-100 km/h time
    // and scaled by time delta
    const baseAccel = (100 / 3.6) / (vehicle.performance.acceleration * 1000);
    
    // Acceleration decreases as speed approaches top speed
    const speedFactor = Math.max(0, 1 - (currentSpeed / topSpeedMs));
    
    // Calculate final acceleration with diminishing returns at higher speeds
    return baseAccel * speedFactor * (deltaTime / 1000);
  }
  
  /**
   * Calculate braking force based on vehicle properties
   * @param vehicle The vehicle to calculate braking for
   * @param currentSpeed Current speed in m/s
   * @param deltaTime Time since last update in ms
   * @returns Speed decrease in m/s
   */
  static calculateBraking(
    vehicle: Vehicle,
    currentSpeed: number,
    deltaTime: number
  ): number {
    // Base braking force inversely proportional to braking distance
    // and scaled by time delta
    const baseBraking = (100 / 3.6) / (vehicle.performance.brakingDistance / 100);
    
    // Adjust based on current speed (higher speed = more effective braking)
    const speedFactor = Math.min(1, currentSpeed / (50 / 3.6)); // Max effect at 50 km/h
    
    return baseBraking * speedFactor * (deltaTime / 1000);
  }
  
  /**
   * Calculate vehicle drag (natural slowdown)
   * @param vehicle The vehicle
   * @param currentSpeed Current speed in m/s
   * @param deltaTime Time since last update in ms
   * @returns Speed decrease due to drag in m/s
   */
  static calculateDrag(
    vehicle: Vehicle,
    currentSpeed: number,
    deltaTime: number
  ): number {
    // Simple quadratic drag model: drag increases with square of velocity
    // Also factor in vehicle weight: heavier vehicles have more momentum
    const dragCoefficient = 0.05 / (vehicle.specs.weight / 1000);
    
    return dragCoefficient * (currentSpeed * currentSpeed) * (deltaTime / 1000);
  }
  
  /**
   * Calculate steering angle change based on vehicle properties
   * @param vehicle The vehicle
   * @param currentSpeed Current speed in m/s
   * @param deltaTime Time since last update in ms
   * @returns Rotation change in degrees
   */
  static calculateSteering(
    vehicle: Vehicle,
    currentSpeed: number,
    deltaTime: number
  ): number {
    // Base steering factor, adjusted for vehicle weight
    // Lighter vehicles turn more quickly
    const baseSteeringFactor = 150 * (1000 / vehicle.specs.weight);
    
    // Steering effectiveness based on speed
    // - At very low speeds, steering is reduced (simulates difficulty turning when barely moving)
    // - At medium speeds, steering is most effective
    // - At high speeds, steering is reduced (simulates understeer at high speed)
    const speedKmh = currentSpeed * 3.6;
    let speedFactor;
    
    if (speedKmh < 10) {
      // Below 10 km/h: limited steering
      speedFactor = speedKmh / 10;
    } else if (speedKmh < 50) {
      // 10-50 km/h: optimal steering
      speedFactor = 1.0;
    } else {
      // Above 50 km/h: declining steering
      speedFactor = 1.0 - Math.min(0.7, (speedKmh - 50) / 100);
    }
    
    return baseSteeringFactor * speedFactor * (deltaTime / 1000);
  }
  
  /**
   * Calculate collision response
   * @param mass1 Mass of first object in kg
   * @param velocity1 Velocity of first object in m/s
   * @param mass2 Mass of second object in kg
   * @param velocity2 Velocity of second object in m/s
   * @returns New velocities for both objects after collision
   */
  static calculateCollision(
    mass1: number,
    velocity1: number,
    mass2: number,
    velocity2: number
  ): { v1: number, v2: number } {
    // Elastic collision formula
    const newV1 = ((mass1 - mass2) * velocity1 + 2 * mass2 * velocity2) / (mass1 + mass2);
    const newV2 = ((mass2 - mass1) * velocity2 + 2 * mass1 * velocity1) / (mass1 + mass2);
    
    return { v1: newV1, v2: newV2 };
  }
} 