import React, { useState, useEffect } from 'react';
import './MachineComponent.css';
import './ChemicalIngredient.css';
import LedDisplay from './LedDisplay';

interface ChemicalIngredientProps {
  name: string;
  fillLevel: number;
  isActive: boolean;
  id?: string;
  width?: number;
  height?: number;
  onToggle?: () => void;
  color?: string;
  outputLevel?: number;
  onOutputChange?: (value: number) => void;
}

const ChemicalIngredient: React.FC<ChemicalIngredientProps> = ({
  name,
  fillLevel,
  isActive,
  id = "1",
  width,
  height,
  onToggle,
  color = "#3498db", // Default blue color
  outputLevel = 50,
  onOutputChange
}) => {
  const [localOutputLevel, setLocalOutputLevel] = useState(outputLevel);
  
  // Update local state when props change
  useEffect(() => {
    setLocalOutputLevel(outputLevel);
  }, [outputLevel]);
  
  // Handle slider change
  const handleOutputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setLocalOutputLevel(newValue);
    if (onOutputChange) {
      onOutputChange(newValue);
    }
  };
  // Determine status and color class
  let statusText = 'OPERATIONAL';
  let statusClass = 'active';
  
  if (!isActive) {
    statusText = 'INACTIVE';
    statusClass = 'inactive';
  } else if (fillLevel < 20) {
    statusText = 'LOW';
    statusClass = 'critical';
  } else if (fillLevel < 50) {
    statusText = 'MEDIUM';
    statusClass = 'warning';
  }

  return (
    <div 
      className="machine-component chemical-ingredient" 
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
      <div className="connection-point connection-point-right"></div>
      
      <h3 className="component-title">{name}</h3>
      
      <div className="chemical-container">
        <div className="chemical-flask">
          <div 
            className="chemical-level" 
            style={{ 
              height: `${isActive ? fillLevel : 0}%`,
              backgroundColor: isActive ? color : '#555'
            }}
          ></div>
          <div className="chemical-flask-neck"></div>
          <div className="chemical-flask-body"></div>
          <div className="chemical-percentage">
            {isActive ? `${fillLevel}%` : 'OFF'}
          </div>
        </div>
      </div>
      
      <div className="component-status">
        <div className="status-label">
          <span>STATUS:</span>
          <span className={`status-value ${statusClass}`}>{statusText}</span>
        </div>
        
        <div className="status-label">
          <span>LEVEL:</span>
          <span className={`status-value ${statusClass}`}>{isActive ? `${fillLevel}%` : '0%'}</span>
        </div>
      </div>
      
      <div className="chemical-output-control">
        <div className="output-label">Output: {localOutputLevel}%</div>
        <input
          type="range"
          min="0"
          max="100"
          value={localOutputLevel}
          onChange={handleOutputChange}
          disabled={!isActive}
          className="chemical-slider"
          style={{ 
            '--track-color': color,
            opacity: isActive ? 1 : 0.5
          } as React.CSSProperties}
        />
      </div>
      
      <div className="component-description">
        CHEMICAL {id} - Laboratory Ingredient
      </div>
    </div>
  );
};

export default ChemicalIngredient;
