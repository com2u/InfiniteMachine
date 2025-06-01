import React, { useEffect, useState, useCallback } from 'react';
import BatteryDisplay from './BatteryDisplay';
import GeneratorDisplay from './GeneratorDisplay';
import GaugeDisplay from './GaugeDisplay';
import SliderControl from './SliderControl';
import ChemicalIngredient from './ChemicalIngredient';
import MixerControl from './MixerControl';
import EnvironmentDisplay from './EnvironmentDisplay';
import ProductCounterDisplay from './ProductCounterDisplay';
import ProducerDisplay from './ProducerDisplay';
import AggregatorDisplay from './AggregatorDisplay';
import SystemDisplay from './SystemDisplay';
import './ControlPanel.css';
import './MachineComponent.css';

// Define the type for our system data to match App.tsx
interface SystemData {
  timestamp: string;
  systemStatus: string;
  components: {
    batteries: Array<{
      id: number;
      status: string;
      powerLevel: number;
    }>;
    generators: Array<{
      id: number;
      status: string;
      powerLevel: number;
    }>;
    chemicals: Array<{
      id: number;
      status: string;
      fillLevel: number;
      purity: number;
      outputLevel?: number;
    }>;
    mixer: {
      active: boolean;
      chem1Amount: number;
      chem2Amount: number;
      chem3Amount: number;
      maxThroughput: number;
      mixtureQuality: number;
    };
    sensors: {
      pressure: number;
      temperature: number;
      flowRate: number;
    };
  };
}

// Define the type for backend API data
interface BackendData {
  [key: string]: any;
}

interface ControlPanelProps {
  systemData: SystemData | null;
  backendData: BackendData | null;
  onUpdateBackend: (key: string, value: any) => Promise<any>;
}

interface ComponentPosition {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  props: any;
}

interface Connection {
  from: string;
  to: string;
  type: string;
  status: 'active' | 'warning' | 'critical' | 'inactive';
}

// Define the machine structure interface for the API response
interface MachineComponentProperty {
  key: string;
  type: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  units?: string;
  controllable?: boolean;
  max_key?: string;
  digits?: number;
}

interface MachineComponentVisualization {
  type: string;
  width?: number;
  height?: number;
  color?: string;
  source_key?: string;
  label?: string;
  description?: string;
  thresholds?: Array<{
    max?: number;
    label: string;
  }>;
}

interface MachineComponentPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MachineComponent {
  id: string;
  type: string;
  name: string;
  description: string;
  category: string;
  properties: MachineComponentProperty[];
  visualization: MachineComponentVisualization;
  position: MachineComponentPosition;
  ui_props?: any;
}

interface MachineConnection {
  from: string;
  to: string;
  type: string;
}

interface MachineStructureData {
  components: MachineComponent[];
  layout: {
    grid: {
      columns: {
        sm: number;
        md: number;
        lg: number;
        xl: number;
      };
    };
  };
  connections: MachineConnection[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({ backendData, onUpdateBackend }) => {
  const [systemStatus, setSystemStatus] = useState('OPERATIONAL');
  const [systemLoad, setSystemLoad] = useState(78);
  const [powerOutput, setPowerOutput] = useState(1.2);
  const [efficiency, setEfficiency] = useState(85);
  const [components, setComponents] = useState<ComponentPosition[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  
  // Fetch machine structure from backend API
  useEffect(() => {
    const fetchMachineStructure = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/structure');
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }
        
        const data = await response.json() as MachineStructureData;
        
        // Create components from machine structure
        let newComponents: ComponentPosition[] = data.components.map((component) => {
          // Map component properties to props object
          const props: any = {
            ...component.ui_props
          };
          
          // Add title and description
          props.title = component.name;
          props.description = component.description;
          
          // Add properties from component definition
          component.properties.forEach((prop) => {
            if (prop.type === 'slider') {
              props.min = prop.min;
              props.max = prop.max;
              props.step = prop.step;
            }
            if (prop.type === 'gauge') {
              props.min = prop.min;
              props.max = prop.max;
              props.unit = prop.units;
            }
          });
          
          // Map component type
          let type = component.type;
          if (component.id.startsWith('akku')) {
            type = 'battery';
          }
          
          return {
            id: component.id,
            type,
            x: component.position?.x || 0,
            y: component.position?.y || 0,
            width: component.position?.width || 250,
            height: component.position?.height || 300,
            props
          };
        });
        
        setComponents(newComponents);
        
        // Create connections from machine structure
        const newConnections: Connection[] = data.connections.map((connection) => {
          return {
            from: connection.from,
            to: connection.to,
            type: connection.type,
            status: 'inactive' // Default status, will be updated based on component active state
          };
        });
        
        setConnections(newConnections);
      } catch (err) {
        console.error('Error fetching machine structure:', err);
      }
    };
    
    fetchMachineStructure();
  }, []);
  
