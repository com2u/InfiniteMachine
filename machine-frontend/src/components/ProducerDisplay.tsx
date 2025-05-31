import React from 'react';
import './MachineComponent.css';
import './ProducerDisplay.css';
import LedDisplay from './LedDisplay';

interface ProducerDisplayProps {
  isActive: boolean;
  consumption: number;
  output: number;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  onToggle?: () => void;
  onConsumptionChange?: (value: number) => void;
}

const ProducerDisplay: React.FC<ProducerDisplayProps> = ({
  isActive,
  consumption,
  output,
  title = 'PRODUCER',
  description = 'Manufacturing System',
  width,
  height,
  onToggle,
  onConsumptionChange
}) => {
  // Format the output as a single digit
  const formattedOutput = output.toString().substring(0, 1);
  
  // Determine status based on output and active state
  let statusText = 'INACTIVE';
  let statusClass = 'inactive';
  
  if (isActive) {
    if (output > 0) {
      statusText = 'PRODUCING';
      statusClass = 'active';
    } else {
      statusText = 'STANDBY';
      statusClass = 'warning';
    }
  }
  
  // Handle consumption slider change
  const handleConsumptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (onConsumptionChange) {
      onConsumptionChange(value);
    }
  };
  
  return (
    <div 
      className="machine-component producer-display" 
      style={width && height ? { width, height } : undefined}
    >
      <LedDisplay 
        isActive={isActive}
        onToggle={onToggle}
      />
      <div className="component-screw-top-left"></div>
      <div className="component-screw-top-right"></div>
      <div className="component-screw-bottom-left"></div>
      <div className="component-screw-bottom-right"></div>
      <div className="connection-point connection-point-left"></div>
      <div className="connection-point connection-point-right"></div>
      
      <h3 className="component-title">{title}</h3>
      
      <div className="producer-container">
        <div className="producer-output">
          <div className="output-label">PRODUCTION STATUS</div>
          <div className="output-display">
            <div className="output-digit">{formattedOutput}</div>
          </div>
        </div>
        
        <div className="producer-consumption">
          <div className="consumption-label">ENERGY CONSUMPTION</div>
          <div className="consumption-control">
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1" 
              value={consumption}
              onChange={handleConsumptionChange}
              disabled={!isActive}
              className="consumption-slider"
            />
            <div className="consumption-value">{consumption} units</div>
          </div>
        </div>
        
        <div className="producer-status">
          <div className="status-label">
            <span>STATUS:</span>
            <span className={`status-value ${statusClass}`}>{statusText}</span>
          </div>
        </div>
      </div>
      
      <div className="component-description">
        {description}
      </div>
    </div>
  );
};

export default ProducerDisplay;
