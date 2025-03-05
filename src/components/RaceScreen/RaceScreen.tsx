import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TrackService } from '../../services/trackService';
import { RaceEngine } from '../../services/RaceEngine';
import styled from 'styled-components';
import { Point2D, Track, TrackSegment } from '../../types/Track';

const RaceContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #2d5a27;
  position: relative;
  overflow: hidden;
`;

const HUD = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  font-family: 'Arial', sans-serif;
  font-size: 18px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  z-index: 10;
`;

const ArcadeHUD = styled(HUD)`
  font-family: 'Press Start 2P', monospace;
  color: #0f0;
  text-shadow: 0 0 10px #0f0;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 8px;
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #0f0;
  border-radius: 4px;
  color: #0f0;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  cursor: pointer;
  z-index: 20;
  transition: all 0.3s ease;

  &:hover {
    text-shadow: 0 0 10px #0f0;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
  }
`;

// F1 team colors
const F1_COLORS = {
  FERRARI: '#DC0000',
  MERCEDES: '#00D2BE',
  REDBULL: '#0600EF',
  MCLAREN: '#FF8700',
  ALPINE: '#0090FF',
  ASTON_MARTIN: '#006F62'
};

// F1 car drawing function
const drawF1Car = (ctx: CanvasRenderingContext2D, color: string = F1_COLORS.FERRARI) => {
  const scale = 1;
  const carWidth = 14 * scale;
  const carLength = 30 * scale;
  
  ctx.save();
  
  // Main body
  ctx.fillStyle = color;
  
  // Pointed nose
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(carLength * 0.7, -carWidth/2);
  ctx.lineTo(carLength * 0.7, carWidth/2);
  ctx.closePath();
  ctx.fill();
  
  // Side pods
  ctx.beginPath();
  ctx.moveTo(carLength * 0.7, -carWidth/2);
  ctx.lineTo(carLength * 0.4, -carWidth);
  ctx.lineTo(-carLength * 0.3, -carWidth);
  ctx.lineTo(-carLength * 0.3, -carWidth/2);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(carLength * 0.7, carWidth/2);
  ctx.lineTo(carLength * 0.4, carWidth);
  ctx.lineTo(-carLength * 0.3, carWidth);
  ctx.lineTo(-carLength * 0.3, carWidth/2);
  ctx.closePath();
  ctx.fill();
  
  // Rear wing
  ctx.fillRect(-carLength * 0.4, -carWidth, carWidth/2, carWidth * 2);
  
  // Front wing
  ctx.fillRect(carLength * 0.6, -carWidth * 0.9, carWidth/2, carWidth * 1.8);
  
  // Cockpit
  ctx.fillStyle = "#111";
  ctx.fillRect(carLength * 0.1, -carWidth * 0.3, carWidth * 0.7, carWidth * 0.6);
  
  // Wheels (shadows)
  ctx.fillStyle = "#222";
  ctx.fillRect(carLength * 0.5, -carWidth * 1.1, carWidth * 0.5, carWidth * 0.35);
  ctx.fillRect(carLength * 0.5, carWidth * 0.75, carWidth * 0.5, carWidth * 0.35);
  ctx.fillRect(-carLength * 0.2, -carWidth * 1.1, carWidth * 0.5, carWidth * 0.35);
  ctx.fillRect(-carLength * 0.2, carWidth * 0.75, carWidth * 0.5, carWidth * 0.35);
  
  ctx.restore();
};

// Catmull-Rom spline calculation for smooth curves that pass through control points
const calculateCatmullRomPoint = (p0: Point2D, p1: Point2D, p2: Point2D, p3: Point2D, t: number): Point2D => {
  // Catmull-Rom matrix coefficients
  const t2 = t * t;
  const t3 = t2 * t;
  
  // Catmull-Rom blending functions
  const b0 = 0.5 * (-t3 + 2*t2 - t);
  const b1 = 0.5 * (3*t3 - 5*t2 + 2);
  const b2 = 0.5 * (-3*t3 + 4*t2 + t);
  const b3 = 0.5 * (t3 - t2);
  
  // Calculate the point on the curve
  return {
    x: b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x,
    y: b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y
  };
};

