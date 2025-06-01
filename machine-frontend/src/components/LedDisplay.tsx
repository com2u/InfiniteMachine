import React from 'react';
import './LedDisplay.css';

interface LedDisplayProps {
  isActive: boolean;
  onToggle?: () => void; // Optional: Make it clickable
  size?: number; // Optional: size in pixels
}

const LedDisplay: React.FC<LedDisplayProps> = ({ isActive, onToggle, size = 24 }) => {
  // Add a class name based on the active state
  const activeClass = isActive ? 'active' : 'inactive';
  
  return (
    <div 
      onClick={onToggle}
      className={`led-display ${activeClass}`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        cursor: onToggle ? 'pointer' : 'default',
      }}
      title={onToggle ? (isActive ? "Click to deactivate" : "Click to activate") : (isActive ? "Active" : "Inactive")}
    />
  );
};

export default React.memo(LedDisplay);
