import React from 'react'
import { useGameStore } from '../store/gameStore'

const Vehicles: React.FC = () => {
  const { vehicles, selectedVehicle, selectVehicle } = useGameStore()
  
  return (
    <div className="vehicles">
      <h2>Vehicle Management</h2>
      <div className="vehicles-grid">
        {vehicles.map(vehicle => (
          <div 
            key={vehicle.id}
            className={`vehicle-card ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
            onClick={() => selectVehicle(vehicle.id)}
          >
            <h3>{vehicle.name}</h3>
            <div className="vehicle-stats">
              <p>Speed: {vehicle.speed}</p>
              <p>Acceleration: {vehicle.acceleration}</p>
              <p>Handling: {vehicle.handling}</p>
            </div>
            <div 
              className="vehicle-color-preview"
              style={{ backgroundColor: vehicle.visuals.color }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Vehicles 