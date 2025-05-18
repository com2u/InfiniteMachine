import React, { useState, useEffect, useCallback } from 'react';
import ControlPanel from './components/ControlPanel';
import GeneratorDisplay from './components/GeneratorDisplay';
import BatteryDisplay from './components/BatteryDisplay';
import SliderControl from './components/SliderControl';
import GaugeDisplay from './components/GaugeDisplay';
import type { MachineVariables, MachineStructure, Component } from './types/MachineTypes';
import './components/App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [machineState, setMachineState] = useState<MachineVariables | null>(null);
  const [machineStructure, setMachineStructure] = useState<MachineStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch machine structure
  const fetchStructure = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/structure`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: MachineStructure = await response.json();
      setMachineStructure(data);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch machine structure:", e);
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  // Fetch machine state
  const fetchState = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: MachineVariables = await response.json();
      setMachineState(data);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch machine state:", e);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch of structure and state
  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchStructure();
      await fetchState();
    };
    
    fetchInitialData();
    
    // Set up interval for state updates
    const intervalId = setInterval(fetchState, 750);
    return () => clearInterval(intervalId);
  }, [fetchStructure, fetchState]);

  const updateBackendVariable = async (key: string, value: number | boolean) => {
    try {
      if (machineState) {
        setMachineState(prevState => prevState ? { ...prevState, [key]: value } : null);
      }
      const response = await fetch(`${API_BASE_URL}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.new_values) { 
        setMachineState(result.new_values);
      } else { 
        fetchState();
      }
    } catch (e) {
      console.error("Failed to update variable:", key, e);
      setError(e instanceof Error ? e.message : String(e));
      fetchState(); 
    }
  };

  if (isLoading || !machineStructure) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-800 text-2xl">Loading Machine Data...</div>;
  }

  if (error || !machineState) {
    return <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-red-600 text-2xl">
      <p>Error loading machine data: {error || "Machine state is null."}</p>
      <button onClick={fetchState} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Retry</button>
    </div>;
  }

  // Function to render components at fixed positions
  const renderComponentsWithFixedLayout = () => {
    if (!machineStructure) return null;
    
    // Group components by category for easier access
    const componentsByCategory = machineStructure.components.reduce((acc, component) => {
      const category = component.category || 'misc';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(component);
      return acc;
    }, {} as Record<string, Component[]>);
    
    return (
      <div className="app-container">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-2 px-4 border-b border-gray-700 shadow-md z-10">
          <h1 className="text-xl font-mono tracking-wider text-center text-gray-300">INFINITE MACHINE CONTROL SYSTEM</h1>
          <div className="flex justify-center mt-1 space-x-4">
            <div className="text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700">
              <span className="text-gray-400">STATUS:</span> 
              <span className="text-green-400 ml-1">OPERATIONAL</span>
            </div>
            <div className="text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700">
              <span className="text-gray-400">SYSTEM:</span> 
              <span className="text-blue-400 ml-1">v2.5.3</span>
            </div>
            <div className="text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700">
              <span className="text-gray-400">UPTIME:</span> 
              <span className="text-yellow-400 ml-1">14:23:56</span>
            </div>
          </div>
        </div>
        
        {/* Fixed position components */}
        <div className="control-panel-container">
          <div className="control-panel">
            <h3 className="text-xl font-mono mb-2">CONTROL PANEL</h3>
            {componentsByCategory['consumer']?.map((component) => (
              <div key={component.id} className="mb-4">
                <SliderControl
                  label={component.properties[0]?.label || component.name}
                  value={machineState[`${component.id}.${component.properties[0]?.key}`] as number || 0}
                  min={component.properties[0]?.min || 0}
                  max={component.properties[0]?.max || 100}
                  step={component.properties[0]?.step || 1}
                  onChange={(newValue) => updateBackendVariable(`${component.id}.${component.properties[0]?.key}`, newValue)}
                  units={component.properties[0]?.units}
                  disabled={!component.properties[0]?.controllable}
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="generator-display-container">
          <div className="generator-display">
            <h3 className="text-xl font-mono mb-2">GENERATOR</h3>
            {componentsByCategory['generator']?.map((component) => (
              <div key={component.id} className="mb-4">
                <GeneratorDisplay
                  isActive={!!machineState[`${component.id}.active`]}
                  width={100}
                  height={100}
                />
                <div className="text-center mt-2">
                  <span className="text-gray-300">{component.name}</span>
                  <div className="text-sm text-gray-400">{component.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="battery-display-container">
          <div className="battery-display">
            <h3 className="text-xl font-mono mb-2">BATTERY</h3>
            {componentsByCategory['battery']?.map((component) => (
              <div key={component.id} className="mb-4">
                <BatteryDisplay
                  isActive={!!machineState[`${component.id}.active`]}
                  width={100}
                  height={100}
                />
                <div className="text-center mt-2">
                  <span className="text-gray-300">{component.name}</span>
                  <div className="text-sm text-gray-400">{component.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="slider-control-container">
          <div className="slider-control">
            <h3 className="text-xl font-mono mb-2">GAUGES</h3>
            {componentsByCategory['distribution']?.map((component) => (
              <div key={component.id} className="mb-4">
                <GaugeDisplay
                  label={component.properties[0]?.label || component.name}
                  value={machineState[`${component.id}.${component.properties[0]?.key}`] as number || 0}
                  minValue={component.properties[0]?.min || 0}
                  maxValue={component.properties[0]?.max || 100}
                  units={component.properties[0]?.units}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
          {/* Generator to Battery connection */}
          <line 
            x1="calc(100% - 150px)" 
            y1="120px" 
            x2="120px" 
            y2="calc(100% - 150px)"
            stroke="#6b7280"
            strokeWidth="2"
            strokeDasharray="4"
          />
          
          {/* Battery to Control Panel connection */}
          <line 
            x1="120px" 
            y1="calc(100% - 150px)" 
            x2="120px" 
            y2="120px"
            stroke="#6b7280"
            strokeWidth="2"
            strokeDasharray="4"
          />
          
          {/* Control Panel to Gauges connection */}
          <line 
            x1="120px" 
            y1="120px" 
            x2="calc(100% - 150px)" 
            y2="calc(100% - 150px)"
            stroke="#6b7280"
            strokeWidth="2"
            strokeDasharray="4"
          />
          
          {/* Gauges to Generator connection */}
          <line 
            x1="calc(100% - 150px)" 
            y1="calc(100% - 150px)" 
            x2="calc(100% - 150px)" 
            y2="120px"
            stroke="#6b7280"
            strokeWidth="2"
            strokeDasharray="4"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black p-0 text-gray-200 font-mono">
      {isLoading || !machineStructure ? (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-800 text-2xl">Loading Machine Data...</div>
      ) : error || !machineState ? (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-red-600 text-2xl">
          <p>Error loading machine data: {error || "Machine state is null."}</p>
          <button onClick={fetchState} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Retry</button>
        </div>
      ) : (
        renderComponentsWithFixedLayout()
      )}
    </div>
  );
}

export default App;
