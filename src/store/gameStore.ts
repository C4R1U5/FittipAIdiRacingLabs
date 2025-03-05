import { create } from 'zustand';
import { Track } from '../types/Track';
import { Vehicle, VehicleVisuals, Decal } from '../types/Vehicle';
import { TrackService } from '../services/trackService';
import { VehicleService } from '../services/vehicleService';

// Get service instances
const trackService = TrackService.getInstance();
const vehicleService = VehicleService.getInstance();

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
    classification: 'official'
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
    classification: 'official'
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
    classification: 'official'
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
  
  // New actions
  setSelectedTrack: (track: Track) => void;
  setSelectedVehicle: (vehicle: Vehicle) => void;
  
  // Additional state
  selectedTrackId: string | null;
  selectedVehicleId: string | null;
  isLoading: boolean;
  error: string | null;
}

const defaultVehicleVisuals: VehicleVisuals = {
  color: '#000000',
  decals: []
};

const defaultVehicle: Vehicle = {
  id: '',
  name: '',
  speed: 0,
  acceleration: 0,
  handling: 0,
  visuals: defaultVehicleVisuals,
  classification: 'official'
};

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  isDebugMode: false,
  tracks: [],
  selectedTrack: null,
  availableTracks: [],
  currentTrack: null,
  vehicles: [defaultVehicle],
  selectedVehicle: null,
  availableVehicles: [],
  currentVehicle: null,
  selectedTrackId: null,
  selectedVehicleId: null,
  isLoading: false,
  error: null,
  
  // Debug actions
  toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),
  
  // Track actions
  loadTracks: async () => {
    try {
      set({ isLoading: true, error: null });
      const tracks = await trackService.loadAllTracks();
      set({ tracks, availableTracks: tracks, isLoading: false });
    } catch (error) {
      console.error('Failed to load tracks:', error);
      set({ error: 'Failed to load tracks', isLoading: false });
    }
  },

  addTrack: (track) => {
    const trackService = TrackService.getInstance();
    trackService.saveCustomTrack(track);
    set((state) => ({ 
      tracks: [...state.tracks, track],
      availableTracks: [...state.availableTracks, track]
    }));
  },
  
  selectTrack: (trackId: string) => {
    set({ selectedTrackId: trackId });
  },
  
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
  
  deleteTrack: (trackId: string) => set((state) => {
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
    try {
      set({ isLoading: true, error: null });
      const vehicles = await vehicleService.loadVehicles();
      set({ vehicles, availableVehicles: vehicles, isLoading: false });
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      set({ error: 'Failed to load vehicles', isLoading: false });
    }
  },
  
  selectVehicle: (vehicleId: string) => {
    set({ selectedVehicleId: vehicleId });
  },

  setCurrentVehicle: (vehicle) => set(() => ({
    currentVehicle: vehicle
  })),

  // New actions
  setSelectedTrack: (track) => set({ selectedTrack: track }),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),

  setError: (error: string | null) => {
    set({ error });
  }
})); 