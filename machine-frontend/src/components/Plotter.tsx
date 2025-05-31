import React, { useState, useEffect, useRef } from 'react';

interface PlotterProps {
  value: number;
  label?: string;
  width?: number;
  height?: number;
}

interface DataPoint {
  timestamp: number;
  value: number;
}

// Create a mock history of data points for demonstration
const createMockHistory = (currentValue: number): DataPoint[] => {
  const now = Date.now();
  const points: DataPoint[] = [];
  
  // Create data points for the last 10 minutes
  for (let i = 10; i >= 0; i--) {
    const timestamp = now - (i * 60 * 1000); // Every minute
    // Alternate between 0 and 1 for demonstration
    const value = i % 2 === 0 ? 1 : 0;
    points.push({ timestamp, value });
  }
  
  // Ensure the last point has the current value
  if (points.length > 0) {
    points[points.length - 1].value = currentValue;
  }
  
  return points;
};

const Plotter: React.FC<PlotterProps> = ({
  value,
  label = 'Production',
  width = 300,
  height = 150,
}) => {
  // Initialize with mock data for demonstration
  const [dataPoints, setDataPoints] = useState<DataPoint[]>(createMockHistory(value));
  const previousValueRef = useRef<number>(value);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  
  // Update data points when value changes
  useEffect(() => {
    const now = Date.now();
    
    // Only add a new point if the value changed or it's been more than 10 seconds
    if (value !== previousValueRef.current || now - lastUpdateTimeRef.current > 10000) {
      setDataPoints(prevPoints => {
        // Add new point
        const newPoints = [...prevPoints, { timestamp: now, value }];
        
        // Keep only points from the last 10 minutes
        const tenMinutesAgo = now - 10 * 60 * 1000;
        return newPoints.filter(point => point.timestamp >= tenMinutesAgo);
      });
      
      previousValueRef.current = value;
      lastUpdateTimeRef.current = now;
    }
  }, [value]);
  
  // Add a data point every second to ensure continuous updates
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setDataPoints(prevPoints => {
        // Add new point with current value
        const newPoints = [...prevPoints, { timestamp: now, value }];
        
        // Keep only points from the last 10 minutes
        const tenMinutesAgo = now - 10 * 60 * 1000;
        return newPoints.filter(point => point.timestamp >= tenMinutesAgo);
      });
      
      lastUpdateTimeRef.current = now;
    }, 1000); // Add a point every second for more live updates
    
    return () => clearInterval(interval);
  }, [value]);
  
  // Force re-render every second to show "live" movement of the time axis
  const [, setForceUpdate] = useState(0);
  useEffect(() => {
    const renderInterval = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(renderInterval);
  }, []);
  
  // Render the plot
  const renderPlot = () => {
    // Find min and max values for scaling
    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    
    // Ensure we have at least two points spanning the time range
    let visiblePoints = [...dataPoints]
      .filter(point => point.timestamp >= tenMinutesAgo)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // If we have no points, create default ones
    if (visiblePoints.length === 0) {
      visiblePoints = [
        { timestamp: tenMinutesAgo, value },
        { timestamp: now, value }
      ];
    }
    // If we have only one point, add another one to create a line
    else if (visiblePoints.length === 1) {
      // If the point is at the start, add one at the end
      if (Math.abs(visiblePoints[0].timestamp - tenMinutesAgo) < Math.abs(visiblePoints[0].timestamp - now)) {
        visiblePoints.push({ timestamp: now, value: visiblePoints[0].value });
      } 
      // If the point is at the end, add one at the start
      else {
        visiblePoints.unshift({ timestamp: tenMinutesAgo, value: visiblePoints[0].value });
      }
    }
    
    // Calculate positions for each point
    const graphWidth = width - 40; // Leave space for labels
    const graphHeight = height - 50; // Leave space for time markers
    
    const plotPoints = visiblePoints.map((point) => {
      // X position based on timestamp (0 to graphWidth)
      const x = 30 + Math.max(0, Math.min(graphWidth, ((point.timestamp - tenMinutesAgo) / (10 * 60 * 1000)) * graphWidth));
      
      // Y position - for binary values, use fixed positions
      // 0 = bottom (graphHeight - 10), 1 = top (10)
      const y = point.value > 0 ? 20 : graphHeight - 10;
      
      return { x, y, ...point };
    });
    
    // Create the SVG path
    let pathData = '';
    plotPoints.forEach((point, index) => {
      if (index === 0) {
        pathData += `M ${point.x} ${point.y}`;
      } else {
        pathData += ` L ${point.x} ${point.y}`;
      }
    });
    
    // Draw time markers (every minute)
    const timeMarkers = [];
    for (let i = 0; i <= 10; i++) {
      const markerPosition = 30 + (i / 10) * graphWidth;
      const minutesAgo = 10 - i;
      
      // Major markers for every minute
      timeMarkers.push(
        <g key={`marker-${i}`}>
          <line
            x1={markerPosition}
            y1={graphHeight + 5}
            x2={markerPosition}
            y2={graphHeight + 10}
            stroke="#666"
            strokeWidth="1"
          />
          <text
            x={markerPosition}
            y={graphHeight + 25}
            textAnchor="middle"
            fill="#999"
            fontSize="10"
          >
            {minutesAgo}m
          </text>
        </g>
      );
      
      // Minor markers for 30-second intervals (except at full minute marks)
      if (i < 10) {
        const halfMinutePosition = 30 + ((i + 0.5) / 10) * graphWidth;
        timeMarkers.push(
          <g key={`marker-${i}-half`}>
            <line
              x1={halfMinutePosition}
              y1={graphHeight + 5}
              x2={halfMinutePosition}
              y2={graphHeight + 8}
              stroke="#666"
              strokeWidth="0.5"
            />
          </g>
        );
      }
    }
    
    // Add "now" indicator
    const nowPosition = 30 + graphWidth;
    timeMarkers.push(
      <g key="now-marker">
        <line
          x1={nowPosition}
          y1="10"
          x2={nowPosition}
          y2={graphHeight + 10}
          stroke="#4f46e5"
          strokeWidth="1"
          strokeDasharray="4,2"
        />
        <text
          x={nowPosition}
          y={graphHeight + 25}
          textAnchor="middle"
          fill="#4f46e5"
          fontSize="10"
          fontWeight="bold"
        >
          Now
        </text>
      </g>
    );
    
    return (
      <svg width={width} height={height}>
        {/* Background */}
        <rect x="0" y="0" width={width} height={height} fill="#1f2937" rx="4" />
        
        {/* Grid lines */}
        <line x1="30" y1={graphHeight} x2={width - 10} y2={graphHeight} stroke="#444" strokeWidth="1" />
        <line x1="30" y1="20" x2={width - 10} y2="20" stroke="#444" strokeWidth="1" strokeDasharray="2,2" />
        <line x1="30" y1={graphHeight - 10} x2={width - 10} y2={graphHeight - 10} stroke="#444" strokeWidth="1" strokeDasharray="2,2" />
        
        {/* Y-axis */}
        <line x1="30" y1="10" x2="30" y2={graphHeight + 10} stroke="#666" strokeWidth="1" />
        
        {/* Y-axis labels */}
        <text x="10" y="25" fill="#999" fontSize="10" textAnchor="start">On</text>
        <text x="10" y={graphHeight - 5} fill="#999" fontSize="10" textAnchor="start">Off</text>
        
        {/* Time markers */}
        {timeMarkers}
        
        {/* Data line */}
        <path
          d={pathData}
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {plotPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill={point.value > 0 ? "#4ade80" : "#ef4444"}
            stroke="#fff"
            strokeWidth="1"
          />
        ))}
        
        {/* Title */}
        <text x={width / 2} y="15" fill="#9ca3af" fontSize="12" textAnchor="middle" fontWeight="bold">
          {label}
        </text>
      </svg>
    );
  };
  
  return renderPlot();
};

export default Plotter;
