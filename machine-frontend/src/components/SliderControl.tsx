import React, { useState, useRef, useEffect } from 'react';
import './SliderControl.css';
import './MachineComponent.css';
import LedDisplay from './LedDisplay';

interface SliderControlProps {
  title?: string;
  label?: string; // Added for compatibility with ComponentRenderer
  min?: number;
  max?: number;
  value?: number;
  step?: number;
  onChange?: (value: number) => void;
  width?: number;
  height?: number;
  disabled?: boolean; // Added for compatibility with ComponentRenderer
  units?: string; // Added for compatibility with ComponentRenderer
  isActive?: boolean;
  onToggle?: () => void;
}

const SliderControl: React.FC<SliderControlProps> = ({
  title,
  label,
  min = 0,
  max = 100,
  value: initialValue = 50,
  step = 1,
  onChange,
  width,
  height,
  disabled = false,
  units,
  isActive = true,
  onToggle,
}) => {
  // Use provided values or fallbacks
  const displayTitle = title || label || 'CONTROL';
  
  const [value, setValue] = useState(initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  
  // Generate tick marks for the slider
  const generateTicks = () => {
    const ticks = [];
    const tickCount = Math.min(11, Math.floor((max - min) / step) + 1);
    
    for (let i = 0; i < tickCount; i++) {
      const isMajor = i === 0 || i === tickCount - 1 || i % Math.ceil(tickCount / 5) === 0;
      ticks.push(
        <div key={i} className={`slider-tick ${isMajor ? 'major' : ''}`}></div>
      );
    }
    
    return ticks;
  };
  
  // Generate labels for the slider
  const generateLabels = () => {
    const labels = [];
    const labelCount = 5;
    
    for (let i = 0; i < labelCount; i++) {
      const labelValue = min + (i / (labelCount - 1)) * (max - min);
      labels.push(
        <div key={i} className="slider-label">{Math.round(labelValue)}</div>
      );
    }
    
    return labels;
  };
  
  // Handle mouse down on slider handle
  const handleMouseDown = () => {
    if (disabled) return;
    setIsDragging(true);
  };
  
  // Handle mouse up (stop dragging)
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle mouse move while dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && trackRef.current && !disabled) {
      const track = trackRef.current;
      const trackRect = track.getBoundingClientRect();
      const trackWidth = trackRect.width;
      
      // Calculate position relative to track
      let position = e.clientX - trackRect.left;
      position = Math.max(0, Math.min(position, trackWidth));
      
      // Calculate value based on position
      const percentage = position / trackWidth;
      const newValue = min + percentage * (max - min);
      
      // Round to nearest step
      const steppedValue = Math.round(newValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));
      
      setValue(clampedValue);
      onChange && onChange(clampedValue);
    }
  };
  
  // Handle click on track
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (trackRef.current && !disabled) {
      const track = trackRef.current;
      const trackRect = track.getBoundingClientRect();
      const trackWidth = trackRect.width;
      
      // Calculate position relative to track
      let position = e.clientX - trackRect.left;
      position = Math.max(0, Math.min(position, trackWidth));
      
      // Calculate value based on position
      const percentage = position / trackWidth;
      const newValue = min + percentage * (max - min);
      
      // Round to nearest step
      const steppedValue = Math.round(newValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));
      
      setValue(clampedValue);
      onChange && onChange(clampedValue);
    }
  };
  
  // Handle increment button click
  const handleIncrement = () => {
    if (disabled) return;
    const newValue = Math.min(max, value + step);
    setValue(newValue);
    onChange && onChange(newValue);
  };
  
  // Handle decrement button click
  const handleDecrement = () => {
    if (disabled) return;
    const newValue = Math.max(min, value - step);
    setValue(newValue);
    onChange && onChange(newValue);
  };
  
  // Add event listeners for mouse move and mouse up
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    
    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);
  
  // Calculate handle position based on value
  const calculateHandlePosition = () => {
    const percentage = (value - min) / (max - min);
    return `${percentage * 100}%`;
  };

  return (
    <div 
      className="machine-component slider-control" 
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
      <div className="connection-point connection-point-bottom"></div>
      
      <h3 className="component-title">{displayTitle}</h3>
      
      <div className="slider-container">
        <div 
          className="slider-track" 
          ref={trackRef}
          onClick={handleTrackClick}
        >
          <div 
            className="slider-fill" 
            style={{ width: calculateHandlePosition() }}
          ></div>
          <div 
            className="slider-handle" 
            style={{ 
              left: calculateHandlePosition(),
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1
            }}
            onMouseDown={handleMouseDown}
          ></div>
        </div>
        
        <div className="slider-ticks">
          {generateTicks()}
        </div>
        
        <div className="slider-labels">
          {generateLabels()}
        </div>
      </div>
      
      <div className="slider-value-display">
        {value}{units && <span className="slider-unit">{units}</span>}
      </div>
      
      <div className="slider-buttons">
        <button 
          className="slider-button decrement" 
          onClick={handleDecrement}
          disabled={disabled || value <= min}
        >
          -
        </button>
        <button 
          className="slider-button increment" 
          onClick={handleIncrement}
          disabled={disabled || value >= max}
        >
          +
        </button>
      </div>
      
      <div className="component-description">
        {displayTitle} Control System
      </div>
    </div>
  );
};

export default SliderControl;
