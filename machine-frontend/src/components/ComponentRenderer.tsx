import React from 'react';
import BatteryDisplay from './BatteryDisplay';
import GeneratorDisplay from './GeneratorDisplay';
import GaugeDisplay from './GaugeDisplay';
import LedDisplay from './LedDisplay';
import SevenSegmentDisplay from './SevenSegmentDisplay';
import SliderControl from './SliderControl';
import Plotter from './Plotter';
import CapacityMeter from './CapacityMeter';
import type { Component, MachineVariables } from '../types/MachineTypes';

// Define interfaces for component props that match the actual component implementations

interface ComponentRendererProps {
  component: Component;
  machineState: MachineVariables;
  updateVariable: (key: string, value: number | boolean) => void;
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  machineState,
  updateVariable
}) => {
  const renderComponentHeader = () => (
    <>
      <div className="bg-gray-700 p-2 text-center">
        <h3 className="text-xl font-mono text-white">{component.name}</h3>
      </div>
      <div className="bg-gray-600 p-1 text-center text-xs text-gray-300">
        {component.description}
      </div>
    </>
  );

  const renderComponentByType = () => {
    const { id, type, visualization, properties } = component;

    // Special handling for specific component types
    if (type === 'generator') {
      return (
        <GeneratorDisplay
          isActive={!!machineState[`${id}.active`]}
          width={80}
          height={80}
        />
      );
    }

    if (type === 'battery') {
      return (
        <BatteryDisplay
          isActive={!!machineState[`${id}.active`]}
          width={80}
          height={80}
        />
      );
    }

    // Generic component rendering based on properties
    return (
      <div className="p-3">
        {properties.map((prop) => {
          const key = `${id}.${prop.key}`;
          const value = machineState[key];

          if (prop.type === 'boolean') {
            return (
              <div key={key} className="flex justify-between items-center mb-2">
                <span className="text-gray-300">{prop.label}</span>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-300">
                    {value ? 'ON' : 'OFF'}
                  </span>
                  <label className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      className="opacity-0 w-0 h-0"
                      checked={!!value}
                      onChange={(e) => {
                        if (prop.controllable) {
                          updateVariable(key, e.target.checked);
                        }
                      }}
                      disabled={!prop.controllable}
                    />
                    <span
                      className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-300 ${
                        value
                          ? 'bg-blue-500'
                          : 'bg-gray-700'
                      } ${!prop.controllable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`absolute h-4 w-4 left-1 bottom-1 bg-white rounded-full transition-transform duration-300 ${
                          value ? 'transform translate-x-6' : ''
                        }`}
                      ></span>
                    </span>
                  </label>
                </div>
              </div>
            );
          }

          if (prop.type === 'slider' && typeof value === 'number') {
            return (
              <SliderControl
                key={key}
                label={prop.label}
                value={value}
                min={prop.min || 0}
                max={prop.max || 100}
                step={prop.step || 1}
                onChange={(newValue: number) => {
                  if (prop.controllable) {
                    updateVariable(key, newValue);
                  }
                }}
                disabled={!prop.controllable}
                units={prop.units}
              />
            );
          }

          if (prop.type === 'gauge' && typeof value === 'number') {
            return (
              <GaugeDisplay
                key={key}
                label={prop.label}
                value={value}
                minValue={prop.min || 0}
                maxValue={prop.max || 100}
                units={prop.units}
              />
            );
          }

          if (prop.type === 'segment' && typeof value === 'number') {
            return (
              <div key={key} className="mb-4">
                <div className="text-center text-gray-300 mb-1">{prop.label}</div>
                <SevenSegmentDisplay
                  value={value}
                  digits={prop.digits || 1}
                />
              </div>
            );
          }

          if (prop.type === 'capacity' && typeof value === 'number') {
            const maxKey = prop.max_key;
            const maxValue = maxKey ? (machineState[`${id}.${maxKey}`] as number) : 100;
            
            return (
              <CapacityMeter
                key={key}
                label={prop.label}
                value={value}
                maxValue={maxValue}
              />
            );
          }

          if (prop.type === 'display') {
            return (
              <div key={key} className="text-center my-4">
                <div className="text-gray-300 mb-1">{prop.label}</div>
                <div className="text-2xl font-mono text-white">
                  {value}
                  {prop.units && <span className="text-sm ml-1">{prop.units}</span>}
                </div>
              </div>
            );
          }

          // Default fallback for any other property types
          return (
            <div key={key} className="mb-2">
              <span className="text-gray-300">{prop.label}: </span>
              <span className="text-white">{value?.toString()}</span>
              {prop.units && <span className="text-gray-400 ml-1">{prop.units}</span>}
            </div>
          );
        })}

        {/* Render visualization if it's a plotter */}
        {visualization.type === 'plotter' && visualization.source_key && (
          <Plotter
            label={visualization.label || ''}
            value={machineState[`${id}.${visualization.source_key}`] as number || 0}
            width={visualization.width || 200}
            height={visualization.height || 100}
          />
        )}

        {/* Render text visualization */}
        {visualization.type === 'text' && visualization.description && (
          <div className="mt-3 text-sm text-gray-400 italic">
            {visualization.description}
          </div>
        )}

        {/* Render status visualization with thresholds */}
        {visualization.type === 'status' && visualization.thresholds && (
          <div className="mt-3">
            <LedDisplay
              isActive={!!(machineState[`${id}.${visualization.source_key || 'temp'}`] as number > 0)}
              onToggle={() => {
                const key = `${id}.active`;
                const currentValue = machineState[key];
                if (typeof currentValue === 'boolean') {
                  updateVariable(key, !currentValue);
                }
              }}
            />
          </div>
        )}

        {/* Add LED display for all components with active property */}
        {properties.some(prop => prop.key === 'active' && prop.type === 'boolean') && (
          <div className="mt-3 flex justify-between items-center">
            <span className="text-gray-300">Status</span>
            <LedDisplay
              isActive={!!machineState[`${id}.active`]}
              onToggle={() => {
                const key = `${id}.active`;
                const currentValue = machineState[key];
                if (typeof currentValue === 'boolean') {
                  updateVariable(key, !currentValue);
                }
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {renderComponentHeader()}
      {renderComponentByType()}
    </div>
  );
};

export default ComponentRenderer;
