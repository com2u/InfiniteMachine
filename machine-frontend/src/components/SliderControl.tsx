import React from 'react';
import { Slider } from 'antd';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (newValue: number) => void;
  units?: string;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  units = "",
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(event.target.value));
  };

  return (
    <div className="p-1.5 bg-transparent w-full"> {/* Removed max-w-xs to let card control width */}
      <label htmlFor={label} className="block text-xs font-medium text-gray-200 mb-0.5"> {/* Slightly brighter label text */}
        {label}: <span className="font-bold text-blue-300">{value.toFixed(units === "°C" || units === "" ? 0 : 1)}{units}</span>
      </label>
  <Slider
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={onChange}
    className="w-full h-2.5 bg-gray-500 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 slider-thumb" 
  />
      {/* Custom CSS might be needed for more advanced thumb styling, Tailwind's accent color is a good start */}
      <div className="flex justify-between text-xs text-gray-300 mt-0.5">
        <span>{min}{units}</span>
        <span>{max}{units}</span>
      </div>
    </div>
  );
};

export default SliderControl;
