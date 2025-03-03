import React from 'react'
import { useGameStore } from '../store/gameStore'

const Home: React.FC = () => {
  const { tracks, vehicles } = useGameStore()
  
  return (
    <div className="home">
      <h1>FittipAIdi Racing Labs V2</h1>
      <div className="stats">
        <div className="stat-box">
          <h3>Tracks Available</h3>
          <p>{tracks.length}</p>
        </div>
        <div className="stat-box">
          <h3>Vehicles Available</h3>
          <p>{vehicles.length}</p>
        </div>
      </div>
    </div>
  )
}

export default Home 