import React, { useEffect, useState } from 'react';
import './GaugeDisplay.css';
import './MachineComponent.css';
import LedDisplay from './LedDisplay';

interface GaugeDisplayProps {
  title?: string;
  label?: string; // Added for compatibility with ComponentRenderer
  value?: number;
  min?: number;
  max?: number;
  minValue?: number; // Added for compatibility with ComponentRenderer
  maxValue?: number; // Added for compatibility with ComponentRenderer
  unit?: string;
  units?: string; // Added for compatibility with ComponentRenderer
  width?: number;
  height?: number;
  isActive?: boolean;
  onToggle?: () => void;
}

const GaugeDisplay: React.FC<GaugeDisplayProps> = ({
  title,
  label,
  value = 50,
  min,
  max,
  minValue,
  maxValue,
  unit,
  units,
  width,
  height,
  isActive = true,
  onToggle,
}) => {
  // Use provided values or fallbacks
  const displayTitle = title || label || 'GAUGE';
  const displayMin = min || minValue || 0;
  const displayMax = max || maxValue || 100;
  const displayUnit = unit || units || '';
  
  const [gaugeStatus, setGaugeStatus] = useState<'normal' | 'warning' | 'critical'>('normal');
  
  // Determine gauge status based on value
  useEffect(() => {
    const range = displayMax - displayMin;
    const normalThreshold = displayMin + range * 0.6;
    const warningThreshold = displayMin + range * 0.8;
    
    if (value >= warningThreshold) {
      setGaugeStatus('critical');
    } else if (value >= normalThreshold) {
      setGaugeStatus('warning');
    } else {
      setGaugeStatus('normal');
    }
  }, [value, displayMin, displayMax]);
  
  // Calculate the rotation angle for the gauge needle
  const calculateNeedleRotation = () => {
    // Map value to angle (0 to 180 degrees)
    const percentage = (value - displayMin) / (displayMax - displayMin);
    const angle = percentage * 180;
    return angle;
  };

  // Map gauge status to component status class
  // If isActive is false, always use 'inactive', otherwise use the gauge status
  const statusClass = !isActive ? 'inactive' : (gaugeStatus === 'normal' ? 'active' : gaugeStatus);

  return (
    <div 
      className="machine-component gauge-display" 
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
      <div className="connection-point connection-point-top"></div>
      
      <h3 className="component-title">{displayTitle}</h3>
      
      <div className="gauge-container">
        {/* Use a viewBox with equal width and height to ensure perfect circle */}
        <svg width="200" height="120" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
          {/* Center point of the gauge */}
          <g transform="translate(100, 100)">
            {/* Gauge background arc - full 180 degree semi-circle */}
            <path
              d="M -80 0 A 80 80 0 0 1 80 0"
              className="gauge-segment-background"
            />
            
            {/* Normal segment - first 60% of the semi-circle */}
            <path
              d="M -80 0 A 80 80 0 0 1 -40 -69.28"
              className="gauge-segment-normal"
            />
            
            {/* Warning segment - next 20% of the semi-circle */}
            <path
              d="M -40 -69.28 A 80 80 0 0 1 40 -69.28"
              className="gauge-segment-warning"
            />
            
            {/* Critical segment - final 20% of the semi-circle */}
            <path
              d="M 40 -69.28 A 80 80 0 0 1 80 0"
              className="gauge-segment-critical"
            />
            
            {/* Gauge ticks */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
              const angle = i * 20; // 180 degrees divided into 9 segments
              const radians = (angle * Math.PI) / 180;
              const isMajor = i % 2 === 0;
              const tickLength = isMajor ? 15 : 10;
              
              const x1 = 80 * Math.cos(radians);
              const y1 = -80 * Math.sin(radians);
              const x2 = (80 - tickLength) * Math.cos(radians);
              const y2 = -(80 - tickLength) * Math.sin(radians);
              
              return (
                <line
                  key={`tick-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className={`gauge-tick ${isMajor ? 'major' : 'minor'}`}
                />
              );
            })}
            
            {/* Gauge value labels */}
            {[0, 2, 4, 6, 8].map((i) => {
              const angle = i * 20; // 180 degrees divided into 9 segments
              const radians = (angle * Math.PI) / 180;
              const labelRadius = 95;
              
              const x = labelRadius * Math.cos(radians);
              const y = -labelRadius * Math.sin(radians);
              const value = displayMin + (i / 8) * (displayMax - displayMin);
              
              return (
                <text
                  key={`label-${i}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#aaa"
                  fontSize="10"
                >
                  {Math.round(value)}
                </text>
              );
            })}
            
            {/* Gauge needle */}
            <g transform={`rotate(${180 - calculateNeedleRotation()})`}>
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="-75"
                className="gauge-needle"
              />
              <circle
                cx="0"
                cy="0"
                r="8"
                className="gauge-center"
              />
            </g>
          </g>
        </svg>
      </div>
      
      <div className="gauge-value-display">
        {value.toFixed(1)}<span className="gauge-unit">{displayUnit}</span>
      </div>
      
      <div className="gauge-range">
        <div className="gauge-range-item">
          <div className="gauge-range-color normal"></div>
          <div className="gauge-range-label">NORMAL</div>
        </div>
        <div className="gauge-range-item">
          <div className="gauge-range-color warning"></div>
          <div className="gauge-range-label">WARNING</div>
        </div>
        <div className="gauge-range-item">
          <div className="gauge-range-color critical"></div>
          <div className="gauge-range-label">CRITICAL</div>
        </div>
      </div>
      
      <div className="component-description">
        {displayTitle} Monitoring System
      </div>
    </div>
  );
};

export default GaugeDisplay;
