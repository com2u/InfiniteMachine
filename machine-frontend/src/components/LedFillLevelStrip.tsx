import React from 'react';

interface LedFillLevelStripProps {
  value: number;
  maxValue: number;
  levels?: number; // Number of "LEDs" in the strip
  label?: string;
  height?: number; // Height of the strip
  width?: number; // Width of the strip
  useLogScale?: boolean; // Use logarithmic scale for better visualization of small values
}

const LedFillLevelStrip: React.FC<LedFillLevelStripProps> = ({
  value,
  maxValue,
  levels = 10,
  label,
  height = 20,
  width = 120,
  useLogScale = true, // Default to log scale for better visualization of small values
}) => {
  // Ensure percentage calculation is accurate and clamped between 0-100
  const rawPercentage = Math.max(0, Math.min(100, (value / maxValue) * 100));
  
  // Calculate display percentage using logarithmic scale if enabled
  let displayPercentage = rawPercentage;
  if (useLogScale && rawPercentage > 0) {
    // Log scale: 1% becomes ~33%, 0.1% becomes ~22%, 0.01% becomes ~11%
    // This makes small values much more visible
    displayPercentage = Math.max(1, 33 * Math.log10(rawPercentage + 1));
  }
  
  // Ensure at least one level is lit if there's any value
  let litLevels = 0;
  if (value > 0) {
    litLevels = Math.max(1, Math.ceil((displayPercentage / 100) * levels));
  }
  
  // Debug
  console.log(`LedFillLevelStrip: value=${value}, maxValue=${maxValue}, rawPercentage=${rawPercentage}%, displayPercentage=${displayPercentage}%, litLevels=${litLevels}/${levels}`);

  // Color coding based on fill level
  let stripColor = 'bg-green-500';
  if (rawPercentage < 50) stripColor = 'bg-yellow-500';
  if (rawPercentage < 20) stripColor = 'bg-red-500';
  
  // Make small values more visible with a brighter color
  if (rawPercentage < 1) stripColor = 'bg-blue-500';

  return (
    <div className="p-1 bg-transparent" style={{ width: width + 4 }}>
      {label && <div className="text-xs text-gray-100 mb-0.5 text-center">{label}</div>}
      <div className="flex border border-gray-500 rounded overflow-hidden" style={{ height: `${height}px`, width: `${width}px` }}> {/* Slightly lighter border for better definition */}
        {Array.from({ length: levels }).map((_, index) => (
          <div
            key={index}
            className={`flex-1 transition-colors duration-150 ${index < litLevels ? stripColor : 'bg-gray-500 opacity-40'}`} // Adjusted off-color and opacity
            style={{
              minWidth: `${Math.max(2, (width / levels) -1 )}px`, // Ensure segments are at least 2px wide, adjust separator space
              borderRight: index < levels - 1 ? '1px solid #4A5568' : 'none' // Tailwind gray-600 for separator
            }}
          />
        ))}
      </div>
      <div className="text-center text-xs text-gray-100 mt-0.5">
        {value.toFixed(0)} / {maxValue.toFixed(0)} ({rawPercentage.toFixed(0)}%)
      </div>
    </div>
  );
};

export default LedFillLevelStrip;
