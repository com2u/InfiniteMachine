import React from 'react';

interface GaugeDisplayProps {
  value: number;
  minValue?: number;
  maxValue?: number;
  label?: string;
  units?: string;
  width?: number;
  height?: number;
}

const GaugeDisplay: React.FC<GaugeDisplayProps> = ({
  value,
  minValue = 0,
  maxValue = 150, // Default for temperature, can be overridden
  label,
  units = "°C",
  width = 150,
  height = 100,
}) => {
  const percentage = Math.max(0, Math.min(100, ((value - minValue) / (maxValue - minValue)) * 100));
  // Gauge goes from -90 degrees (left) to 90 degrees (right), so 180 degree span
  const rotation = (percentage / 100) * 180 - 90;

  let needleColorClass = 'stroke-green-500';
  if (percentage > 50) needleColorClass = 'stroke-yellow-500';
  if (percentage > 80) needleColorClass = 'stroke-red-500';
  
  // Determine arc color based on value for the background
  let activeArcColorClass = "stroke-green-500"; // Use stroke- classes
  if (value > maxValue * 0.5) activeArcColorClass = "stroke-yellow-500";
  if (value > maxValue * 0.8) activeArcColorClass = "stroke-red-500";

  const radius = width / 2 - 10; // Radius of the gauge arc
  const circumference = Math.PI * radius; // Circumference of the half-circle

  // Calculate the stroke-dasharray and stroke-dashoffset for the colored part of the arc
  const arcLength = (percentage / 100) * circumference;

  // Convert Tailwind stroke classes to actual hex colors for direct SVG use
  const colorMap: { [key: string]: string } = {
    'stroke-green-500': '#22c55e', // Tailwind green-500
    'stroke-yellow-500': '#eab308', // Tailwind yellow-500
    'stroke-red-500': '#ef4444',     // Tailwind red-500
    'stroke-gray-500': '#6b7280',   // Tailwind gray-500
    'fill-green-500': '#22c55e',
    'fill-yellow-500': '#eab308',
    'fill-red-500': '#ef4444',
  };

  const currentNeedleColor = colorMap[needleColorClass] || '#ffffff'; // Default to white if class not found
  const currentActiveArcColor = colorMap[activeArcColorClass] || '#22c55e';
  // const hubFillColor = colorMap[needleColorClass.replace('stroke-', 'fill-')] || '#ffffff'; // Keep for later

  const hubFillColor = colorMap[needleColorClass.replace('stroke-', 'fill-')] || '#ffffff';

  return (
    <div className="flex flex-col items-center p-1 bg-transparent" style={{ width: `${width}px` }}>
      {label && <span className="text-xs text-gray-100 mb-0.5">{label}</span>}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {/* Background Arc */}
        <path
          d={`M 10 ${height - 10} A ${radius} ${radius} 0 0 1 ${width - 10} ${height - 10}`}
          strokeWidth="10"
          fill="none"
          stroke={colorMap['stroke-gray-500']} 
        />
        {/* Foreground Arc (Colored based on value) */}
         <path
          d={`M 10 ${height - 10} A ${radius} ${radius} 0 0 1 ${width - 10} ${height - 10}`}
          strokeWidth="10"
          fill="none"
          stroke={currentActiveArcColor} 
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'strokeDasharray 0.3s ease-in-out, stroke 0.3s ease-in-out' }}
        />

        {/* Needle */}
        <line
          x1={width / 2}
          y1={height - 10}
          x2={width / 2}
          y2={(height - 10) - (radius - 3)}
          strokeWidth="2.5"
          stroke={currentNeedleColor} 
          style={{ transition: 'transform 0.3s ease-in-out, stroke 0.3s ease-in-out' }}
          transform={`rotate(${rotation}, ${width / 2}, ${height - 10})`}
          strokeLinecap="round"
        />
        {/* Needle Hub */}
        <circle cx={width / 2} cy={height - 10} r="4" fill={hubFillColor} style={{transition: 'fill 0.3s ease-in-out'}} />
        
        {/* Min/Max Labels */}
        <text x="8" y={height - 2} fontSize="7" fill="#cbd5e1" textAnchor="start">{minValue}</text> {/* Tailwind gray-300 */}
        <text x={width - 8} y={height - 2} fontSize="7" fill="#cbd5e1" textAnchor="end">{maxValue}</text> {/* Tailwind gray-300 */}
      </svg>
      <span className="text-sm font-semibold text-gray-100 mt-0">
        {value.toFixed(1)} {units}
      </span>
    </div>
  );
};

export default GaugeDisplay;
