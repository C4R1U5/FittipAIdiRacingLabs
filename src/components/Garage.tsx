import React, { useState } from 'react';
import Vehicle from '../models/Vehicle';

interface GarageProps {
  availableVehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onClose: () => void;
}

const Garage: React.FC<GarageProps> = ({
  availableVehicles,
  selectedVehicleId,
  onSelectVehicle,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const currentVehicle = availableVehicles[currentIndex];
  
  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === availableVehicles.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? availableVehicles.length - 1 : prevIndex - 1
    );
  };
  
  const handleSelect = () => {
    onSelectVehicle(currentVehicle);
  };
  
  return (
    <div className="garage">
      <h2>Vehicle Garage</h2>
      
      <div className="vehicle-display">
        <button className="nav-button prev" onClick={handlePrevious}>
          &#9664;
        </button>
        
        <div className="vehicle-card">
          <div className="vehicle-image">
            {/* Vehicle image would be here in a real implementation */}
            <div className="placeholder-image">
              {`${currentVehicle.make} ${currentVehicle.model}`}
            </div>
          </div>
          
          <div className="vehicle-info">
            <h3>{`${currentVehicle.make} ${currentVehicle.model} (${currentVehicle.year})`}</h3>
            
            <div className="vehicle-stats">
              <div className="stat">
                <span className="stat-label">Top Speed:</span>
                <span className="stat-value">{currentVehicle.performance.topSpeed} km/h</span>
              </div>
              <div className="stat">
                <span className="stat-label">Acceleration:</span>
                <span className="stat-value">{currentVehicle.performance.acceleration}s (0-100 km/h)</span>
              </div>
              <div className="stat">
                <span className="stat-label">Weight:</span>
                <span className="stat-value">{currentVehicle.specs.weight} kg</span>
              </div>
              <div className="stat">
                <span className="stat-label">Horsepower:</span>
                <span className="stat-value">{currentVehicle.specs.engine.horsepower} hp</span>
              </div>
            </div>
          </div>
        </div>
        
        <button className="nav-button next" onClick={handleNext}>
          &#9654;
        </button>
      </div>
      
      <div className="garage-actions">
        <button 
          className={`select-button ${selectedVehicleId === currentVehicle.id ? 'selected' : ''}`}
          onClick={handleSelect}
        >
          {selectedVehicleId === currentVehicle.id ? 'Selected' : 'Select Vehicle'}
        </button>
        <button className="close-button" onClick={onClose}>
          Return to Menu
        </button>
      </div>
    </div>
  );
};

export default Garage; 