import React from 'react';
import { Switch } from 'antd';

interface LedDisplayProps {
  isActive: boolean;
  onToggle?: () => void; // Optional: Make it clickable
  size?: number; // Optional: size in pixels
}

const LedDisplay: React.FC<LedDisplayProps> = ({ isActive, onToggle, size = 24 }) => {
  // Custom styles for LED appearance
  const switchStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    border: `2px solid ${isActive ? '#10b981' : '#ef4444'}`,
    boxShadow: `0 0 10px 2px ${isActive ? 'rgba(74, 222, 128, 0.8)' : 'rgba(239, 68, 68, 0.7)'}`,
    cursor: onToggle ? 'pointer' : 'default'
  };

  return (
    <Switch
      checked={isActive}
      onChange={onToggle}
      style={switchStyle}
      className="ant-switch"
      title={onToggle ? (isActive ? "Click to deactivate" : "Click to activate") : (isActive ? "Active" : "Inactive")}
    />
  );
};

export default LedDisplay;
