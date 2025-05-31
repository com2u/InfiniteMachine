import React from 'react';
import './MachineComponent.css';
import './ProductCounterDisplay.css';
import LedDisplay from './LedDisplay';
import Plotter from './Plotter';

interface ProductCounterDisplayProps {
  isActive?: boolean;
  count: number;
  productionValue?: number; // 0 or 1 to indicate production status
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  onToggle?: () => void;
}

const ProductCounterDisplay: React.FC<ProductCounterDisplayProps> = ({
  isActive = true,
  count,
  productionValue = 0,
  title = 'PRODUCTS',
  description = 'Total Products Created',
  width,
  height,
  onToggle
}) => {
  // Format the count to always show 5 digits with leading zeros
  const formattedCount = count.toString().padStart(5, '0');
  
  return (
    <div 
      className="machine-component product-counter-display" 
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
      
      <h3 className="component-title">{title}</h3>
      
      <div className="counter-container">
        <div className="counter-display">
          {formattedCount.split('').map((digit, index) => (
            <div key={index} className="counter-digit">
              {digit}
            </div>
          ))}
        </div>
        
        <div className="counter-graph">
          <Plotter 
            value={productionValue} 
            width={width ? width - 40 : 260} 
            height={100} 
            label="Production Output"
          />
        </div>
      </div>
      
      <div className="component-description">
        {description}
      </div>
    </div>
  );
};

export default ProductCounterDisplay;
