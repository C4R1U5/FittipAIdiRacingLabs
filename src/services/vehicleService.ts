import { Vehicle } from '../types/Vehicle';
import { validateVehicle } from '../utils/vehicleValidation';

export class VehicleService {
  private static instance: VehicleService;
  private vehicles: Vehicle[] = [];

  private constructor() {}

  public static getInstance(): VehicleService {
    if (!VehicleService.instance) {
      VehicleService.instance = new VehicleService();
    }
    return VehicleService.instance;
  }

  public async loadVehicles(): Promise<Vehicle[]> {
    try {
      console.log('Loading vehicles...');
      const vehicles = await import('../data/vehicles/official.json');
      this.vehicles = vehicles.default.map(vehicle => ({
        ...vehicle,
        validationErrors: undefined
      }));

      // Validate each vehicle
      this.vehicles = this.vehicles.map(vehicle => {
        const validation = validateVehicle(vehicle);
        if (!validation.isValid) {
          return {
            ...vehicle,
            validationErrors: validation.errors
          };
        }
        return vehicle;
      });

      console.log(`Loaded ${this.vehicles.length} vehicles`);
      return this.vehicles;
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      return [];
    }
  }

  public getVehicles(): Vehicle[] {
    return this.vehicles;
  }

  public getVehicleById(id: string): Vehicle | undefined {
    return this.vehicles.find(vehicle => vehicle.id === id);
  }
} 