import React from 'react';
import './MachineComponent.css';
import './AggregatorDisplay.css';
import LedDisplay from './LedDisplay';

interface AggregatorDisplayProps {
  isActive: boolean;
  totalEnergy: number;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  onToggle?: () => void;
}

const AggregatorDisplay: React.FC<AggregatorDisplayProps> = ({
  isActive,
  totalEnergy,
  title = 'AGGREGATOR',
  description = 'Energy Distribution System',
  width,
  height,
  onToggle
}) => {
  // Determine status based on energy level and active state
  let statusText = 'INACTIVE';
  let statusClass = 'inactive';
  
  if (isActive) {
    if (totalEnergy > 50) {
      statusText = 'OPTIMAL';
      statusClass = 'active';
    } else if (totalEnergy > 20) {
      statusText = 'ADEQUATE';
      statusClass = 'warning';
    } else {
      statusText = 'LOW ENERGY';
      statusClass = 'critical';
    }
  }
  
  return (
    <div 
      className="machine-component aggregator-display" 
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
      
      <div className="aggregator-container">
        <div className="energy-display">
          <div className="energy-label">TOTAL ENERGY AVAILABLE</div>
          <div className="energy-value">{totalEnergy} units</div>
        </div>
        
        <div className="energy-meter">
          <div 
            className="energy-meter-fill" 
            style={{ width: `${Math.min(100, (totalEnergy / 100) * 100)}%` }}
          ></div>
        </div>
        
        <div className="aggregator-status">
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

export default AggregatorDisplay;
