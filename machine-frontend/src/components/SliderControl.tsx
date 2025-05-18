import React from 'react';
import { Slider } from 'antd';
import './SliderControl.css';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (newValue: number) => void;
  units?: string;
  disabled?: boolean;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  units = "",
  disabled = false,
}) => {
  return (
    <div className="slider-control-wrapper">
      <div className="slider-header">
        <label htmlFor={label} className="slider-label">
          {label}: <span className="slider-value">{typeof value === 'number' ? value.toFixed(units === "°C" || units === "" ? 0 : 1) : value}{units}</span>
        </label>
      </div>
      
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="slider-component"
      />
      
      <div className="slider-range">
        <span className="min-value">{min}{units}</span>
        <span className="max-value">{max}{units}</span>
      </div>
      
      <div className="slider-indicators">
        {Array.from({ length: 5 }).map((_, i) => {
          const indicatorValue = min + (max - min) * (i / 4);
          const isActive = value >= indicatorValue;
          return (
            <div 
              key={i} 
              className={`indicator ${isActive ? 'active' : 'inactive'}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SliderControl;
