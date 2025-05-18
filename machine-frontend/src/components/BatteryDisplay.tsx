import React from 'react';
import './BatteryDisplay.css';

interface BatteryDisplayProps {
  isActive: boolean;
  width?: number;
  height?: number;
}

const BatteryDisplay: React.FC<BatteryDisplayProps> = ({
  isActive,
  width = 80,
  height = 80,
}) => {
  // Use the appropriate SVG based on the active state
  const svgPath = isActive 
    ? '/batteryOn.svg' 
    : '/battery.svg';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <img 
          src={svgPath} 
          alt={isActive ? "Active Battery" : "Inactive Battery"} 
          width={width} 
          height={height}
          className="object-contain"
        />
        {isActive && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        )}
      </div>
      <div className="mt-2 text-center">
        <div className="text-xs text-gray-400">STATUS: {isActive ? 'CHARGED' : 'DEPLETED'}</div>
        {isActive && <div className="text-xs text-blue-400">POWER LEVEL: 87%</div>}
      </div>
    </div>
  );
};

export default BatteryDisplay;