  // No more useEffect for updates - everything is calculated in render
  

  

  
  // Render connection lines between components
  const renderConnections = () => {
    return connections.map((connection, index) => {
      const fromComponent = components.find(c => c.id === connection.from);
      const toComponent = components.find(c => c.id === connection.to);
      
      if (!fromComponent || !toComponent) return null;
      
      // Calculate connection points
      const fromX = fromComponent.x + fromComponent.width / 2;
      const fromY = fromComponent.y + fromComponent.height / 2;
      const toX = toComponent.x + toComponent.width / 2;
      const toY = toComponent.y + toComponent.height / 2;
      
      // Determine connection status based on the active state of the connected components
      let connectionStatus = 'inactive';
      const fromIsActive = backendData?.[`${fromComponent.id}.active`] !== false;
      const toIsActive = backendData?.[`${toComponent.id}.active`] !== false;
      
      if (fromIsActive && toIsActive) {
        connectionStatus = 'active';
      } else if (fromIsActive || toIsActive) {
        connectionStatus = 'warning';
      }
      
      // Determine if connection is horizontal or vertical
      const isHorizontal = Math.abs(toX - fromX) > Math.abs(toY - fromY);
      
      if (isHorizontal) {
        // Horizontal connection with vertical segments
        const midX = (fromX + toX) / 2;
        
        return (
          <React.Fragment key={`connection-${index}`}>
            {/* Horizontal line from source */}
            <div 
              className={`connection-line horizontal ${connectionStatus}`}
              style={{
                left: fromX,
                top: fromY,
                width: Math.abs(midX - fromX),
                transform: fromX > midX ? 'translateX(-100%)' : 'none'
              }}
            ></div>
            
            {/* Vertical line */}
            <div 
              className={`connection-line vertical ${connectionStatus}`}
              style={{
                left: midX,
                top: Math.min(fromY, toY),
                height: Math.abs(toY - fromY)
              }}
            ></div>
            
            {/* Horizontal line to target */}
            <div 
              className={`connection-line horizontal ${connectionStatus}`}
              style={{
                left: Math.min(midX, toX),
                top: toY,
                width: Math.abs(toX - midX)
              }}
            ></div>
            
            {/* Connection nodes */}
            <div 
              className={`connection-node ${connectionStatus}`}
              style={{ left: fromX, top: fromY }}
            ></div>
            <div 
              className={`connection-node ${connectionStatus}`}
              style={{ left: toX, top: toY }}
            ></div>
          </React.Fragment>
        );
      } else {
        // Vertical connection with horizontal segments
        const midY = (fromY + toY) / 2;
        
        return (
          <React.Fragment key={`connection-${index}`}>
            {/* Vertical line from source */}
            <div 
              className={`connection-line vertical ${connectionStatus}`}
              style={{
                left: fromX,
                top: Math.min(fromY, midY),
                height: Math.abs(midY - fromY)
              }}
            ></div>
            
            {/* Horizontal line */}
            <div 
              className={`connection-line horizontal ${connectionStatus}`}
              style={{
                left: Math.min(fromX, toX),
                top: midY,
                width: Math.abs(toX - fromX)
              }}
            ></div>
            
            {/* Vertical line to target */}
            <div 
              className={`connection-line vertical ${connectionStatus}`}
              style={{
                left: toX,
                top: Math.min(midY, toY),
                height: Math.abs(toY - midY)
              }}
            ></div>
            
            {/* Connection nodes */}
            <div 
              className={`connection-node ${connectionStatus}`}
              style={{ left: fromX, top: fromY }}
            ></div>
            <div 
              className={`connection-node ${connectionStatus}`}
              style={{ left: toX, top: toY }}
            ></div>
          </React.Fragment>
        );
      }
    });
  };
  
