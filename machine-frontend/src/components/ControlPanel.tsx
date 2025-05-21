import React, { useEffect, useState } from 'react';
import BatteryDisplay from './BatteryDisplay';
import GeneratorDisplay from './GeneratorDisplay';
import GaugeDisplay from './GaugeDisplay';
import SliderControl from './SliderControl';
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
  type: 'battery' | 'generator' | 'gauge' | 'slider';
  x: number;
  y: number;
  width: number;
  height: number;
  props: any;
}

interface Connection {
  from: string;
  to: string;
  type: 'power' | 'control' | 'data';
  status: 'active' | 'warning' | 'critical' | 'inactive';
}

const ControlPanel: React.FC<ControlPanelProps> = ({ systemData, backendData, onUpdateBackend }) => {
  const [systemStatus, setSystemStatus] = useState('OPERATIONAL');
  const [systemLoad, setSystemLoad] = useState(78);
  const [powerOutput, setPowerOutput] = useState(1.2);
  const [efficiency, setEfficiency] = useState(85);
  
  // Define fixed positions for components with improved alignment
  const components: ComponentPosition[] = [
    // Row 1: Generators
    {
      id: 'generator1',
      type: 'generator',
      x: 50,
      y: 150,
      width: 250,
      height: 380,
      props: {
        isActive: true,
        id: "1",
        powerLevel: 75
      }
    },
    {
      id: 'generator2',
      type: 'generator',
      x: 350,
      y: 150,
      width: 250,
      height: 380,
      props: {
        isActive: true,
        id: "2",
        powerLevel: 65
      }
    },
    {
      id: 'generator3',
      type: 'generator',
      x: 650,
      y: 150,
      width: 250,
      height: 380,
      props: {
        isActive: false,
        id: "3",
        powerLevel: 0
      }
    },
    
    // Row 2: Batteries (Akku)
    {
      id: 'battery1',
      type: 'battery',
      x: 50,
      y: 580,
      width: 250,
      height: 380,
      props: {
        isActive: true,
        id: "1",
        powerLevel: 87
      }
    },
    {
      id: 'battery2',
      type: 'battery',
      x: 350,
      y: 580,
      width: 250,
      height: 380,
      props: {
        isActive: true,
        id: "2",
        powerLevel: 65
      }
    },
    {
      id: 'battery3',
      type: 'battery',
      x: 650,
      y: 580,
      width: 250,
      height: 380,
      props: {
        isActive: false,
        id: "3",
        powerLevel: 30
      }
    },
    
    // Row 3: Gauges
    {
      id: 'pressure-gauge',
      type: 'gauge',
      x: 50,
      y: 1010,
      width: 250,
      height: 300,
      props: {
        title: 'PRESSURE',
        value: 75,
        min: 0,
        max: 100,
        unit: 'BAR'
      }
    },
    {
      id: 'temperature-gauge',
      type: 'gauge',
      x: 350,
      y: 1010,
      width: 250,
      height: 300,
      props: {
        title: 'TEMPERATURE',
        value: 65,
        min: 0,
        max: 150,
        unit: '°C'
      }
    },
    {
      id: 'flow-gauge',
      type: 'gauge',
      x: 650,
      y: 1010,
      width: 250,
      height: 300,
      props: {
        title: 'FLOW RATE',
        value: 42,
        min: 0,
        max: 100,
        unit: 'L/s'
      }
    },
    
    // Row 4: Sliders
    {
      id: 'power-slider',
      type: 'slider',
      x: 50,
      y: 1360,
      width: 250,
      height: 300,
      props: {
        title: 'POWER',
        min: 0,
        max: 100,
        value: 65,
        step: 5
      }
    },
    {
      id: 'flow-slider',
      type: 'slider',
      x: 350,
      y: 1360,
      width: 250,
      height: 300,
      props: {
        title: 'FLOW RATE',
        min: 0,
        max: 100,
        value: 50,
        step: 5
      }
    },
    {
      id: 'pressure-slider',
      type: 'slider',
      x: 650,
      y: 1360,
      width: 250,
      height: 300,
      props: {
        title: 'PRESSURE',
        min: 0,
        max: 100,
        value: 70,
        step: 5
      }
    }
  ];
  
  // Define connections between components
  const connections: Connection[] = [
    // Generator to Battery (Akku) connections
    {
      from: 'generator1',
      to: 'battery1',
      type: 'power',
      status: 'active'
    },
    {
      from: 'generator2',
      to: 'battery2',
      type: 'power',
      status: 'active'
    },
    {
      from: 'generator3',
      to: 'battery3',
      type: 'power',
      status: 'inactive'
    },
    
    // Battery (Akku) to Gauge (aggregator) connections
    {
      from: 'battery1',
      to: 'pressure-gauge',
      type: 'data',
      status: 'active'
    },
    {
      from: 'battery2',
      to: 'temperature-gauge',
      type: 'data',
      status: 'active'
    },
    {
      from: 'battery3',
      to: 'flow-gauge',
      type: 'data',
      status: 'inactive'
    },
    
    // Gauge (aggregator) to Slider (Producer) connections
    {
      from: 'pressure-gauge',
      to: 'power-slider',
      type: 'control',
      status: 'active'
    },
    {
      from: 'temperature-gauge',
      to: 'flow-slider',
      type: 'control',
      status: 'active'
    },
    {
      from: 'flow-gauge',
      to: 'pressure-slider',
      type: 'control',
      status: 'inactive'
    }
  ];
  
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
  
  // Handle generator toggle
  const handleGeneratorToggle = (generatorId: string) => {
    const backendKey = `generator${generatorId}.active`;
    const currentValue = backendData?.[backendKey];
    
    if (currentValue !== undefined) {
      onUpdateBackend(backendKey, !currentValue);
    }
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
    
    if (currentValue !== undefined) {
      onUpdateBackend(backendKey, !currentValue);
    }
  };
  
  // Handle producer consumption change
  const handleProducerConsumptionChange = (value: number) => {
    // Convert percentage (0-100) to consumption value (1-10)
    const backendValue = Math.max(1, Math.min(10, Math.round((value / 100) * 10)));
    onUpdateBackend('producer.consumption', backendValue);
  };
  
  // Handle aggregator toggle
  const handleAggregatorToggle = () => {
    const currentValue = backendData?.['aggregator.active'];
    
    if (currentValue !== undefined) {
      onUpdateBackend('aggregator.active', !currentValue);
    }
  };
  
  // Handle producer toggle
  const handleProducerToggle = () => {
    const currentValue = backendData?.['producer.active'];
    
    if (currentValue !== undefined) {
      onUpdateBackend('producer.active', !currentValue);
    }
  };
  
  // Handle gauge toggle
  const handleGaugeToggle = (gaugeId: string) => {
    const backendKey = `${gaugeId}.active`;
    const currentValue = backendData?.[backendKey];
    
    if (currentValue !== undefined) {
      onUpdateBackend(backendKey, !currentValue);
    }
  };
  
  // Handle slider toggle
  const handleSliderToggle = (sliderId: string) => {
    const backendKey = `${sliderId}.active`;
    const currentValue = backendData?.[backendKey];
    
    if (currentValue !== undefined) {
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
              onToggle={() => handleGeneratorToggle(props.id)}
              onPowerChange={(value) => handleGeneratorPowerChange(props.id, value)}
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
      default:
        return null;
    }
  };
  
  // Update component values based on systemData if available
  useEffect(() => {
    if (systemData) {
      // Update battery components
      const updatedComponents = [...components];
      
      systemData.components.batteries.forEach(battery => {
        const batteryComponent = updatedComponents.find(c => c.id === `battery${battery.id}`);
        if (batteryComponent) {
          batteryComponent.props.isActive = battery.status === 'active';
          batteryComponent.props.powerLevel = battery.powerLevel;
        }
      });
      
      systemData.components.generators.forEach(generator => {
        const generatorComponent = updatedComponents.find(c => c.id === `generator${generator.id}`);
        if (generatorComponent) {
          generatorComponent.props.isActive = generator.status === 'active';
          generatorComponent.props.powerLevel = generator.powerLevel;
        }
      });
      
      // Update gauge components
      const pressureGauge = updatedComponents.find(c => c.id === 'pressure-gauge');
      if (pressureGauge) {
        pressureGauge.props.value = systemData.components.sensors.pressure;
      }
      
      const temperatureGauge = updatedComponents.find(c => c.id === 'temperature-gauge');
      if (temperatureGauge) {
        temperatureGauge.props.value = systemData.components.sensors.temperature;
      }
      
      const flowGauge = updatedComponents.find(c => c.id === 'flow-gauge');
      if (flowGauge) {
        flowGauge.props.value = systemData.components.sensors.flowRate;
      }
    }
  }, [systemData]);
  
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
      
      {/* System status indicators */}
      <div className="status-indicator">
        <div className="indicator">
          <div 
            className={`indicator-led ${systemStatus.toLowerCase()}`}
            onClick={() => onUpdateBackend('system.debug', true)}
            style={{ cursor: 'pointer' }}
          ></div>
          <div className="indicator-label">SYSTEM</div>
        </div>
        <div className="indicator">
          <div className="indicator-led active"></div>
          <div className="indicator-label">POWER</div>
        </div>
        <div className="indicator">
          <div className="indicator-led active"></div>
          <div className="indicator-label">NETWORK</div>
        </div>
      </div>
      
      {/* System metrics */}
      <div className="system-status">
        <div>
          <div className="system-status-label">SYSTEM LOAD</div>
          <div className={`system-status-value ${systemStatus.toLowerCase()}`}>{Math.round(systemLoad)}%</div>
        </div>
        <div>
          <div className="system-status-label">POWER OUTPUT</div>
          <div className="system-status-value">{powerOutput.toFixed(1)} kW</div>
        </div>
        <div>
          <div className="system-status-label">EFFICIENCY</div>
          <div className="system-status-value">{Math.round(efficiency)}%</div>
        </div>
      </div>
      
      <div className="component-container">
        {/* Render all components */}
        {components.map(renderComponent)}
        
        {/* Render connections between components */}
        {renderConnections()}
      </div>
    </div>
  );
};

export default ControlPanel;
