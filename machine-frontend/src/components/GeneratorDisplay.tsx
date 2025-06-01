import React from 'react';
import './GeneratorDisplay.css';
import './MachineComponent.css';
import LedDisplay from './LedDisplay';
import SliderControl from './SliderControl';

interface GeneratorDisplayProps {
  isActive: boolean;
  id?: string;
  powerLevel?: number;
  temperature?: number;
  width?: number;
  height?: number;
  onToggle?: () => void;
  onPowerChange?: (value: number) => void;
  onAggregatorXChange?: (value: number) => void;
}

const GeneratorDisplay: React.FC<GeneratorDisplayProps> = ({
  isActive,
  id = "1",
  powerLevel = 65,
  temperature = 20,
  width,
  height,
  onToggle,
  onPowerChange,
  onAggregatorXChange,
}) => {
  
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
  
  // Temperature is now provided from backend via props
  
  // Animation speed for generator blades based on power level
  const getAnimationDuration = () => {
    if (!isActive) return '0s';
    // Higher power level = faster rotation
    const duration = 8 - (powerLevel / 100) * 7;
    return `${Math.max(1, duration)}s`;
  };

  // Calculate needle rotation angle based on temperature (0-150 scale)
  const getNeedleRotation = () => {
    // Map temperature (0-150) to angle (-90 to +90 degrees)
    // -90 degrees = left (0°C), 0 degrees = center (75°C), +90 degrees = right (150°C)
    return -90 + (temperature / 150) * 180;
  };

  // Handle power level change from slider
  const handlePowerChange = (newValue: number) => {
    if (onPowerChange) {
      onPowerChange(newValue);
    }
  };
  
  // Handle aggregator X value change from slider
  const handleAggregatorXChange = (newValue: number) => {
    if (onAggregatorXChange) {
      onAggregatorXChange(newValue);
    }
  };

  return (
    <div 
      className="machine-component generator-display" 
      style={width && height ? { width, height } : undefined}
    >
      <div className="component-screw-top-left"></div>
      <div className="component-screw-top-right"></div>
      <div className="component-screw-bottom-left"></div>
      <div className="component-screw-bottom-right"></div>
      <div className="connection-point connection-point-left"></div>
      <div className="connection-point connection-point-right"></div>
      
      <h3 className="component-title">GENERATOR</h3>
      
      <LedDisplay 
        isActive={isActive}
        onToggle={onToggle}
        size={30}
      />
      
      <div className="generator-status-panel">
        <div className="status-label">
          <span>STATUS:</span>
          <span className={`status-value ${statusClass}`}>{statusText}</span>
        </div>
        
        <div className="status-label">
          <span>OUTPUT:</span>
          <span className={`status-value ${statusClass}`}>{isActive ? `${powerLevel}%` : '0%'}</span>
        </div>
      </div>
      
      <div className="generator-container">
        <div className="generator-housing">
          <div 
            className="generator-rotor"
            style={{ 
              animationDuration: getAnimationDuration(),
              animationPlayState: isActive ? 'running' : 'paused'
            }}
          >
            <div className="rotor-blade blade-1"></div>
            <div className="rotor-blade blade-2"></div>
            <div className="rotor-blade blade-3"></div>
            <div className="rotor-blade blade-4"></div>
            <div className="rotor-center"></div>
          </div>
        </div>
      </div>
      
      <div className="temperature-gauge-container">
        <div className="temperature-gauge">
          <div className="gauge-background"></div>
          
            {/* Gauge scale markers */}
          <div className="gauge-scale">
            {[...Array(7)].map((_, i) => (
              <div 
                key={i} 
                className="gauge-marker"
                style={{ transform: `rotate(${-90 + (i * 30)}deg)` }}
              >
                <div className="marker-line"></div>
                <div className="marker-value">{i * 25}</div>
              </div>
            ))}
          </div>
          
          {/* Gauge color segments */}
          <div className="gauge-segments">
            <div className="segment normal"></div>
            <div className="segment warning"></div>
            <div className="segment critical"></div>
          </div>
          
          {/* Gauge needle */}
          <div 
            className="gauge-needle"
            style={{ transform: `rotate(${getNeedleRotation()}deg)` }}
          >
            <div className="needle"></div>
            <div className="needle-base"></div>
          </div>
        </div>
        
        <div className="temperature-display">
          <div className="temp-label">TEMPERATURE</div>
          <div className="temp-value">{temperature.toFixed(1)}<span className="temp-unit">°C</span></div>
        </div>
      </div>
      
      <div className="component-description">
        UNIT {id} - Power Generation System
      </div>
      
      <div className="generator-slider-container">
        <SliderControl
          title="POWER LEVEL"
          min={0}
          max={100}
          value={powerLevel}
          step={5}
          onChange={handlePowerChange}
          isActive={isActive}
          disabled={!isActive}
        />
      </div>
      
      <div className="generator-slider-container">
        <SliderControl
          title="AGGREGATOR X"
          min={0}
          max={100}
          value={50}
          step={1}
          onChange={handleAggregatorXChange}
          isActive={isActive}
          disabled={!isActive}
        />
      </div>
    </div>
  );
};

export default React.memo(GeneratorDisplay);
