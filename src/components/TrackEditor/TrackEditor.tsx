import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Point2D, 
  ControlPoint, 
  TrackEditorState, 
  EditorMode,
  BezierSegment 
} from '../../types/TrackEditor';
import styles from './TrackEditor.module.css';
import styled from 'styled-components';
import { Track } from '../../types/Track';
import { TrackBuilderService } from '../../services/TrackBuilderService';
import { TrackSegment, TrackCheckpoint } from '../../types/Track';
import { useNavigate } from 'react-router-dom';

interface TrackEditorProps {
  onSave: (controlPoints: ControlPoint[], trackWidth: number) => void;
  loadedTrack?: Track;
}

const GRID_SIZE = 20;
const DEFAULT_TRACK_WIDTH = 20;
const MIN_TRACK_LENGTH = 3; // Minimum number of points needed for a valid track

const EditorContainer = styled.div`
  flex: 1;
  position: relative;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #00f0ff;
  border-radius: 8px;
  margin: 0 1rem 1rem;
  overflow: hidden;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  cursor: crosshair;
`;

const Controls = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.9);
  padding: 1rem;
  border: 2px solid #0f0;
  border-radius: 8px;
`;

const Button = styled.button`
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #0f0;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  color: #0f0;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    text-shadow: 0 0 10px #0f0;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TrackWidthControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: #0f0;
  font-size: 0.8rem;
`;

const TrackWidthInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #0f0;
  border-radius: 4px;
  color: #0f0;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;

  &:focus {
    outline: none;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
  }
`;

const BackToMenuButton = styled(Button)`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
`;

const TrackSegmentLine: React.FC<{
  segment: TrackSegment;
  isSelected?: boolean;
}> = ({ segment, isSelected }) => {
  const strokeWidth = segment.width || 20;
  const color = segment.sectorColor || '#FFFFFF';

  return (
    <g>
      {/* Main track line */}
      <line
        x1={segment.startPoint.x}
        y1={segment.startPoint.y}
        x2={segment.endPoint.x}
        y2={segment.endPoint.y}
        stroke="#333333"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Sector color line */}
      <line
        x1={segment.startPoint.x}
        y1={segment.startPoint.y}
        x2={segment.endPoint.x}
        y2={segment.endPoint.y}
        stroke={color}
        strokeWidth={strokeWidth * 0.5}
        strokeLinecap="round"
        strokeOpacity={0.8}
      />
      {/* Selection highlight */}
      {isSelected && (
        <line
          x1={segment.startPoint.x}
          y1={segment.startPoint.y}
          x2={segment.endPoint.x}
          y2={segment.endPoint.y}
          stroke="#00ff00"
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          strokeOpacity={0.3}
        />
      )}
    </g>
  );
};

