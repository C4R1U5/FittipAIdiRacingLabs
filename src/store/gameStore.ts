import { create } from 'zustand';
import { Track } from '../types/Track';
import { Vehicle } from '../types/Vehicle';

interface GameState {
  tracks: Track[];
  selectedTrack: Track | null;
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  
  // Track actions
  addTrack: (track: Track) => void;
  selectTrack: (trackId: string) => void;
  updateTrack: (track: Track) => void;
  deleteTrack: (trackId: string) => void;
  
  // Vehicle actions
  addVehicle: (vehicle: Vehicle) => void;
  selectVehicle: (vehicleId: string) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (vehicleId: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  tracks: [],
  selectedTrack: null,
  vehicles: [],
  selectedVehicle: null,

  // Track actions
  addTrack: (track) => set((state) => ({ 
    tracks: [...state.tracks, track] 
  })),
  
  selectTrack: (trackId) => set((state) => ({ 
    selectedTrack: state.tracks.find(t => t.id === trackId) || null 
  })),
  
  updateTrack: (track) => set((state) => ({ 
    tracks: state.tracks.map(t => t.id === track.id ? track : t) 
  })),
  
  deleteTrack: (trackId) => set((state) => ({ 
    tracks: state.tracks.filter(t => t.id !== trackId),
    selectedTrack: state.selectedTrack?.id === trackId ? null : state.selectedTrack
  })),

  // Vehicle actions
  addVehicle: (vehicle) => set((state) => ({ 
    vehicles: [...state.vehicles, vehicle] 
  })),
  
  selectVehicle: (vehicleId) => set((state) => ({ 
    selectedVehicle: state.vehicles.find(v => v.id === vehicleId) || null 
  })),
  
  updateVehicle: (vehicle) => set((state) => ({ 
    vehicles: state.vehicles.map(v => v.id === vehicle.id ? vehicle : v) 
  })),
  
  deleteVehicle: (vehicleId) => set((state) => ({ 
    vehicles: state.vehicles.filter(v => v.id !== vehicleId),
    selectedVehicle: state.selectedVehicle?.id === vehicleId ? null : state.selectedVehicle
  })),
})); 