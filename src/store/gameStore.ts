import { create } from 'zustand';
import { Track } from '../types/Track';
import { Vehicle } from '../types/Vehicle';
import { trackService } from '../services/TrackService';
import { vehicleService } from '../services/VehicleService';

// Placeholder data for vehicles until we implement the vehicle system
const DEMO_VEHICLES: Vehicle[] = [
  {
    id: 'speedster-gt',
    name: 'Speedster GT',
    speed: 85,
    acceleration: 80,
    handling: 75,
    visuals: {
      color: '#ff0000',
      decals: [],
    },
  },
  {
    id: 'thunder-mk2',
    name: 'Thunder Mk2',
    speed: 90,
    acceleration: 70,
    handling: 85,
    visuals: {
      color: '#0066ff',
      decals: [],
    },
  },
  {
    id: 'flash-prototype',
    name: 'Flash Prototype',
    speed: 95,
    acceleration: 90,
    handling: 70,
    visuals: {
      color: '#ffff00',
      decals: [],
    },
  },
];

interface GameState {
  // Debug mode
  isDebugMode: boolean;
  toggleDebugMode: () => void;
  
  // Track Management
  tracks: Track[];
  selectedTrack: Track | null;
  availableTracks: Track[];
  currentTrack: Track | null;
  
  // Vehicle Management
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  availableVehicles: Vehicle[];
  currentVehicle: Vehicle | null;
  
  // Track actions
  loadTracks: () => Promise<void>;
  addTrack: (track: Track) => void;
  selectTrack: (trackId: string) => void;
  updateTrack: (track: Track) => void;
  deleteTrack: (trackId: string) => void;
  setCurrentTrack: (track: Track) => void;
  
  // Vehicle actions
  loadVehicles: () => Promise<void>;
  selectVehicle: (vehicleId: string) => void;
  setCurrentVehicle: (vehicle: Vehicle) => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  isDebugMode: false,
  tracks: [],
  selectedTrack: null,
  availableTracks: [],
  currentTrack: null,
  vehicles: [],
  selectedVehicle: null,
  availableVehicles: [],
  currentVehicle: null,
  
  // Debug actions
  toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),
  
  // Track actions
  loadTracks: async () => {
    const tracks = await trackService.loadAllTracks();
    set({ availableTracks: tracks });
  },

  addTrack: (track) => {
    const trackService = TrackService.getInstance();
    trackService.saveCustomTrack(track);
    set((state) => ({ 
      tracks: [...state.tracks, track],
      availableTracks: [...state.availableTracks, track]
    }));
  },
  
  selectTrack: (trackId) => set((state) => ({ 
    selectedTrack: state.availableTracks.find(t => t.id === trackId) || null 
  })),
  
  updateTrack: (track) => {
    const trackService = TrackService.getInstance();
    if (track.classification === 'custom') {
      trackService.saveCustomTrack(track);
    }
    set((state) => ({ 
      tracks: state.tracks.map(t => t.id === track.id ? track : t),
      availableTracks: state.availableTracks.map(t => t.id === track.id ? track : t)
    }));
  },
  
  deleteTrack: (trackId) => set((state) => {
    const track = state.tracks.find(t => t.id === trackId);
    if (track?.classification === 'custom') {
      // Remove from localStorage if it's a custom track
      const trackService = TrackService.getInstance();
      const customTracks = trackService.loadCustomTracks().filter(t => t.id !== trackId);
      localStorage.setItem('fittipaldi_custom_tracks', JSON.stringify(customTracks));
    }
    
    return {
      tracks: state.tracks.filter(t => t.id !== trackId),
      availableTracks: state.availableTracks.filter(t => t.id !== trackId),
      selectedTrack: state.selectedTrack?.id === trackId ? null : state.selectedTrack
    };
  }),

  setCurrentTrack: (track) => set(() => ({
    currentTrack: track
  })),

  // Vehicle actions
  loadVehicles: async () => {
    const vehicles = await vehicleService.loadVehicles();
    set({ availableVehicles: vehicles });
  },
  
  selectVehicle: (vehicleId) => set((state) => ({ 
    selectedVehicle: state.availableVehicles.find(v => v.id === vehicleId) || null 
  })),

  setCurrentVehicle: (vehicle) => set(() => ({
    currentVehicle: vehicle
  })),

  // New actions
  setSelectedTrack: (track) => set({ selectedTrack: track }),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle })
})); 