import React, { useEffect, useState } from 'react';
import './GeneratorDisplay.css';
import './MachineComponent.css';
import LedDisplay from './LedDisplay';

interface GeneratorDisplayProps {
  isActive: boolean;
  id?: string;
  powerLevel?: number;
  width?: number;
  height?: number;
  onToggle?: () => void;
  onPowerChange?: (value: number) => void;
}

const GeneratorDisplay: React.FC<GeneratorDisplayProps> = ({
  isActive,
  id = "1",
  powerLevel = 65,
  width,
  height,
  onToggle,
  onPowerChange,
}) => {
  const [rpm, setRpm] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [load, setLoad] = useState(0);
  
  // Determine generator status and color class
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
  
  // Simulate generator metrics based on power level and active state
  useEffect(() => {
    if (isActive) {
      // RPM calculation (higher power level = higher RPM)
      const calculatedRpm = 1000 + (powerLevel / 100) * 2000;
      setRpm(Math.round(calculatedRpm));
      
      // Temperature calculation (higher power level = higher temperature)
      const calculatedTemp = 40 + (powerLevel / 100) * 60;
      setTemperature(Math.round(calculatedTemp));
      
      // Load calculation (similar to power level but with some variation)
      const calculatedLoad = Math.min(100, Math.max(0, powerLevel + (Math.random() * 20 - 10)));
      setLoad(Math.round(calculatedLoad));
    } else {
      setRpm(0);
      setTemperature(25); // Ambient temperature when inactive
      setLoad(0);
    }
  }, [isActive, powerLevel]);
  
  // Generate power level ticks
  const generatePowerLevelTicks = () => {
    const ticks = [];
    const tickCount = 10;
    
    for (let i = 0; i < tickCount; i++) {
      const isMajor = i === 0 || i === tickCount - 1 || i % 5 === 0;
      ticks.push(
        <div key={i} className={`power-level-tick ${isMajor ? 'major' : ''}`}></div>
      );
    }
    
    return ticks;
  };
  
  // Animation speed for generator blades based on power level
  const getAnimationDuration = () => {
    if (!isActive) return '0s';
    // Higher power level = faster rotation
    const duration = 8 - (powerLevel / 100) * 7;
    return `${Math.max(1, duration)}s`;
  };

  return (
    <div 
      className="machine-component generator-display" 
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
      
      <h3 className="component-title">GENERATOR</h3>
      
      <div className="generator-icon-container">
        <div className="generator-icon">
          <div 
            className="generator-icon-inner"
            style={{ 
              animationDuration: getAnimationDuration(),
              animationPlayState: isActive ? 'running' : 'paused'
            }}
          >
            <div className="generator-icon-blade"></div>
            <div className="generator-icon-blade"></div>
            <div className="generator-icon-blade"></div>
          </div>
        </div>
      </div>
      
      <div 
        className="power-level-bar"
        onClick={(e) => {
          if (onPowerChange && isActive) {
            const bar = e.currentTarget;
            const rect = bar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = (clickX / rect.width) * 100;
            const newPowerLevel = Math.max(0, Math.min(100, Math.round(percentage)));
            onPowerChange(newPowerLevel);
          }
        }}
        style={{ cursor: onPowerChange && isActive ? 'pointer' : 'default' }}
      >
        <div 
          className={`power-level-fill ${statusClass}`} 
          style={{ width: `${isActive ? powerLevel : 0}%` }}
        ></div>
        <div className="power-level-ticks">
          {generatePowerLevelTicks()}
        </div>
      </div>
      
      <div className="component-status">
        <div className="status-label">
          <span>STATUS:</span>
          <span className={`status-value ${statusClass}`}>{statusText}</span>
        </div>
        
        <div className="status-label">
          <span>OUTPUT:</span>
          <span className={`status-value ${statusClass}`}>{isActive ? `${powerLevel}%` : '0%'}</span>
        </div>
      </div>
      
      <div className="component-metrics">
        <div className="metric">
          <div className="metric-label">RPM</div>
          <div className="metric-value">{rpm}</div>
        </div>
        <div className="metric">
          <div className="metric-label">TEMP</div>
          <div className="metric-value">{temperature}°C</div>
        </div>
        <div className="metric">
          <div className="metric-label">LOAD</div>
          <div className="metric-value">{load}%</div>
        </div>
      </div>
      
      <div className="component-description">
        UNIT {id} - Power Generation System
      </div>
    </div>
  );
};

export default GeneratorDisplay;