// Generate a smooth path using Catmull-Rom splines
const generateSmoothPath = (points: Point2D[], segments: number = 10): Point2D[] => {
  if (points.length < 4) return points;
  
  const smoothedPath: Point2D[] = [];
  
  // For each segment between points
  for (let i = 0; i < points.length - 1; i++) {
    // Get 4 points needed for Catmull-Rom (with wrapping for closed loops)
    const p0 = i === 0 ? points[points.length - 2] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i === points.length - 2 ? points[1] : points[i + 2];
    
    // Add the start point
    smoothedPath.push(p1);
    
    // Add intermediate points
    for (let j = 1; j < segments; j++) {
      const t = j / segments;
      smoothedPath.push(calculateCatmullRomPoint(p0, p1, p2, p3, t));
    }
  }
  
  // Add the last point
  smoothedPath.push(points[points.length - 1]);
  
  return smoothedPath;
};

// Draw a checkered finish line
const drawFinishLine = (
  ctx: CanvasRenderingContext2D, 
  position: Point2D, 
  angle: number, 
  width: number, 
  thickness: number = 20
) => {
  const squareSize = 8; // Size of each checkered square
  const numSquares = Math.ceil(width / squareSize);
  
  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.rotate(angle);
  
  // Draw background
  ctx.fillStyle = 'white';
  ctx.fillRect(-width/2, -thickness/2, width, thickness);
  
  // Draw checkered pattern
  ctx.fillStyle = 'black';
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < numSquares; col++) {
      if ((row + col) % 2 === 0) {
        ctx.fillRect(
          -width/2 + col * squareSize, 
          -thickness/2 + row * (thickness/2), 
          squareSize, 
          thickness/2
        );
      }
    }
  }
  
  ctx.restore();
};

