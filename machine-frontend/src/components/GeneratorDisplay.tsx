import React from 'react';
import './GeneratorDisplay.css';

interface GeneratorDisplayProps {
  isActive: boolean;
  width?: number;
  height?: number;
}

const GeneratorDisplay: React.FC<GeneratorDisplayProps> = ({
  isActive,
  width = 80,
  height = 80,
}) => {
  // Use the appropriate SVG based on the active state
  const svgPath = isActive 
    ? '/generatorOn.svg' 
    : '/generator.svg';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <img 
          src={svgPath} 
          alt={isActive ? "Active Generator" : "Inactive Generator"} 
          width={width} 
          height={height}
          className="object-contain"
        />
        {isActive && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </div>
      <div className="mt-2 text-center">
        <div className="text-xs text-gray-400">STATUS: {isActive ? 'ONLINE' : 'OFFLINE'}</div>
      </div>
    </div>
  );
};

export default GeneratorDisplay;
