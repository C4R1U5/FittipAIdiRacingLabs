import { Track, TrackClassification } from '../types/Track';
import { validateTrack } from '../utils/trackValidation';

const LOCALSTORAGE_KEY = 'fittipaldi_custom_tracks';

export class TrackService {
  private static instance: TrackService;
  private officialTracks: Track[] = [];
  private customTracks: Track[] = [];

  private constructor() {}

  public static getInstance(): TrackService {
    if (!TrackService.instance) {
      TrackService.instance = new TrackService();
    }
    return TrackService.instance;
  }

  public async loadOfficialTracks(): Promise<Track[]> {
    try {
      console.log('Loading official tracks...');
      // In a real implementation, this would load from JSON files
      // For now, we'll use the demo tracks
      const tracks = await import('../data/tracks/official.json');
      this.officialTracks = tracks.default.map(track => ({
        ...track,
        classification: 'official' as TrackClassification,
        createdAt: new Date(track.createdAt)
      }));

      // Validate each track
      this.officialTracks = this.officialTracks.map(track => {
        const validation = validateTrack(track);
        if (!validation.isValid) {
          return {
            ...track,
            classification: 'invalid' as TrackClassification,
            validationErrors: validation.errors
          };
        }
        return track;
      });

      console.log(`Loaded ${this.officialTracks.length} official tracks`);
      return this.officialTracks;
    } catch (error) {
      console.error('Failed to load official tracks:', error);
      return [];
    }
  }

  public loadCustomTracks(): Track[] {
    try {
      console.log('Loading custom tracks from localStorage...');
      const storedTracks = localStorage.getItem(LOCALSTORAGE_KEY);
      if (!storedTracks) {
        console.log('No custom tracks found in localStorage');
        return [];
      }

      this.customTracks = JSON.parse(storedTracks).map((track: any) => ({
        ...track,
        classification: 'custom' as TrackClassification,
        createdAt: new Date(track.createdAt)
      }));

      // Validate each track
      this.customTracks = this.customTracks.map(track => {
        const validation = validateTrack(track);
        if (!validation.isValid) {
          return {
            ...track,
            classification: 'invalid' as TrackClassification,
            validationErrors: validation.errors
          };
        }
        return track;
      });

      console.log(`Loaded ${this.customTracks.length} custom tracks`);
      return this.customTracks;
    } catch (error) {
      console.error('Failed to load custom tracks:', error);
      return [];
    }
  }

  public saveCustomTrack(track: Track): void {
    try {
      console.log(`Saving custom track: ${track.name}`);
      const validation = validateTrack(track);
      const trackToSave: Track = {
        ...track,
        classification: validation.isValid ? 'custom' : 'invalid',
        validationErrors: validation.isValid ? undefined : validation.errors
      };

      // Load existing tracks
      const existingTracks = this.loadCustomTracks();
      const updatedTracks = [...existingTracks];

      // Update or add the track
      const existingIndex = updatedTracks.findIndex(t => t.id === track.id);
      if (existingIndex >= 0) {
        updatedTracks[existingIndex] = trackToSave;
      } else {
        updatedTracks.push(trackToSave);
      }

      // Save back to localStorage
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updatedTracks));
      this.customTracks = updatedTracks;
      console.log(`Successfully saved track: ${track.name}`);
    } catch (error) {
      console.error('Failed to save custom track:', error);
      throw error;
    }
  }

  public getAllTracks(): Track[] {
    return [...this.officialTracks, ...this.customTracks];
  }

  public getTrackById(id: string): Track | undefined {
    return this.getAllTracks().find(track => track.id === id);
  }
} 