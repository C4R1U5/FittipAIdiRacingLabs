import React from 'react'
import { useGameStore } from '../store/gameStore'

const Tracks: React.FC = () => {
  const { tracks, selectedTrack, selectTrack } = useGameStore()
  
  return (
    <div className="tracks">
      <h2>Track Management</h2>
      <div className="tracks-grid">
        {tracks.map(track => (
          <div 
            key={track.id}
            className={`track-card ${selectedTrack?.id === track.id ? 'selected' : ''}`}
            onClick={() => selectTrack(track.id)}
          >
            <h3>{track.name}</h3>
            <p>Difficulty: {track.difficulty}</p>
            <p>Surface: {track.surface}</p>
            <p>Segments: {track.segments.length}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tracks 