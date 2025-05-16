import React from 'react';

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
    <div className="flex flex-col items-center justify-center ml-10">
      <img 
        src={svgPath} 
        alt={isActive ? "Active Battery" : "Inactive Battery"} 
        width={width} 
        height={height}
        className="object-contain"
      />
    </div>
  );
};

export default BatteryDisplay;