// Simple smooth track drawing with Catmull-Rom splines
const drawTrack = (
  ctx: CanvasRenderingContext2D,
  track: Track,
  currentCheckpoint: number,
  checkpointProgress: number
) => {
  // Clear with grass background
  ctx.fillStyle = '#2d5a27';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Add simple grass texture
  ctx.strokeStyle = '#28501f';
  ctx.lineWidth = 1;
  
  // Random grass lines
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * ctx.canvas.width;
    const y = Math.random() * ctx.canvas.height;
    const length = 10 + Math.random() * 20;
    const angle = Math.random() * Math.PI * 2;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length
    );
    ctx.stroke();
  }
  
  // Exit early if there are no segments
  if (!track.segments || track.segments.length === 0) {
    return;
  }
  
  // Create a complete loop of points for the track
  const trackPoints: Point2D[] = [];
  const segmentProperties: { width: number; sectorColor: string }[] = [];
  
  // Collect all segment data
  track.segments.forEach(segment => {
    trackPoints.push(segment.startPoint);
    segmentProperties.push({
      width: segment.width,
      sectorColor: segment.sectorColor || '#ffffff'
    });
  });
  
  // Add the last endpoint to close the loop
  if (track.segments.length > 0) {
    trackPoints.push(track.segments[track.segments.length - 1].endPoint);
    // Duplicate the last segment's properties for the closing segment
    segmentProperties.push(segmentProperties[segmentProperties.length - 1]);
  }
  
  if (trackPoints.length < 4) {
    // Not enough points for Catmull-Rom, fall back to simple lines
    if (trackPoints.length >= 2) {
      // Draw simple lines
      ctx.beginPath();
      ctx.moveTo(trackPoints[0].x, trackPoints[0].y);
      
      for (let i = 1; i < trackPoints.length; i++) {
        ctx.lineTo(trackPoints[i].x, trackPoints[i].y);
      }
      
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = segmentProperties[0].width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    return;
  }
  
  // Generate smooth path with Catmull-Rom splines
  const smoothedPath = generateSmoothPath(trackPoints, 12);
  
  // Draw track with multiple passes for better quality
  
  // Pass 1: Draw a shadow/outline for the track (larger than the track)
  ctx.beginPath();
  ctx.moveTo(smoothedPath[0].x, smoothedPath[0].y);
  
  for (let i = 1; i < smoothedPath.length; i++) {
    ctx.lineTo(smoothedPath[i].x, smoothedPath[i].y);
  }
  
  // Close the path for a complete loop
  ctx.closePath();
  
  ctx.strokeStyle = '#444444'; // Darker outline
  ctx.lineWidth = segmentProperties[0].width + 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  
  // Pass 2: Draw the main track path
  ctx.beginPath();
  ctx.moveTo(smoothedPath[0].x, smoothedPath[0].y);
  
  for (let i = 1; i < smoothedPath.length; i++) {
    ctx.lineTo(smoothedPath[i].x, smoothedPath[i].y);
  }
  
  // Close the path for a complete loop
  ctx.closePath();
  
  ctx.strokeStyle = '#999999'; // Lighter asphalt gray
  ctx.lineWidth = segmentProperties[0].width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  
  // Pass 3: Draw center lines with sector colors
  // We need to map the sector colors to the smoothed path
  const segmentLength = Math.floor(smoothedPath.length / trackPoints.length);
  
  for (let i = 0; i < trackPoints.length - 1; i++) {
    const startIndex = i * segmentLength;
    const endIndex = (i + 1) * segmentLength;
    const sectorColor = segmentProperties[i].sectorColor;
    
    ctx.beginPath();
    ctx.moveTo(smoothedPath[startIndex].x, smoothedPath[startIndex].y);
    
    for (let j = startIndex + 1; j <= endIndex && j < smoothedPath.length; j++) {
      ctx.lineTo(smoothedPath[j].x, smoothedPath[j].y);
    }
    
    ctx.strokeStyle = sectorColor;
    ctx.lineWidth = 3; // Slightly thicker center line
    ctx.setLineDash([15, 15]); // Longer dashes for better visibility
    ctx.stroke();
  }
  
  ctx.setLineDash([]); // Reset dash pattern
  
  // Draw checkpoints
  let finishLinePosition: Point2D | null = null;
  let finishLineAngle: number = 0;
  let finishLineWidth: number = 0;
  
  track.checkpoints.forEach(checkpoint => {
    const isActive = checkpoint.order === currentCheckpoint;
    const isFinishLine = checkpoint.order === 1; // First checkpoint is finish line
    
    // Find the segment with matching start point
    const segment = track.segments.find(seg => 
      Math.abs(seg.startPoint.x - checkpoint.position.x) < 1 && 
      Math.abs(seg.startPoint.y - checkpoint.position.y) < 1
    );
    
    if (segment) {
      const width = segment.width;
      const { position } = checkpoint;
      
      // Find next point to calculate angle
      const nextSegmentIndex = track.segments.findIndex(seg => 
        Math.abs(seg.startPoint.x - checkpoint.position.x) < 1 && 
        Math.abs(seg.startPoint.y - checkpoint.position.y) < 1
      );
      
      // Get the next segment (or loop back to the first)
      const nextSegment = nextSegmentIndex !== -1 ? 
        track.segments[(nextSegmentIndex + 1) % track.segments.length] : 
        track.segments[0];
      
      const dx = nextSegment.startPoint.x - position.x;
      const dy = nextSegment.startPoint.y - position.y;
      const angle = Math.atan2(dy, dx) + Math.PI/2; // Perpendicular to track
      
      // Store finish line data for later drawing
      if (isFinishLine) {
        finishLinePosition = { ...position };
        finishLineAngle = angle;
        finishLineWidth = width;
      }
      
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.rotate(angle);
      
      // Draw checkpoint line
      const checkpointColor = isActive ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 255, 255, 0.4)';
      
      // Draw a simple line for checkpoint
      ctx.strokeStyle = checkpointColor;
      ctx.lineWidth = isActive ? 5 : 3;
      ctx.beginPath();
      ctx.moveTo(-width/2, 0);
      ctx.lineTo(width/2, 0);
      ctx.stroke();
      
      // Add pulsing effect for active checkpoint
      if (isActive) {
        const pulseWidth = 3 + Math.sin(checkpointProgress * Math.PI * 2) * 3;
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = pulseWidth;
        ctx.beginPath();
        ctx.moveTo(-width/2, 0);
        ctx.lineTo(width/2, 0);
        ctx.stroke();
      }
      
      ctx.restore();
    }
  });
  
  // Draw finish line on top of everything else
  if (finishLinePosition) {
    drawFinishLine(ctx, finishLinePosition, finishLineAngle, finishLineWidth, 24);
  }
};

