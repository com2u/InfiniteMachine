import React from 'react';
import './BatteryDisplay.css';
import './MachineComponent.css';

interface BatteryDisplayProps {
  isActive: boolean;
  id?: string;
  powerLevel?: number;
  width?: number;
  height?: number;
  onToggle?: () => void;
}

const BatteryDisplay: React.FC<BatteryDisplayProps> = ({
  isActive,
  id = "1",
  powerLevel = 75,
  width,
  height,
  onToggle,
}) => {
  // Determine battery status and color class
  let statusText = 'OPERATIONAL';
  let statusClass = 'active';
  
  if (!isActive) {
    statusText = 'INACTIVE';
    statusClass = 'inactive';
  } else if (powerLevel < 20) {
    statusText = 'CRITICAL';
    statusClass = 'critical';
  } else if (powerLevel < 50) {
    statusText = 'WARNING';
    statusClass = 'warning';
  }
  
  // Calculate voltage based on power level
  const calculateVoltage = () => {
    if (!isActive) return '0.0';
    // Simple calculation: 100% = 12V
    const voltage = 10 + (powerLevel / 100) * 2;
    return voltage.toFixed(1);
  };
  
  // Calculate current based on power level and active state
  const calculateCurrent = () => {
    if (!isActive) return '0.0';
    // Higher power level = higher current draw
    const current = 0.5 + (powerLevel / 100) * 4.5;
    return current.toFixed(1);
  };
  
  // Calculate temperature based on power level and active state
  const calculateTemperature = () => {
    if (!isActive) return '25';
    // Higher power level = higher temperature
    const temp = 25 + (powerLevel / 100) * 30;
    return Math.round(temp).toString();
  };
  
  // Generate battery cells
  const generateBatteryCells = () => {
    const cells = [];
    const cellCount = 5;
    
    for (let i = 0; i < cellCount; i++) {
      cells.push(
        <div key={i} className="battery-cell"></div>
      );
      
      if (i < cellCount - 1) {
        cells.push(
          <div key={`separator-${i}`} className="battery-cell-separator"></div>
        );
      }
    }
    
    return cells;
  };

  return (
    <div 
      className="machine-component battery-display" 
      style={width && height ? { width, height } : undefined}
    >
      <div 
        className={`component-led ${statusClass}`}
        onClick={onToggle}
        style={{ cursor: onToggle ? 'pointer' : 'default' }}
      ></div>
      <div className="component-screw-top-left"></div>
      <div className="component-screw-top-right"></div>
      <div className="component-screw-bottom-left"></div>
      <div className="component-screw-bottom-right"></div>
      <div className="connection-point connection-point-right"></div>
      
      <h3 className="component-title">BATTERY</h3>
      
      <div className="battery-icon-container">
        <div className="battery-icon">
          <div className="battery-cap"></div>
          <div 
            className={`battery-level ${statusClass}`} 
            style={{ height: `${isActive ? powerLevel : 0}%` }}
          ></div>
          <div className="battery-cells">
            {generateBatteryCells()}
          </div>
          <div className="battery-percentage">
            {isActive ? `${powerLevel}%` : 'OFF'}
          </div>
        </div>
      </div>
      
      <div className="component-status">
        <div className="status-label">
          <span>STATUS:</span>
          <span className={`status-value ${statusClass}`}>{statusText}</span>
        </div>
        
        <div className="status-label">
          <span>CHARGE:</span>
          <span className={`status-value ${statusClass}`}>{isActive ? `${powerLevel}%` : '0%'}</span>
        </div>
      </div>
      
      <div className="component-metrics">
        <div className="metric">
          <div className="metric-label">VOLTS</div>
          <div className="metric-value">{calculateVoltage()}V</div>
        </div>
        <div className="metric">
          <div className="metric-label">AMPS</div>
          <div className="metric-value">{calculateCurrent()}A</div>
        </div>
        <div className="metric">
          <div className="metric-label">TEMP</div>
          <div className="metric-value">{calculateTemperature()}°C</div>
        </div>
      </div>
      
      <div className="component-description">
        UNIT {id} - Power Storage System
      </div>
    </div>
  );
};

export default BatteryDisplay;
