import React from 'react';

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
      <img 
        src={svgPath} 
        alt={isActive ? "Active Generator" : "Inactive Generator"} 
        width={width} 
        height={height}
        className="object-contain"
      />
    </div>
  );
};

export default GeneratorDisplay;
