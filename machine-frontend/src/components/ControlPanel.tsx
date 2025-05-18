import React, { useState, useEffect } from 'react';
import ComponentRenderer from './ComponentRenderer';
import type { Component, MachineVariables } from '../types/MachineTypes';

interface ControlPanelProps {
  components: Component[];
  machineState: MachineVariables;
  updateVariable: (key: string, value: number | boolean) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  components,
  machineState,
  updateVariable
}) => {
  // Group components by their category
  const groupedComponents = components.reduce((acc, component) => {
    const category = component.category || 'misc';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(component);
    return acc;
  }, {} as Record<string, Component[]>);

  // Order of categories to display
  const categoryOrder = ['generator', 'battery', 'distribution', 'consumer', 'misc'];
  
  // Sort categories
  const sortedCategories = Object.keys(groupedComponents).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  return (
    <div className="flex flex-col p-4 bg-gray-900 min-h-screen">
      {/* Machine diagram */}
      <div className="mb-6 p-4 bg-black border border-gray-700 rounded-md shadow-lg">
        <h2 className="text-lg font-mono tracking-wider text-center text-gray-300 mb-4 border-b border-gray-700 pb-2">
          SYSTEM DIAGRAM
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {/* Energy flow diagram */}
          <div className="relative w-full h-48 bg-gray-900 border border-gray-800 rounded">
            {/* Generator nodes */}
            <div className="absolute left-10 top-1/2 transform -translate-y-1/2 flex flex-col gap-4">
              {components.filter(c => c.category === 'generator').map((gen, i) => (
                <div 
                  key={gen.id} 
                  className={`w-16 h-16 flex items-center justify-center rounded-full border-2 ${
                    machineState[`${gen.id}.active`] ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/10'
                  }`}
                >
                  <span className="text-xs font-mono">{gen.name}</span>
                </div>
              ))}
            </div>
            
            {/* Battery nodes */}
            <div className="absolute left-1/3 top-1/2 transform -translate-y-1/2 flex flex-col gap-4">
              {components.filter(c => c.category === 'battery').map((bat, i) => (
                <div 
                  key={bat.id} 
                  className={`w-16 h-16 flex items-center justify-center rounded-full border-2 ${
                    machineState[`${bat.id}.active`] ? 'border-blue-500 bg-blue-900/20' : 'border-gray-500 bg-gray-900/10'
                  }`}
                >
                  <span className="text-xs font-mono">{bat.name}</span>
                </div>
              ))}
            </div>
            
            {/* Distribution node */}
            <div className="absolute left-2/3 top-1/2 transform -translate-y-1/2">
              {components.filter(c => c.category === 'distribution').map((dist, i) => (
                <div 
                  key={dist.id} 
                  className={`w-16 h-16 flex items-center justify-center rounded-full border-2 ${
                    machineState[`${dist.id}.active`] ? 'border-purple-500 bg-purple-900/20' : 'border-gray-500 bg-gray-900/10'
                  }`}
                >
                  <span className="text-xs font-mono">{dist.name}</span>
                </div>
              ))}
            </div>
            
            {/* Consumer nodes */}
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2 flex flex-col gap-4">
              {components.filter(c => c.category === 'consumer').map((cons, i) => (
                <div 
                  key={cons.id} 
                  className={`w-16 h-16 flex items-center justify-center rounded-full border-2 ${
                    machineState[`${cons.id}.active`] ? 'border-yellow-500 bg-yellow-900/20' : 'border-gray-500 bg-gray-900/10'
                  }`}
                >
                  <span className="text-xs font-mono">{cons.name}</span>
                </div>
              ))}
            </div>
            
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
              {/* Generator to Battery connections */}
              {components.filter(c => c.category === 'generator').map((gen, i) => 
                components.filter(c => c.category === 'battery').map((bat, j) => (
                  <line 
                    key={`${gen.id}-${bat.id}`}
                    x1="90" 
                    y1={24 + i * 80} 
                    x2="calc(33.33% - 40px)" 
                    y2={24 + j * 80}
                    stroke={machineState[`${gen.id}.active`] ? "#22c55e" : "#6b7280"}
                    strokeWidth="2"
                    strokeDasharray={machineState[`${gen.id}.active`] ? "0" : "4"}
                  />
                ))
              )}
              
              {/* Battery to Distribution connections */}
              {components.filter(c => c.category === 'battery').map((bat, i) => 
                components.filter(c => c.category === 'distribution').map((dist, j) => (
                  <line 
                    key={`${bat.id}-${dist.id}`}
                    x1="calc(33.33% + 40px)" 
                    y1={24 + i * 80} 
                    x2="calc(66.66% - 40px)" 
                    y2="74"
                    stroke={machineState[`${bat.id}.active`] ? "#3b82f6" : "#6b7280"}
                    strokeWidth="2"
                    strokeDasharray={machineState[`${bat.id}.active`] ? "0" : "4"}
                  />
                ))
              )}
              
              {/* Distribution to Consumer connections */}
              {components.filter(c => c.category === 'distribution').map((dist, i) => 
                components.filter(c => c.category === 'consumer').map((cons, j) => (
                  <line 
                    key={`${dist.id}-${cons.id}`}
                    x1="calc(66.66% + 40px)" 
                    y1="74" 
                    x2="calc(100% - 50px)" 
                    y2={24 + j * 80}
                    stroke={machineState[`${dist.id}.active`] ? "#a855f7" : "#6b7280"}
                    strokeWidth="2"
                    strokeDasharray={machineState[`${dist.id}.active`] ? "0" : "4"}
                  />
                ))
              )}
            </svg>
          </div>
        </div>
      </div>
      
      {/* Component sections by category */}
      {sortedCategories.map(category => (
        <div key={category} className="mb-6">
          <h2 className="text-lg font-mono tracking-wider text-gray-300 mb-3 border-b border-gray-700 pb-1">
            {category.toUpperCase()} SYSTEMS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedComponents[category].map(component => (
              <div key={component.id} className="bg-gray-800 border border-gray-700 rounded-md shadow-lg overflow-hidden">
                <ComponentRenderer
                  component={component}
                  machineState={machineState}
                  updateVariable={updateVariable}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ControlPanel;
