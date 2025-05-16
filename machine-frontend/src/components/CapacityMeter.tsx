import React from 'react';

interface CapacityMeterProps {
  value: number;
  maxValue: number;
  label?: string;
  height?: number;
  width?: number;
}

const CapacityMeter: React.FC<CapacityMeterProps> = ({
  value,
  maxValue,
  label,
  height = 120,
  width = 80,
}) => {
  // Handle potential undefined or NaN values
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const safeMaxValue = typeof maxValue === 'number' && !isNaN(maxValue) && maxValue > 0 ? maxValue : 1;
  
  // Calculate percentage - ensure it's a number between 0-100
  const percentage = Math.max(0, Math.min(100, (safeValue / safeMaxValue) * 100));
  
  // Calculate display height based on percentage
  const displayHeight = Math.max(0, Math.min(height - 10, (percentage / 100) * (height - 10)));
  
  // Custom color logic
  const getProgressColor = () => {
    if (percentage < 20) return '#f04d4d'; // Red
    if (percentage < 50) return '#fadb14'; // Yellow
    return '#52c41a'; // Green
  };
  
  return (
    <div className="flex flex-col items-center" style={{ width }}>
      {label && <div className="text-xs text-white mb-1 text-center">{label}</div>}
      
      <div className="relative" style={{ height, width: width * 0.6, border: '1px solid #666', borderRadius: '4px', backgroundColor: '#333' }}>
        <div 
          className="absolute bottom-0 left-0 right-0 w-full"
          style={{ 
            height: displayHeight, 
            backgroundColor: getProgressColor(),
            borderTop: '1px solid rgba(255,255,255,0.3)'
          }}
        />
      </div>
      
      <div className="text-center text-xs text-white mt-1">
        {safeValue.toFixed(0)} / {safeMaxValue.toFixed(0)}
      </div>
      <div className="text-xs font-bold text-center">
        <span className={percentage < 20 ? "text-red-400" : percentage < 50 ? "text-yellow-400" : "text-green-400"}>
          {percentage.toFixed(2)}%
        </span>
        <span className="text-gray-400"> Full</span>
      </div>
    </div>
  );
};

export default CapacityMeter;
