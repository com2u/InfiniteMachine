import React from 'react';
import './MachineComponent.css';
import './MixerControl.css';
import LedDisplay from './LedDisplay';

interface ChemicalInput {
  id: string;
  name: string;
  amount: number;
  color: string;
}

interface MixerControlProps {
  isActive: boolean;
  chem1Amount: number;
  chem2Amount: number;
  chem3Amount: number;
  maxThroughput?: number;
  mixtureQuality?: number;
  onToggle?: () => void;
  width?: number;
  height?: number;
}

const MixerControl: React.FC<MixerControlProps> = ({
  isActive,
  chem1Amount,
  chem2Amount,
  chem3Amount,
  maxThroughput = 100,
  onToggle,
  width,
  height,
}) => {
  // Create chemicals array from individual amounts
  const chemicals: ChemicalInput[] = [
    { id: "1", name: "Chemical 1", amount: chem1Amount, color: "#3498db" },
    { id: "2", name: "Chemical 2", amount: chem2Amount, color: "#e74c3c" },
    { id: "3", name: "Chemical 3", amount: chem3Amount, color: "#2ecc71" }
  ];
  
  // Calculate total input and throughput percentage
  const totalInput = chemicals.reduce((sum, chem) => sum + chem.amount, 0);
  const throughputPercentage = Math.min(100, (totalInput / maxThroughput) * 100);
  const isOverloaded = totalInput > maxThroughput;
  
  // Calculate proportions for visualization
  const calculateProportions = () => {
    if (totalInput === 0) return chemicals.map(chem => ({ ...chem, proportion: 0 }));
    
    return chemicals.map(chem => ({
      ...chem,
      proportion: Math.round((chem.amount / totalInput) * 100)
    }));
  };
  
  const chemicalsWithProportions = calculateProportions();
  
  // Determine status and color class
  let statusText = 'OPERATIONAL';
  let statusClass = 'active';
  
  if (!isActive) {
    statusText = 'INACTIVE';
    statusClass = 'inactive';
  } else if (isOverloaded) {
    statusText = 'OVERLOADED';
    statusClass = 'critical';
  } else if (throughputPercentage > 80) {
    statusText = 'HIGH LOAD';
    statusClass = 'warning';
  }
  
  return (
    <div 
      className="machine-component mixer-control" 
      style={width && height ? { width, height } : undefined}
    >
      <LedDisplay 
        isActive={isActive}
        onToggle={onToggle}
      />
      <div className="component-screw-top-left"></div>
      <div className="component-screw-top-right"></div>
      <div className="component-screw-bottom-left"></div>
      <div className="component-screw-bottom-right"></div>
      <div className="connection-point connection-point-left"></div>
      <div className="connection-point connection-point-right"></div>
      
      <h3 className="component-title">CHEMICAL MIXER</h3>
      
      <div className="mixer-container">
        <div className="mixer-visualization">
          {chemicalsWithProportions.map((chemical, index: number) => (
            <div 
              key={chemical.id}
              className="mixer-chemical-layer"
              style={{
                height: `${chemical.proportion}%`,
                backgroundColor: chemical.color,
                opacity: isActive ? 1 : 0.5,
                bottom: `${chemicalsWithProportions
                  .slice(0, index)
                  .reduce((sum: number, chem: any) => sum + chem.proportion, 0)}%`
              }}
            />
          ))}
          <div className="mixer-beaker">
            <div className="mixer-beaker-top"></div>
            <div className="mixer-beaker-body"></div>
          </div>
        </div>
        
      <div className="mixer-throughput">
        <div className="throughput-label">
          <span>THROUGHPUT:</span>
          <span className={`throughput-value ${isOverloaded ? 'critical' : ''}`}>
            {Math.round(throughputPercentage)}%
          </span>
        </div>
        <div className="throughput-bar">
          <div 
            className={`throughput-fill ${isOverloaded ? 'critical' : ''}`}
            style={{ width: `${throughputPercentage}%` }}
          ></div>
          <div className="throughput-max-line"></div>
        </div>
        <div className="throughput-info">
          <span>Input: {totalInput} units</span>
          <span>Max: {maxThroughput} units</span>
        </div>
      </div>
      </div>
      
      <div className="component-status">
        <div className="status-label">
          <span>STATUS:</span>
          <span className={`status-value ${statusClass}`}>{statusText}</span>
        </div>
        
        <div className="status-label">
          <span>MIXTURE:</span>
          <span className={`status-value ${statusClass}`}>
            {isActive ? `${Math.min(100, Math.round(throughputPercentage))}%` : '0%'}
          </span>
        </div>
      </div>
      
      <div className="component-description">
        LABORATORY - Chemical Mixing System
      </div>
    </div>
  );
};

export default MixerControl;
