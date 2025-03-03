export interface VehicleVisuals {
  color: string;
  decals: {
    id: string;
    position: { x: number; y: number };
    rotation: number;
    scale: number;
  }[];
}

export interface Vehicle {
  id: string;
  name: string;
  speed: number;
  acceleration: number;
  handling: number;
  visuals: VehicleVisuals;
} 