export const RaceScreen: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { trackId } = useParams<{ trackId: string }>();
  const [colorIndex, setColorIndex] = useState(0);
  const F1ColorKeys = Object.keys(F1_COLORS) as Array<keyof typeof F1_COLORS>;
  
  // Animation frame tracking
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const checkpointProgressRef = useRef(0);
  
  // Controls state
  const controlsRef = useRef({
    accelerate: false,
    brake: false,
    turnLeft: false,
    turnRight: false
  });
  
  // Animation for checkpoint
  const animateCheckpoint = () => {
    checkpointProgressRef.current += 0.02;
    if (checkpointProgressRef.current > 1) {
      checkpointProgressRef.current = 0;
    }
  };
  
  // Handle spacebar for car color change
  const handleSpacebar = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      setColorIndex((prev) => (prev + 1) % F1ColorKeys.length);
    }
  };
  
  useEffect(() => {
    const trackService = TrackService.getInstance();
    const raceEngine = RaceEngine.getInstance();
    
    // Get track data
    const track = trackService.getTrackById(trackId || '');
    if (!track) {
      console.error('Track not found');
      return;
    }
    
    // Default vehicle
    const vehicle = {
      id: 'default',
      name: 'F1 Car',
      speed: 80,
      acceleration: 75,
      handling: 70,
      visuals: { color: '#ff0000', decals: [] },
      classification: 'official' as const
    };
    
    // Start race
    raceEngine.startRace(track, vehicle);
    
    // Load resources
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keypress', handleSpacebar);
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Start animation loop
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      raceEngine.endRace();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keypress', handleSpacebar);
      window.removeEventListener('resize', resizeCanvas);
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [trackId]);
  
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
  };
  
  // Control handlers
  const handleKeyDown = (e: KeyboardEvent) => {
    updateControlsByKey(e.code, true);
  };
  
  const handleKeyUp = (e: KeyboardEvent) => {
    updateControlsByKey(e.code, false);
  };
  
  const updateControlsByKey = (code: string, isPressed: boolean) => {
    switch (code) {
      case 'ArrowUp':
        controlsRef.current.accelerate = isPressed;
        break;
      case 'ArrowDown':
        controlsRef.current.brake = isPressed;
        break;
      case 'ArrowLeft':
        controlsRef.current.turnLeft = isPressed;
        break;
      case 'ArrowRight':
        controlsRef.current.turnRight = isPressed;
        break;
    }
    
    // Update race engine
    RaceEngine.getInstance().handleInput(controlsRef.current);
  };
  
  const animate = (time: number) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }
    
    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;
    
    // Update checkpoint animation
    animateCheckpoint();
    
    // Draw frame
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const state = RaceEngine.getInstance().getRaceState();
        if (state) {
          // Draw track
          drawTrack(
            ctx,
            state.track,
            state.currentCheckpoint,
            checkpointProgressRef.current
          );
          
          // Draw car
          ctx.save();
          ctx.translate(state.vehicle.position.x, state.vehicle.position.y);
          ctx.rotate((state.vehicle.angle * Math.PI) / 180);
          drawF1Car(ctx, F1_COLORS[F1ColorKeys[colorIndex]]);
          ctx.restore();
          
          // Draw HUD info
          const lapTimeText = `Lap: ${state.currentLap} - Time: ${state.lapTime.toFixed(2)}s`;
          const bestLapText = state.bestLapTime ? `Best: ${state.bestLapTime.toFixed(2)}s` : '';
          const speedText = `Speed: ${(state.vehicle.speed).toFixed(1)} km/h`;
          const hudText = `${lapTimeText}\n${bestLapText}\n${speedText}\n\nPress SPACE to change car color`;
          
          document.getElementById('hud')!.innerText = hudText;
        }
      }
    }
    
    requestRef.current = requestAnimationFrame(animate);
  };
  
  const handleBackToEditor = () => {
    // Logic to navigate back to the editor
    window.history.back();
  };
  
  return (
    <RaceContainer>
      <Canvas ref={canvasRef} />
      <ArcadeHUD id="hud">Loading race...</ArcadeHUD>
      <BackButton onClick={handleBackToEditor}>Back to Editor</BackButton>
    </RaceContainer>
  );
}; 