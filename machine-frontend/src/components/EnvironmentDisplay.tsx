import React from 'react';
import './MachineComponent.css';
import './EnvironmentDisplay.css';
import LedDisplay from './LedDisplay';
import GaugeDisplay from './GaugeDisplay';

interface EnvironmentDisplayProps {
  isActive?: boolean;
  temperature: number;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  onToggle?: () => void;
}

const EnvironmentDisplay: React.FC<EnvironmentDisplayProps> = ({
  isActive = true,
  temperature,
  title = 'ROOM TEMP',
  description = 'Facility Temperature',
  width,
  height,
  onToggle
}) => {
  // Determine status based on temperature
  let statusText = 'NORMAL';
  let statusClass = 'active';
  
  if (temperature > 80) {
    statusText = 'CRITICAL';
    statusClass = 'critical';
  } else if (temperature > 50) {
    statusText = 'WARNING';
    statusClass = 'warning';
  }
  
  return (
    <div 
      className="machine-component environment-display" 
      style={width && height ? { width, height } : undefined}
    >
      <div className="led-container" style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <LedDisplay 
          isActive={isActive}
          onToggle={onToggle}
          size={18}
        />
      </div>
      <div className="component-screw-top-left"></div>
      <div className="component-screw-top-right"></div>
      <div className="component-screw-bottom-left"></div>
      <div className="component-screw-bottom-right"></div>
      <div className="connection-point connection-point-left"></div>
      <div className="connection-point connection-point-right"></div>
      
      <h3 className="component-title">{title}</h3>
      
      <div className="environment-container">
        <div className="temperature-gauge">
          <GaugeDisplay
            title="TEMPERATURE"
            value={temperature}
            min={0}
            max={100}
            unit="°C"
            isActive={isActive}
          />
        </div>
        
        <div className="temperature-display">
          <div className="temperature-value">{temperature}°C</div>
          <div className="temperature-icon">
            <div className={`temperature-indicator ${statusClass}`}></div>
          </div>
        </div>
        
        <div className="environment-status">
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

export default EnvironmentDisplay;
