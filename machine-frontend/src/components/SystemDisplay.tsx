import React from 'react';
import './MachineComponent.css';
import './SystemDisplay.css';
import LedDisplay from './LedDisplay';

interface SystemDisplayProps {
  isActive?: boolean;
  status: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  onToggle?: () => void;
  onDebug?: () => void;
}

const SystemDisplay: React.FC<SystemDisplayProps> = ({
  isActive = true,
  status,
  title = 'SYSTEM',
  description = 'System Status Indicator',
  width,
  height,
  onToggle,
  onDebug
}) => {
  // Determine status class based on status
  let statusClass = 'active';
  
  if (status === 'CRITICAL') {
    statusClass = 'critical';
  } else if (status === 'WARNING') {
    statusClass = 'warning';
  }
  
  return (
    <div 
      className="machine-component system-display" 
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
      
      <div className="system-container">
        <div className="system-status">
          <div 
            className={`system-indicator ${statusClass}`}
            onClick={onDebug}
            style={{ cursor: 'pointer' }}
          ></div>
          <div className="status-label">
            <span>STATUS:</span>
            <span className={`status-value ${statusClass}`}>{status}</span>
          </div>
        </div>
      </div>
      
      <div className="component-description">
        {description}
      </div>
    </div>
  );
};

export default SystemDisplay;
