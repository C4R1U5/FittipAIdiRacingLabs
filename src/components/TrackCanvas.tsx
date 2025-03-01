import React, { useRef, useEffect } from 'react';
import { Track } from '../models/Track';
import { Vehicle } from '../models/Vehicle';
import { TrackEngine } from '../game/TrackEngine';

interface TrackCanvasProps {
  track: Track;
  vehicles: Vehicle[];
  isRacing: boolean;
}

const TrackCanvas: React.FC<TrackCanvasProps> = ({ track, vehicles, isRacing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackEngine = useRef<TrackEngine | null>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Initialize track engine
    trackEngine.current = new TrackEngine(canvas, context);
    
    // Set up animation loop
    let animationFrameId: number;
    
    const render = () => {
      if (trackEngine.current) {
        trackEngine.current.renderTrack(track);
        
        if (isRacing) {
          trackEngine.current.renderVehicles(vehicles);
        }
      }
      
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [track, vehicles, isRacing]);
  
  return (
    <div className="track-canvas-container">
      <canvas 
        ref={canvasRef}
        width={800}
        height={600}
        className="track-canvas"
      />
    </div>
  );
};

export default TrackCanvas; 