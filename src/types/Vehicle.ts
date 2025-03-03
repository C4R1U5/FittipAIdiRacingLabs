export interface Decal {
  id: string;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
}

export interface VehicleVisuals {
  color: string;
  decals?: {
    primary?: string;
    secondary?: string;
    number?: string;
  };
}

export interface Vehicle {
  id: string;
  name: string;
  speed: number;  // 0-100
  acceleration: number;  // 0-100
  handling: number;  // 0-100
  visuals: VehicleVisuals;
  classification: 'official';  // Only official for now
  validationErrors?: string[];
} 