  // Memoized event handlers to prevent unnecessary re-renders
  const handleChemicalToggle = useCallback((chemicalId: string) => {
    const backendKey = `chemical${chemicalId}.active`;
    const currentValue = backendData?.[backendKey];
    
    if (currentValue !== undefined) {
      // Toggle the value by sending the opposite of the current value
      onUpdateBackend(backendKey, !currentValue);
    }
  }, [backendData, onUpdateBackend]);
  
  // Handle chemical fill level change
  const handleChemicalFillLevelChange = (chemicalId: string, value: number) => {
    const backendKey = `chemical${chemicalId}.value`;
    onUpdateBackend(backendKey, value);
  };
  
  // Handle chemical output level change
  const handleChemicalOutputChange = (chemicalId: string, value: number) => {
    const backendKey = `chemical${chemicalId}.output`;
    onUpdateBackend(backendKey, value);
  };
  
  // Handle mixer toggle
  const handleMixerToggle = () => {
    const backendKey = 'mixer.active';
    const currentValue = backendData?.[backendKey];
    
    if (currentValue !== undefined) {
      // Toggle the value by sending the opposite of the current value
      onUpdateBackend(backendKey, !currentValue);
    }
  };
  
  // This function is no longer needed as proportions are calculated in the mixer component
  // based on the chemical output levels
  
  // Handle generator toggle
  const handleGeneratorToggle = (generatorId: string) => {
    const backendKey = `generator${generatorId}.active`;
    const currentValue = backendData?.[backendKey];
    
    // Toggle the value by sending the opposite of the current value
    onUpdateBackend(backendKey, !currentValue);
  };
  
  // Handle generator power level change
  const handleGeneratorPowerChange = (generatorId: string, value: number) => {
    // Convert percentage (0-100) to generator value (0-10)
    const backendValue = Math.round((value / 100) * 10);
    const backendKey = `generator${generatorId}.value`;
    
    onUpdateBackend(backendKey, backendValue);
  };
  
  // Handle battery toggle
  const handleBatteryToggle = (batteryId: string) => {
    const backendKey = `akku${batteryId}.active`;
    const currentValue = backendData?.[backendKey];
    
    // Toggle the value by sending the opposite of the current value
    onUpdateBackend(backendKey, !currentValue);
  };
  
  // Handle producer consumption change
  const handleProducerConsumptionChange = (value: number) => {
    // Convert percentage (0-100) to consumption value (1-10)
    const backendValue = Math.max(1, Math.min(10, Math.round((value / 100) * 10)));
    onUpdateBackend('producer.consumption', backendValue);
  };
  
  
  // Handle gauge toggle
  const handleGaugeToggle = (gaugeId: string) => {
    const backendKey = `${gaugeId}.active`;
    const currentValue = backendData?.[backendKey];
    
    if (currentValue !== undefined) {
      // Toggle the value by sending the opposite of the current value
      onUpdateBackend(backendKey, !currentValue);
    }
  };
  
  // Handle slider toggle
  const handleSliderToggle = (sliderId: string) => {
    const backendKey = `${sliderId}.active`;
    const currentValue = backendData?.[backendKey];
    
    if (currentValue !== undefined) {
      // Toggle the value by sending the opposite of the current value
      onUpdateBackend(backendKey, !currentValue);
    }
  };
  
