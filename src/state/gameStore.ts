import { create } from 'zustand';
import Vehicle from '../models/Vehicle';
import { Track, createEmptyTrack } from '../models/Track';
import { Racer, createPlayerRacer, createAIRacer } from '../models/Racer';
import { Leaderboard, createLeaderboard, LeaderboardEntry } from '../models/Leaderboard';

interface GameState {
  // Game status
  currentScreen: 'menu' | 'race' | 'editor' | 'garage' | 'leaderboard';
  isRacing: boolean;
  
  // Vehicles
  availableVehicles: Vehicle[];
  selectedVehicleId: string | null;
  
  // Tracks
  availableTracks: Track[];
  selectedTrackId: string | null;
  editorTrack: Track | null;
  
  // Racers
  player: Racer | null;
  aiRacers: Racer[];
  
  // Leaderboards
  leaderboards: Record<string, Leaderboard>;
  
  // Actions
  setCurrentScreen: (screen: GameState['currentScreen']) => void;
  setIsRacing: (isRacing: boolean) => void;
  
  selectVehicle: (vehicleId: string) => void;
  selectTrack: (trackId: string) => void;
  
  startRace: () => void;
  endRace: (playerTime: number) => void;
  
  createNewTrack: () => void;
  saveTrack: (track: Track) => void;
  
  addLeaderboardEntry: (trackId: string, playerName: string, time: number) => void;
}

// Initial vehicles
const initialVehicles: Vehicle[] = [
  {
    id: 'vehicle-1',
    make: 'Apex',
    model: 'Sprinter',
    year: 2023,
    type: 'car',
    specs: {
      engine: {
        type: 'Electric',
        displacement: 0,
        horsepower: 350,
        torque: 450
      },
      transmission: {
        type: 'automatic',
        gears: 1
      },
      weight: 1400,
      dimensions: {
        length: 4200,
        width: 1800,
        height: 1200,
        wheelbase: 2600
      }
    },
    performance: {
      topSpeed: 240,
      acceleration: 4.5,
      brakingDistance: 35
    },
    status: {
      condition: 'excellent',
      mileage: 1000,
      lastService: new Date()
    }
  },
  {
    id: 'vehicle-2',
    make: 'Velocity',
    model: 'Turbo GT',
    year: 2023,
    type: 'car',
    specs: {
      engine: {
        type: 'V8 Turbo',
        displacement: 4000,
        horsepower: 550,
        torque: 650
      },
      transmission: {
        type: 'sequential',
        gears: 7
      },
      weight: 1600,
      dimensions: {
        length: 4500,
        width: 1900,
        height: 1300,
        wheelbase: 2700
      }
    },
    performance: {
      topSpeed: 320,
      acceleration: 3.2,
      brakingDistance: 32
    },
    status: {
      condition: 'excellent',
      mileage: 500,
      lastService: new Date()
    }
  },
  {
    id: 'vehicle-3',
    make: 'Lightning',
    model: 'Agile',
    year: 2023,
    type: 'car',
    specs: {
      engine: {
        type: 'Inline-4',
        displacement: 2000,
        horsepower: 250,
        torque: 300
      },
      transmission: {
        type: 'manual',
        gears: 6
      },
      weight: 1200,
      dimensions: {
        length: 4000,
        width: 1750,
        height: 1150,
        wheelbase: 2500
      }
    },
    performance: {
      topSpeed: 220,
      acceleration: 5.8,
      brakingDistance: 38
    },
    status: {
      condition: 'good',
      mileage: 3000,
      lastService: new Date()
    }
  }
];

// Initial tracks
const initialTracks: Track[] = [
  {
    id: 'track-1',
    name: 'Monaco Circuit',
    author: 'System',
    segments: [], // In a real app, this would contain actual track segments
    startPosition: { x: 100, y: 300 },
    checkpoints: [
      { x: 300, y: 200 },
      { x: 500, y: 400 },
      { x: 200, y: 500 }
    ]
  },
  {
    id: 'track-2',
    name: 'Suzuka',
    author: 'System',
    segments: [], // In a real app, this would contain actual track segments
    startPosition: { x: 150, y: 250 },
    checkpoints: [
      { x: 350, y: 150 },
      { x: 550, y: 350 },
      { x: 250, y: 450 }
    ]
  }
];

