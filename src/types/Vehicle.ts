export interface Decal {
  id: string;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
}

export interface VehicleVisuals {
  color: string;
  decals: Decal[];
}

export interface Vehicle {
  id: string;
  name: string;
  speed: number;
  acceleration: number;
  handling: number;
  visuals: VehicleVisuals;
  validationErrors?: string[];
} 