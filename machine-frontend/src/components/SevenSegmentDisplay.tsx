import React from 'react';

interface SevenSegmentDisplayProps {
  value: number | string;
  digits?: number;
  charHeight?: number;
}

// Simple text-based display that mimics 7-segment style
const SevenSegmentDisplay: React.FC<SevenSegmentDisplayProps> = ({ value, digits = 3, charHeight = 40 }) => {
  const stringValue = String(value).padStart(digits, ' ');
  const fontSize = Math.max(16, Math.min(charHeight * 0.8, 36)); // Scale font size based on charHeight
  
  return (
    <div className="inline-flex bg-black rounded-sm p-2 shadow-inner">
      <div 
        className="font-mono text-red-500 font-bold tracking-wider"
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: 1,
          fontFamily: "'Digital-7', 'DS-Digital', monospace"
        }}
      >
        {stringValue.slice(-digits)}
      </div>
    </div>
  );
};

export default SevenSegmentDisplay;