  // Render components based on their type and position
  const renderComponent = (component: ComponentPosition) => {
    const { id, type, x, y, width, height, props } = component;
    
    const style = {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`
    };
    
    switch (type) {
      case 'battery':
        return (
          <div key={id} className="fixed-component" style={style}>
            <BatteryDisplay 
              {...props} 
              width={width} 
              height={height}
              onToggle={() => handleBatteryToggle(props.id)}
            />
          </div>
        );
      case 'generator':
        return (
          <div key={id} className="fixed-component" style={style}>
            <GeneratorDisplay 
              {...props} 
              width={width} 
              height={height}
              temperature={backendData?.[`${id}.temp`] || 20}
              onToggle={() => handleGeneratorToggle(props.id)}
              onPowerChange={(value) => handleGeneratorPowerChange(props.id, value)}
              onAggregatorXChange={(value) => onUpdateBackend('aggregatorX.value', value)}
            />
          </div>
        );
      case 'gauge':
        return (
          <div key={id} className="fixed-component" style={style}>
            <GaugeDisplay 
              {...props} 
              width={width} 
              height={height}
              isActive={backendData?.[`${id}.active`] !== false}
              onToggle={() => handleGaugeToggle(id)}
            />
          </div>
        );
      case 'chemical':
        return (
          <div key={id} className="fixed-component" style={style}>
            <ChemicalIngredient 
              {...props} 
              name={props.title}
              width={width} 
              height={height}
              isActive={backendData?.[`${id}.active`] !== false}
              fillLevel={backendData?.[`${id}.value`] || props.fillLevel}
              purity={backendData?.[`${id}.purity`] || props.purity}
              outputLevel={backendData?.[`${id}.output`] || 50}
              onToggle={() => handleChemicalToggle(props.id)}
              onFillLevelChange={(value: number) => handleChemicalFillLevelChange(props.id, value)}
              onOutputChange={(value: number) => handleChemicalOutputChange(props.id, value)}
            />
          </div>
        );
      case 'mixer':
        return (
          <div key={id} className="fixed-component" style={style}>
            <MixerControl 
              {...props} 
              width={width} 
              height={height}
              isActive={backendData?.['mixer.active'] !== false}
              chem1Amount={backendData?.[`chemical1.output`] || 50}
              chem2Amount={backendData?.[`chemical2.output`] || 50}
              chem3Amount={backendData?.[`chemical3.output`] || 50}
              maxThroughput={backendData?.['mixer.max_throughput'] || 200}
              mixtureQuality={backendData?.['mixer.mixture_quality'] || props.mixtureQuality}
              onToggle={handleMixerToggle}
            />
          </div>
        );
      case 'slider':
        // Map slider IDs to their respective handlers
        let onChangeHandler;
        if (id === 'power-slider') {
          onChangeHandler = handleProducerConsumptionChange;
        }
        
        return (
          <div key={id} className="fixed-component" style={style}>
            <SliderControl 
              {...props} 
              width={width} 
              height={height}
              onChange={onChangeHandler}
              isActive={backendData?.[`${id}.active`] !== false}
              onToggle={() => handleSliderToggle(id)}
            />
          </div>
        );
      case 'environment':
        return (
          <div key={id} className="fixed-component" style={style}>
            <EnvironmentDisplay 
              isActive={backendData?.[`${id}.active`] !== false}
              temperature={backendData?.[`${id}.temp`] || 25}
              title={props.title}
              description={props.description}
              width={width}
              height={height}
              onToggle={() => {
                const backendKey = `${id}.active`;
                const currentValue = backendData?.[backendKey];
                // Toggle the value by sending the opposite of the current value
                onUpdateBackend(backendKey, !currentValue);
              }}
            />
          </div>
        );
      case 'counter':
        return (
          <div key={id} className="fixed-component" style={style}>
            <ProductCounterDisplay 
              isActive={backendData?.[`${id}.active`] !== false}
              count={backendData?.[`${id}.value`] || 0}
              productionValue={backendData?.[`producer.output`] || 0}
              title={props.title}
              description={props.description}
              width={width}
              height={height}
              onToggle={() => {
                const backendKey = `${id}.active`;
                const currentValue = backendData?.[backendKey];
                // Toggle the value by sending the opposite of the current value
                onUpdateBackend(backendKey, !currentValue);
              }}
            />
          </div>
        );
      case 'producer':
        return (
          <div key={id} className="fixed-component" style={style}>
            <ProducerDisplay 
              isActive={backendData?.[`${id}.active`] !== false}
              consumption={backendData?.[`${id}.consumption`] || 5}
              output={backendData?.[`${id}.output`] || 0}
              title={props.title}
              description={props.description}
              width={width}
              height={height}
              onToggle={() => {
                const backendKey = `${id}.active`;
                const currentValue = backendData?.[backendKey];
                // Toggle the value by sending the opposite of the current value
                onUpdateBackend(backendKey, !currentValue);
              }}
              onConsumptionChange={(value) => {
                onUpdateBackend(`${id}.consumption`, value);
              }}
            />
          </div>
        );
      case 'aggregator':
        return (
          <div key={id} className="fixed-component" style={style}>
            <AggregatorDisplay 
              isActive={backendData?.[`${id}.active`] !== false}
              totalEnergy={backendData?.[`${id}.value`] || 0}
              title={props.title}
              description={props.description}
              width={width}
              height={height}
              onToggle={() => {
                const backendKey = `${id}.active`;
                const currentValue = backendData?.[backendKey];
                // Toggle the value by sending the opposite of the current value
                onUpdateBackend(backendKey, !currentValue);
              }}
            />
          </div>
        );
      case 'system':
        return (
          <div key={id} className="fixed-component" style={style}>
            <SystemDisplay 
              status={systemStatus}
              isActive={backendData?.[`${id}.active`] !== false}
              title={props.title}
              description={props.description}
              width={width}
              height={height}
              onToggle={() => {
                const backendKey = `${id}.active`;
                const currentValue = backendData?.[backendKey];
                // Toggle the value by sending the opposite of the current value
                onUpdateBackend(backendKey, !currentValue);
              }}
              onDebug={() => onUpdateBackend('system.debug', true)}
            />
          </div>
        );
      default:
        return null;
    }
  };
  
  // Components get values directly from backendData - no more systemData updates
  
  // Simulate changing system values
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly fluctuate system values
      setSystemLoad(prev => {
        const newValue = prev + (Math.random() * 6 - 3);
        return Math.max(50, Math.min(95, newValue));
      });
      
      setPowerOutput(prev => {
        const newValue = prev + (Math.random() * 0.2 - 0.1);
        return Math.max(0.8, Math.min(1.5, newValue));
      });
      
      setEfficiency(prev => {
        const newValue = prev + (Math.random() * 4 - 2);
        return Math.max(75, Math.min(95, newValue));
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Determine system status based on load
  useEffect(() => {
    if (systemLoad > 90) {
      setSystemStatus('CRITICAL');
    } else if (systemLoad > 80) {
      setSystemStatus('WARNING');
    } else {
      setSystemStatus('OPERATIONAL');
    }
  }, [systemLoad]);

  // Calculate the minimum height needed for all components
  const minHeight = Math.max(...components.map(c => c.y + c.height)) + 100;

  return (
    <div className="control-panel" style={{ minHeight: `${minHeight}px`, position: 'relative' }}>
      <div className="panel-screw-top-left"></div>
      <div className="panel-screw-top-right"></div>
      <div className="panel-screw-bottom-left"></div>
      <div className="panel-screw-bottom-right"></div>
      
      <h1 className="control-panel-title">INFINITE MACHINE CONTROL SYSTEM</h1>
      
      {/* System metrics */}
      <div className="system-metrics">
        <div className="metric">
          <div className="metric-label">SYSTEM LOAD</div>
          <div className="metric-value">{systemLoad.toFixed(1)}%</div>
        </div>
        <div className="metric">
          <div className="metric-label">POWER OUTPUT</div>
          <div className="metric-value">{powerOutput.toFixed(2)} MW</div>
        </div>
        <div className="metric">
          <div className="metric-label">EFFICIENCY</div>
          <div className="metric-value">{efficiency.toFixed(1)}%</div>
        </div>
      </div>
      

      

      
      {/* Render all components */}
      {components.map(renderComponent)}
      
      {/* Render connections between components */}
      {renderConnections()}
    </div>
  );
};

export default React.memo(ControlPanel);
