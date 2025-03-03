import { Vehicle, Decal } from '../types/Vehicle';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const validateDecal = (decal: Decal): string[] => {
  const errors: string[] = [];

  if (!decal.id) {
    errors.push('Decal missing ID');
  }

  if (!decal.position || typeof decal.position.x !== 'number' || typeof decal.position.y !== 'number') {
    errors.push(`Decal ${decal.id}: Invalid position`);
  }

  if (typeof decal.rotation !== 'number') {
    errors.push(`Decal ${decal.id}: Invalid rotation`);
  }

  if (typeof decal.scale !== 'number' || decal.scale <= 0) {
    errors.push(`Decal ${decal.id}: Invalid scale`);
  }

  return errors;
};

export const validateVehicle = (vehicle: Vehicle): ValidationResult => {
  const errors: string[] = [];
  console.log(`Validating vehicle: ${vehicle.name} (${vehicle.id})`);

  // Check basic properties
  if (!vehicle.id || !vehicle.name) {
    errors.push('Vehicle missing required properties (id or name)');
  }

  // Validate stats
  if (typeof vehicle.speed !== 'number' || vehicle.speed < 0 || vehicle.speed > 100) {
    errors.push('Invalid speed value (must be between 0 and 100)');
  }

  if (typeof vehicle.acceleration !== 'number' || vehicle.acceleration < 0 || vehicle.acceleration > 100) {
    errors.push('Invalid acceleration value (must be between 0 and 100)');
  }

  if (typeof vehicle.handling !== 'number' || vehicle.handling < 0 || vehicle.handling > 100) {
    errors.push('Invalid handling value (must be between 0 and 100)');
  }

  // Validate visuals
  if (!vehicle.visuals) {
    errors.push('Vehicle missing visuals');
  } else {
    // Validate color
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!colorRegex.test(vehicle.visuals.color)) {
      errors.push('Invalid color format (must be hex color, e.g., #FF0000)');
    }

    // Validate decals
    if (!Array.isArray(vehicle.visuals.decals)) {
      errors.push('Invalid decals array');
    } else {
      vehicle.visuals.decals.forEach(decal => {
        const decalErrors = validateDecal(decal);
        errors.push(...decalErrors);
      });
    }
  }

  if (errors.length > 0) {
    console.warn(`Vehicle validation failed for ${vehicle.name}:`, errors);
  } else {
    console.log(`Vehicle ${vehicle.name} validated successfully`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 