import React, { useState, useEffect, useCallback } from 'react';
import LedDisplay from './components/LedDisplay';
import GaugeDisplay from './components/GaugeDisplay';
import SliderControl from './components/SliderControl';
import SevenSegmentDisplay from './components/SevenSegmentDisplay';
import LedFillLevelStrip from './components/LedFillLevelStrip';
import CapacityMeter from './components/CapacityMeter';
import Plotter from './components/Plotter';
import GeneratorDisplay from './components/GeneratorDisplay';
import BatteryDisplay from './components/BatteryDisplay';

interface MachineVariables {
  "generator1.value": number;
  "generator1.temp": number;
  "generator1.active": boolean;
  "generator2.value": number;
  "generator2.temp": number;
  "generator2.active": boolean;
  "generator3.value": number;
  "generator3.temp": number;
  "generator3.active": boolean;
  "akku1.capacity": number;
  "akku1.value": number;
  "akku1.active": boolean;
  "akku2.capacity": number;
  "akku2.value": number;
  "akku2.active": boolean;
  "akku3.capacity": number;
  "akku3.value": number;
  "akku3.active": boolean;
  "aggregator.value": number;
  "aggregator.active": boolean;
  "producer.consumption": number;
  "producer.output": number;
  "producer.active": boolean;
  "productCounter.value": number;
  "room.temp": number;
  [key: string]: number | boolean; // Index signature for dynamic access
}

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [machineState, setMachineState] = useState<MachineVariables | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
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

  useEffect(() => {
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 750); 
    return () => clearInterval(intervalId); 
  }, [fetchData]);

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
        fetchData();
      }
    } catch (e) {
      console.error("Failed to update variable:", key, e);
      setError(e instanceof Error ? e.message : String(e));
      fetchData(); 
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-800 text-2xl">Loading Machine Data...</div>;
  }

  if (error || !machineState) {
    return <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-red-600 text-2xl">
      <p>Error loading machine data: {error || "Machine state is null."}</p>
      <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Retry</button>
    </div>;
  }
  
  const ComponentCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = "" }) => (
    <div className={`bg-gray-800 p-2 rounded-md shadow-lg w-full flex flex-col space-y-1.5 border border-gray-700 ${className}`}>
      <h2 className="text-sm font-medium text-blue-300 mb-1 border-b border-gray-600 pb-0.5">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-2 text-gray-800 font-sans"> 
      <header className="text-center mb-3">
        <h1 className="text-xl font-semibold text-gray-700">MACHINE CONTROL PANEL</h1>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        
        {[1, 2, 3].map(id => {
          const activeKey = `generator${id}.active`;
          const valueKey = `generator${id}.value`;
          const tempKey = `generator${id}.temp`;
          return (
            <ComponentCard key={`gen-${id}`} title={`GEN ${id}`}>
              <div className="flex flex-col">
                <div className="text-xs text-gray-100 mb-1 text-center">Power Generator Unit</div>
                <div className="flex items-center space-x-2 text-xs text-gray-100">
                  <span>Active:</span>
                  <LedDisplay 
                    size={16}
                    isActive={machineState[activeKey] as boolean}
                    onToggle={() => updateBackendVariable(activeKey, !machineState[activeKey])}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <GeneratorDisplay 
                    isActive={machineState[activeKey] as boolean}
                    width={80}
                    height={80}
                  />
                  <GaugeDisplay
                    label="Temp."
                    value={machineState[tempKey] as number}
                    minValue={0} maxValue={150} units="°C"
                    width={100} height={65}
                  />
                </div>
                <SliderControl
                  label="Power Output"
                  value={machineState[valueKey] as number}
                  min={0} max={10} step={1}
                  onChange={(val) => updateBackendVariable(valueKey, val)}
                />
              </div>
            </ComponentCard>
          );
        })}

        {[1, 2, 3].map(id => {
          const activeKey = `akku${id}.active`;
          const valueKey = `akku${id}.value`;
          const capacityKey = `akku${id}.capacity`;
          return (
            <ComponentCard key={`akku-${id}`} title={`AKKU ${id}`}>
              <div className="flex flex-col">
                <div className="text-xs text-gray-100 mb-1 text-center">Energy Storage Unit</div>
                <div className="flex items-center space-x-2 text-xs text-gray-100">
                  <span>Active:</span>
                  <LedDisplay 
                    size={16}
                    isActive={machineState[activeKey] as boolean}
                    onToggle={() => updateBackendVariable(activeKey, !machineState[activeKey])}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <BatteryDisplay 
                    isActive={machineState[activeKey] as boolean}
                    width={80}
                    height={80}
                  />
                  <CapacityMeter
                    label="Charge Level"
                    value={Number(machineState[valueKey])}
                    maxValue={Number(machineState[capacityKey])}
                    width={80} height={100}
                  />
                </div>
              </div>
            </ComponentCard>
          );
        })}

        <ComponentCard title="AGGREGATOR">
          <div className="flex flex-col">
            <div className="text-xs text-gray-100 mb-1 text-center">Energy Distribution System</div>
            <div className="flex items-center space-x-2 text-xs text-gray-100">
              <span>Active:</span>
              <LedDisplay 
                size={16}
                isActive={machineState["aggregator.active"] as boolean}
                onToggle={() => updateBackendVariable("aggregator.active", !machineState["aggregator.active"])}
              />
            </div>
            <div className="flex flex-col items-center mt-2">
              <div className="text-xs text-gray-100 mb-1">Total Energy Available</div>
              <div className="bg-gray-700 rounded-md px-3 py-2 text-center">
                <span className="font-mono text-green-400 text-xl font-bold">
                  {(machineState["aggregator.value"] as number).toFixed(0)}
                </span>
                <span className="text-xs text-gray-300 ml-1">units</span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Combined from all active AKKUs
              </div>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="PRODUCER">
          <div className="flex flex-col">
            <div className="text-xs text-gray-100 mb-1 text-center">Manufacturing System</div>
            <div className="flex items-center space-x-2 text-xs text-gray-100">
              <span>Active:</span>
              <LedDisplay 
                size={16}
                isActive={machineState["producer.active"] as boolean}
                onToggle={() => updateBackendVariable("producer.active", !machineState["producer.active"])}
              />
            </div>
            <SliderControl
              label="Energy Consumption"
              value={machineState["producer.consumption"] as number}
              min={1} max={10} step={1}
              onChange={(val) => updateBackendVariable("producer.consumption", val)}
            />
            <div className="flex flex-col items-center mt-2">
              <div className="text-xs text-gray-100 mb-1">Production Status</div>
              <div className="flex items-center justify-center">
                <div className="mr-2 text-xs text-gray-100">Output:</div>
                <SevenSegmentDisplay value={machineState["producer.output"] as number} digits={1} charHeight={28} />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {machineState["producer.output"] === 1 ? "Producing" : "Idle"}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Requires {machineState["producer.consumption"]} energy units per cycle
              </div>
            </div>
          </div>
        </ComponentCard>
        
         <ComponentCard title="PRODUCTS" className="col-span-2">
            <div className="flex flex-col items-center py-2">
              <div className="text-xs text-gray-100 mb-2">Total Products Created</div>
              <SevenSegmentDisplay value={machineState["productCounter.value"]} digits={5} charHeight={36}/>
              <div className="mt-4 w-full">
                <Plotter 
                  value={machineState["producer.output"]} 
                  label="Production Output Over Time"
                  width={280}
                  height={120}
                />
              </div>
            </div>
        </ComponentCard>

        <ComponentCard title="ROOM TEMP">
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-100 mb-1">Facility Temperature</div>
              <GaugeDisplay
                label="Current"
                value={machineState["room.temp"] as number}
                minValue={0} maxValue={150} units="°C"
                width={100} height={65}
              />
              <div className="text-xs text-gray-400 mt-1">
                {machineState["room.temp"] < 50 ? "Normal" : 
                 machineState["room.temp"] < 80 ? "Warning" : "Critical"}
              </div>
            </div>
        </ComponentCard>
      </div>
    </div>
  );
}

export default App;
