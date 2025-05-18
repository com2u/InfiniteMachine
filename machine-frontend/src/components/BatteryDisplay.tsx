import React from 'react';
import './BatteryDisplay.css';

interface BatteryDisplayProps {
  isActive: boolean;
  id?: string;
  powerLevel?: number;
  width?: number;
  height?: number;
}

const BatteryDisplay: React.FC<BatteryDisplayProps> = ({
  isActive,
  id = "1",
  powerLevel = 75,
  width,
  height,
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
    <div className="battery-display" style={width && height ? { width, height } : undefined}>
      <div className="battery-connection"></div>
      <div className={`battery-led ${statusClass}`}></div>
      <div className="battery-screw-top-right"></div>
      <div className="battery-screw-bottom-left"></div>
      <div className="battery-screw-bottom-right"></div>
      
      <h3 className="battery-title">BATTERY</h3>
      
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
      
      <div className="battery-status">
        <div className="status-label">
          <span>STATUS:</span>
          <span className={`status-value ${statusClass}`}>{statusText}</span>
        </div>
        
        <div className="status-label">
          <span>CHARGE:</span>
          <span className={`status-value ${statusClass}`}>{isActive ? `${powerLevel}%` : '0%'}</span>
        </div>
      </div>
      
      <div className="battery-metrics">
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
      
      <div className="battery-description">
        UNIT {id} - Power Storage System
      </div>
    </div>
  );
};

export default BatteryDisplay;
