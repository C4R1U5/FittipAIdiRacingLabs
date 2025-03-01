import React, { useState, useRef } from 'react';
import { Track, TrackSegment, SegmentType } from '../models/Track';
import { TrackUtils } from '../utils/TrackUtils';

interface TrackEditorProps {
  initialTrack?: Track;
  onSave: (track: Track) => void;
  onCancel: () => void;
}

const TrackEditor: React.FC<TrackEditorProps> = ({ initialTrack, onSave, onCancel }) => {
  const [track, setTrack] = useState<Track>(initialTrack || {
    id: '',
    name: 'New Track',
    author: 'Player',
    segments: [],
    startPosition: { x: 100, y: 300 },
    checkpoints: []
  });
  
  const [selectedSegmentType, setSelectedSegmentType] = useState<SegmentType>('straight');
  const [trackName, setTrackName] = useState(track.name);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleAddSegment = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newSegment: TrackSegment = {
      id: `segment-${track.segments.length + 1}`,
      type: selectedSegmentType,
      position: { x, y },
      rotation: 0,
      length: selectedSegmentType === 'straight' ? 100 : 0,
      width: 30
    };
    
    // Use TrackUtils to ensure valid track connections
    const updatedSegments = TrackUtils.addSegmentWithAutoSnap(
      [...track.segments],
      newSegment
    );
    
    setTrack({ ...track, segments: updatedSegments });
  };
  
  const handleSave = () => {
    const updatedTrack = { ...track, name: trackName };
    if (TrackUtils.validateTrackCompletion(updatedTrack)) {
      onSave(updatedTrack);
    } else {
      alert('Track must form a complete loop!');
    }
  };
  
  return (
    <div className="track-editor">
      <div className="editor-toolbar">
        <input
          type="text"
          value={trackName}
          onChange={(e) => setTrackName(e.target.value)}
          placeholder="Track Name"
        />
        
        <div className="segment-selectors">
          <button 
            className={selectedSegmentType === 'straight' ? 'selected' : ''} 
            onClick={() => setSelectedSegmentType('straight')}
          >
            Straight
          </button>
          <button 
            className={selectedSegmentType === 'curve' ? 'selected' : ''} 
            onClick={() => setSelectedSegmentType('curve')}
          >
            Curve
          </button>
          <button 
            className={selectedSegmentType === 'checkpoint' ? 'selected' : ''} 
            onClick={() => setSelectedSegmentType('checkpoint')}
          >
            Checkpoint
          </button>
        </div>
        
        <div className="editor-actions">
          <button onClick={handleSave}>Save Track</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleAddSegment}
        className="editor-canvas"
      />
    </div>
  );
};

export default TrackEditor; 