// Create the store
export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  currentScreen: 'menu',
  isRacing: false,
  
  availableVehicles: initialVehicles,
  selectedVehicleId: null,
  
  availableTracks: initialTracks,
  selectedTrackId: null,
  editorTrack: null,
  
  player: null,
  aiRacers: [],
  
  leaderboards: initialTracks.reduce((acc, track) => {
    acc[track.id] = createLeaderboard(track.id);
    return acc;
  }, {} as Record<string, Leaderboard>),
  
  // Actions
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  
  setIsRacing: (isRacing) => set({ isRacing }),
  
  selectVehicle: (vehicleId) => {
    const state = get();
    const vehicle = state.availableVehicles.find(v => v.id === vehicleId);
    
    if (vehicle) {
      set({
        selectedVehicleId: vehicleId,
        player: createPlayerRacer('Player', vehicle)
      });
    }
  },
  
  selectTrack: (trackId) => {
    set({ selectedTrackId: trackId });
  },
  
  startRace: () => {
    const state = get();
    
    if (!state.player || !state.selectedTrackId) return;
    
    const selectedTrack = state.availableTracks.find(
      track => track.id === state.selectedTrackId
    );
    
    if (!selectedTrack) return;
    
    // Create AI racers
    const aiVehicles = state.availableVehicles.filter(
      v => v.id !== state.selectedVehicleId
    );
    
    const aiRacers = aiVehicles.map((vehicle, index) => 
      createAIRacer(`AI Racer ${index + 1}`, vehicle, 'medium')
    );
    
    set({
      isRacing: true,
      currentScreen: 'race',
      aiRacers
    });
  },
  
  endRace: (playerTime) => {
    const state = get();
    
    if (!state.player || !state.selectedTrackId) return;
    
    // Add entry to leaderboard
    if (playerTime > 0) {
      state.addLeaderboardEntry(
        state.selectedTrackId,
        state.player.name,
        playerTime
      );
    }
    
    set({
      isRacing: false,
      currentScreen: 'menu'
    });
  },
  
  createNewTrack: () => {
    set({
      editorTrack: createEmptyTrack(),
      currentScreen: 'editor'
    });
  },
  
  saveTrack: (track) => {
    const state = get();
    
    // Check if this is an update or new track
    const existingIndex = state.availableTracks.findIndex(t => t.id === track.id);
    
    if (existingIndex >= 0) {
      // Update existing track
      const updatedTracks = [...state.availableTracks];
      updatedTracks[existingIndex] = track;
      
      set({
        availableTracks: updatedTracks,
        editorTrack: null,
        currentScreen: 'menu'
      });
    } else {
      // Add new track
      set({
        availableTracks: [...state.availableTracks, track],
        editorTrack: null,
        currentScreen: 'menu'
      });
      
      // Create a leaderboard for the new track
      const updatedLeaderboards = { ...state.leaderboards };
      updatedLeaderboards[track.id] = createLeaderboard(track.id);
      
      set({ leaderboards: updatedLeaderboards });
    }
  },
  
  addLeaderboardEntry: (trackId, playerName, time) => {
    const state = get();
    
    if (!state.player || !trackId) return;
    
    const leaderboard = state.leaderboards[trackId];
    
    if (!leaderboard) return;
    
    const entry: LeaderboardEntry = {
      id: `entry-${Date.now()}`,
      trackId,
      playerName,
      vehicle: state.player.vehicle,
      time,
      date: Date.now()
    };
    
    const updatedLeaderboard = {
      ...leaderboard,
      entries: [...leaderboard.entries, entry]
    };
    
    const updatedLeaderboards = {
      ...state.leaderboards,
      [trackId]: updatedLeaderboard
    };
    
    set({ leaderboards: updatedLeaderboards });
  }
})); 