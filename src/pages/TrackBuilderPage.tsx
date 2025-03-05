import React, { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { TrackEditor } from '../components/TrackEditor/TrackEditor';
import { TrackBuilderService } from '../services/TrackBuilderService';
import { TrackService } from '../services/TrackService';
import { Track } from '../types/Track';
import { ControlPoint } from '../types/TrackEditor';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #000;
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  position: relative;
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    display: block !important;
    background-image: repeating-conic-gradient(
      #000 0% 25%,
      #111 25% 50%,
      #000 50% 75%,
      #111 75% 100%
    );
    background-size: 100px 100px;
    animation: flagWave 4s infinite ease-in-out;
    transform-origin: center center;
    pointer-events: none;
    backface-visibility: hidden;
    -webkit-font-smoothing: antialiased;
    will-change: transform;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #00f0ff;
  border-radius: 8px;
  margin: 1rem;
`;

const Title = styled.h1`
  color: #00f0ff;
  text-shadow: 0 0 10px #00f0ff;
  font-size: 2rem;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'accent' }>`
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid ${props => {
    switch (props.variant) {
      case 'primary': return '#0f0';
      case 'secondary': return '#00f0ff';
      case 'accent': return '#f0f';
      default: return '#0f0';
    }
  }};
  border-radius: 4px;
  padding: 0.75rem 1rem;
  color: ${props => {
    switch (props.variant) {
      case 'primary': return '#0f0';
      case 'secondary': return '#00f0ff';
      case 'accent': return '#f0f';
      default: return '#0f0';
    }
  }};
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    text-shadow: 0 0 10px ${props => {
      switch (props.variant) {
        case 'primary': return '#0f0';
        case 'secondary': return '#00f0ff';
        case 'accent': return '#f0f';
        default: return '#0f0';
      }
    }};
    box-shadow: 0 0 10px ${props => {
      switch (props.variant) {
        case 'primary': return 'rgba(0, 255, 0, 0.3)';
        case 'secondary': return 'rgba(0, 240, 255, 0.3)';
        case 'accent': return 'rgba(255, 0, 255, 0.3)';
        default: return 'rgba(0, 255, 0, 0.3)';
      }
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TrackNameInput = styled.input`
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #00f0ff;
  border-radius: 4px;
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;

  &:focus {
    outline: none;
    box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  margin: 1rem;
  background: rgba(255, 0, 0, 0.1);
  border: 2px solid #f00;
  border-radius: 4px;
  color: #f00;
  text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #0f0;
  border-radius: 8px;
  padding: 2rem;
  min-width: 400px;
  z-index: 1000;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 999;
`;

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  margin: 1rem 0;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #000;
  }

  &::-webkit-scrollbar-thumb {
    background: #0f0;
    border-radius: 4px;
  }
`;

const TrackItem = styled.button`
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #0f0;
  border-radius: 4px;
  padding: 1rem;
  color: #0f0;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 255, 0, 0.1);
    text-shadow: 0 0 10px #0f0;
  }
`;

const ModalTitle = styled.h2`
  color: #0f0;
  text-shadow: 0 0 10px #0f0;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

export const TrackBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [trackName, setTrackName] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showLoadModal, setShowLoadModal] = useState<boolean>(false);
  const [savedTracks, setSavedTracks] = useState<Track[]>([]);
  const [loadedTrack, setLoadedTrack] = useState<Track | undefined>();

  useEffect(() => {
    // Load tracks when component mounts
    const trackService = TrackService.getInstance();
    trackService.loadCustomTracks(); // Load tracks first
    const tracks = trackService.getCustomTracks(); // Then get them
    setSavedTracks(tracks);
  }, []);

  const handleSaveTrack = (controlPoints: ControlPoint[], trackWidth: number) => {
    try {
      setIsSaving(true);
      setError('');

      if (!trackName) {
        setError('Please enter a track name');
        return;
      }

      const trackBuilderService = TrackBuilderService.getInstance();
      const trackService = TrackService.getInstance();

      const track: Track = trackBuilderService.controlPointsToTrack(
        controlPoints,
        trackWidth,
        trackName
      );

      const validation = trackBuilderService.validateTrack(track);
      if (!validation.isValid) {
        setError(`Invalid track: ${validation.errors.join(', ')}`);
        return;
      }

      trackService.saveCustomTrack(track);
      alert('Track saved successfully!');
      setLoadedTrack(track);

      // Refresh the list of saved tracks
      const updatedTracks = trackService.getCustomTracks();
      setSavedTracks(updatedTracks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save track');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadTrack = () => {
    const trackService = TrackService.getInstance();
    trackService.loadCustomTracks(); // Load tracks first
    const tracks = trackService.getCustomTracks(); // Then get them
    setSavedTracks(tracks);
    setShowLoadModal(true);
  };

  const handleSelectTrack = (track: Track) => {
    setLoadedTrack(track);
    setTrackName(track.name);
    setShowLoadModal(false);
  };

  const handleTestTrack = () => {
    if (!loadedTrack) {
      setError('Please save the track before testing');
      return;
    }

    // Navigate to the race screen with the current track
    navigate(`/race/${loadedTrack.id}`);
  };

  const handleLoadDebugTrack = () => {
    const trackService = TrackService.getInstance();
    const debugTracks = trackService.loadDebugTracks();
    if (debugTracks.length > 0) {
      const debugTrack = debugTracks[0];
      trackService.saveCustomTrack(debugTrack);
      setLoadedTrack(debugTrack);
      setTrackName(debugTrack.name);
      
      // Refresh the list of saved tracks
      const updatedTracks = trackService.getCustomTracks();
      setSavedTracks(updatedTracks);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Track Builder</Title>
        <Controls>
          <TrackNameInput
            type="text"
            value={trackName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTrackName(e.target.value)}
            placeholder="Enter track name"
          />
          <Button variant="secondary" onClick={handleLoadTrack}>Load Track</Button>
          <Button variant="accent" onClick={handleLoadDebugTrack}>Debug Track</Button>
          <Button 
            variant="primary" 
            onClick={handleTestTrack}
            disabled={!loadedTrack}
          >
            Test Track
          </Button>
        </Controls>
      </Header>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <TrackEditor onSave={handleSaveTrack} loadedTrack={loadedTrack} />

      {showLoadModal && (
        <>
          <Overlay onClick={() => setShowLoadModal(false)} />
          <Modal>
            <ModalTitle>Load Track</ModalTitle>
            <TrackList>
              {savedTracks.map((track) => (
                <TrackItem key={track.id} onClick={() => handleSelectTrack(track)}>
                  {track.name}
                </TrackItem>
              ))}
              {savedTracks.length === 0 && (
                <div style={{ color: '#666' }}>No saved tracks found</div>
              )}
            </TrackList>
            <ButtonGroup>
              <Button variant="primary" onClick={() => setShowLoadModal(false)}>Close</Button>
            </ButtonGroup>
          </Modal>
        </>
      )}
    </Container>
  );
}; 