const Checkpoint: React.FC<{
  checkpoint: TrackCheckpoint;
  isSelected?: boolean;
}> = ({ checkpoint, isSelected }) => {
  const radius = 10;
  const color = checkpoint.sectorColor || '#FFFFFF';

  return (
    <g>
      {/* Checkpoint circle */}
      <circle
        cx={checkpoint.position.x}
        cy={checkpoint.position.y}
        r={radius}
        fill="#333333"
        stroke={color}
        strokeWidth={3}
      />
      {/* Checkpoint number */}
      <text
        x={checkpoint.position.x}
        y={checkpoint.position.y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={12}
        fontFamily="monospace"
      >
        {checkpoint.order}
      </text>
      {/* Selection highlight */}
      {isSelected && (
        <circle
          cx={checkpoint.position.x}
          cy={checkpoint.position.y}
          r={radius + 2}
          fill="none"
          stroke="#00ff00"
          strokeWidth={2}
          strokeOpacity={0.5}
        />
      )}
    </g>
  );
};

export const TrackEditor: React.FC<TrackEditorProps> = ({ onSave, loadedTrack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [editorState, setEditorState] = useState<TrackEditorState>({
    controlPoints: [],
    isDragging: false,
    trackWidth: DEFAULT_TRACK_WIDTH,
    gridSize: GRID_SIZE,
    snapToGrid: true
  });
  const [mode, setMode] = useState<EditorMode>('add');
  const [isTrackComplete, setIsTrackComplete] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<Point2D | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [hasCheckpoints, setHasCheckpoints] = useState(false);

  useEffect(() => {
    if (loadedTrack) {
      const trackBuilderService = TrackBuilderService.getInstance();
      const points = trackBuilderService.trackToControlPoints(loadedTrack);
      setEditorState(prev => ({
        ...prev,
        controlPoints: points,
        trackWidth: loadedTrack.segments[0]?.width || DEFAULT_TRACK_WIDTH
      }));
      setIsTrackComplete(true);
      setMode('edit');
    }
  }, [loadedTrack]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        if (container) {
          const { width, height } = container.getBoundingClientRect();
          setCanvasSize({ width, height });
          canvas.width = width;
          canvas.height = height;
          drawTrack();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to snap point to grid
  const snapToGrid = (point: Point2D): Point2D => {
    if (!editorState.snapToGrid) return point;
    return {
      x: Math.round(point.x / editorState.gridSize) * editorState.gridSize,
      y: Math.round(point.y / editorState.gridSize) * editorState.gridSize
    };
  };

  // Calculate distance between two points
  const getDistance = (p1: Point2D, p2: Point2D): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Check if a point is close to another point
  const isPointNear = (p1: Point2D, p2: Point2D, threshold: number = 20): boolean => {
    return getDistance(p1, p2) < threshold;
  };

  // Calculate Bezier curve points
  const calculateBezierPoints = (segment: BezierSegment): Point2D[] => {
    const points: Point2D[] = [];
    const steps = 50;

    for (let t = 0; t <= 1; t += 1/steps) {
      const point = {
        x: Math.pow(1-t, 3) * segment.startPoint.x +
           3 * Math.pow(1-t, 2) * t * segment.controlPoint1.x +
           3 * (1-t) * Math.pow(t, 2) * segment.controlPoint2.x +
           Math.pow(t, 3) * segment.endPoint.x,
        y: Math.pow(1-t, 3) * segment.startPoint.y +
           3 * Math.pow(1-t, 2) * t * segment.controlPoint1.y +
           3 * (1-t) * Math.pow(t, 2) * segment.controlPoint2.y +
           Math.pow(t, 3) * segment.endPoint.y
      };
      points.push(point);
    }

    return points;
  };

  // Complete the track by connecting back to start
  const completeTrack = () => {
    if (editorState.controlPoints.length < MIN_TRACK_LENGTH) {
      alert('Please add at least 3 points before completing the track');
      return;
    }

    // Add a final control point at the start position to close the loop
    const startPoint = editorState.controlPoints[0];
    const finalPoint: ControlPoint = {
      id: uuidv4(),
      position: startPoint.position,
      type: 'normal'
    };

    setEditorState(prev => ({
      ...prev,
      controlPoints: [...prev.controlPoints, finalPoint]
    }));
    setIsTrackComplete(true);
    setMode('edit');
  };

  const addCheckpoints = () => {
    const trackBuilderService = TrackBuilderService.getInstance();
    const track = trackBuilderService.controlPointsToTrack(
      editorState.controlPoints,
      editorState.trackWidth,
      'temp'
    );

    // Update the control points with the new track data that includes sectors and checkpoints
    setEditorState(prev => ({
      ...prev,
      controlPoints: trackBuilderService.trackToControlPoints(track)
    }));
    setHasCheckpoints(true);
  };

  // Draw the track
  const drawTrack = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (editorState.snapToGrid) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvas.width; x += editorState.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += editorState.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw track segments
    if (editorState.controlPoints.length > 1) {
      const trackBuilderService = TrackBuilderService.getInstance();
      if (hasCheckpoints) {
        // Draw track with sectors and checkpoints
        const track = trackBuilderService.controlPointsToTrack(
          editorState.controlPoints,
          editorState.trackWidth,
          'temp'
        );

        // Draw segments with sector colors
        track.segments.forEach(segment => {
          ctx.strokeStyle = segment.sectorColor || '#333';
          ctx.lineWidth = editorState.trackWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          ctx.beginPath();
          ctx.moveTo(segment.startPoint.x, segment.startPoint.y);
          ctx.lineTo(segment.endPoint.x, segment.endPoint.y);
          ctx.stroke();
        });

        // Draw checkpoints
        track.checkpoints.forEach(checkpoint => {
          ctx.fillStyle = checkpoint.sectorColor || '#fff';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          
          // Draw checkpoint circle
          ctx.beginPath();
          ctx.arc(checkpoint.position.x, checkpoint.position.y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Draw checkpoint number
          ctx.fillStyle = '#000';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(checkpoint.order.toString(), checkpoint.position.x, checkpoint.position.y);
        });
      } else {
        // Draw regular track
        ctx.strokeStyle = '#333';
        ctx.lineWidth = editorState.trackWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const points = [...editorState.controlPoints];
        if (isTrackComplete && points.length > 0) {
          points.push(points[0]); // Connect back to start
        }

        for (let i = 0; i < points.length - 1; i++) {
          const current = points[i];
          const next = points[i + 1];
          
          ctx.beginPath();
          ctx.moveTo(current.position.x, current.position.y);
          ctx.lineTo(next.position.x, next.position.y);
          ctx.stroke();
        }
      }
    }

    // Draw control points
    editorState.controlPoints.forEach((point, index) => {
      const isStart = index === 0;
      const isSelected = point.id === editorState.selectedPointId;
      
      // Draw point
      ctx.fillStyle = isStart ? '#00ff00' : isSelected ? '#ff0000' : '#0000ff';
      ctx.beginPath();
      ctx.arc(point.position.x, point.position.y, isStart ? 8 : 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw point number
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), point.position.x, point.position.y);
    });

    // Draw hover preview
    if (hoveredPoint && mode === 'add' && !isTrackComplete) {
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      if (editorState.controlPoints.length > 0) {
        const lastPoint = editorState.controlPoints[editorState.controlPoints.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastPoint.position.x, lastPoint.position.y);
        ctx.lineTo(hoveredPoint.x, hoveredPoint.y);
        ctx.stroke();
      }

      // If near start point and we have enough points, show completion preview
      if (editorState.controlPoints.length >= MIN_TRACK_LENGTH && 
          isPointNear(hoveredPoint, editorState.controlPoints[0].position)) {
        ctx.strokeStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(editorState.controlPoints[0].position.x, 
                editorState.controlPoints[0].position.y, 
                10, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    // Draw guide text
    if (showGuide && editorState.controlPoints.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Click anywhere to start creating your track', canvas.width / 2, canvas.height / 2);
      ctx.font = '14px Arial';
      ctx.fillText('Click near the start point to complete the track', canvas.width / 2, canvas.height / 2 + 30);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point = snapToGrid({ x, y });

    setHoveredPoint(point);
    setShowGuide(false);
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isTrackComplete) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point = snapToGrid({ x, y });

    if (mode === 'add') {
      // Check if clicking near start point to complete track
      if (editorState.controlPoints.length >= MIN_TRACK_LENGTH && 
          editorState.controlPoints[0] &&
          isPointNear(point, editorState.controlPoints[0].position)) {
        completeTrack();
        return;
      }

      const newPoint: ControlPoint = {
        id: uuidv4(),
        position: point,
        type: 'normal'
      };

      setEditorState(prev => ({
        ...prev,
        controlPoints: [...prev.controlPoints, newPoint],
        selectedPointId: newPoint.id
      }));
    }
  };

  const handleSaveClick = () => {
    if (!isTrackComplete) {
      alert('Please complete the track before saving');
      return;
    }
    if (!hasCheckpoints) {
      alert('Please add checkpoints before saving');
      return;
    }
    onSave(editorState.controlPoints, editorState.trackWidth);
  };

  const handleUndoClick = () => {
    if (isTrackComplete) return;
    
    setEditorState(prev => ({
      ...prev,
      controlPoints: prev.controlPoints.slice(0, -1),
      selectedPointId: prev.controlPoints[prev.controlPoints.length - 2]?.id
    }));
  };

  const handleResetClick = () => {
    if (confirm('Are you sure you want to reset the track? This cannot be undone.')) {
      setEditorState({
        controlPoints: [],
        isDragging: false,
        trackWidth: DEFAULT_TRACK_WIDTH,
        gridSize: GRID_SIZE,
        snapToGrid: true
      });
      setIsTrackComplete(false);
      setMode('add');
      setShowGuide(true);
    }
  };

  const handleBackToMenu = () => {
    navigate('/'); // Navigate to the main menu
  };

  // Redraw when state changes
  useEffect(() => {
    drawTrack();
  }, [editorState, mode, isTrackComplete, hoveredPoint]);

  return (
    <EditorContainer>
      <Canvas ref={canvasRef} onClick={handleMouseDown} onMouseMove={handleMouseMove} />
      <BackToMenuButton onClick={handleBackToMenu}>Back to Menu</BackToMenuButton>
      <Controls>
        <TrackWidthControl>
          <label>Track Width</label>
          <TrackWidthInput
            type="number"
            min="10"
            max="100"
            value={editorState.trackWidth}
            onChange={(e) => setEditorState(prev => ({
              ...prev,
              trackWidth: Number(e.target.value)
            }))}
          />
        </TrackWidthControl>
        <Button 
          onClick={addCheckpoints} 
          disabled={!isTrackComplete || hasCheckpoints}
        >
          Add Checkpoints
        </Button>
        <Button 
          onClick={handleSaveClick} 
          disabled={!isTrackComplete || !hasCheckpoints}
        >
          Save Track
        </Button>
        <Button onClick={handleResetClick}>Reset</Button>
      </Controls>
    </EditorContainer>
  );
}; 