import React, { useEffect, useState } from 'react';
import BatteryDisplay from './BatteryDisplay';
import GeneratorDisplay from './GeneratorDisplay';
import GaugeDisplay from './GaugeDisplay';
import SliderControl from './SliderControl';
import './ControlPanel.css';

interface ControlPanelProps {
  systemData: any | null; // Add systemData prop to match App.tsx
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

const ControlPanel: React.FC<ControlPanelProps> = ({ systemData }) => {
  const [systemStatus, setSystemStatus] = useState('OPERATIONAL');
  const [systemLoad, setSystemLoad] = useState(78);
  const [powerOutput, setPowerOutput] = useState(1.2);
  const [efficiency, setEfficiency] = useState(85);
  
  // Define fixed positions for components with improved alignment
  const components: ComponentPosition[] = [
    // Row 1: Batteries
    {
      id: 'battery1',
      type: 'battery',
      x: 50,
      y: 150,
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
      id: 'battery3',
      type: 'battery',
      x: 650,
      y: 150,
      width: 250,
      height: 380,
      props: {
        isActive: false,
        id: "3",
        powerLevel: 30
      }
    },
    
    // Row 2: Generators
    {
      id: 'generator1',
      type: 'generator',
      x: 50,
      y: 580,
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
      id: 'generator3',
      type: 'generator',
      x: 650,
      y: 580,
      width: 250,
      height: 380,
      props: {
        isActive: false,
        id: "3",
        powerLevel: 0
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
    // Battery to Generator connections
    {
      from: 'battery1',
      to: 'generator1',
      type: 'power',
      status: 'active'
    },
    {
      from: 'battery2',
      to: 'generator2',
      type: 'power',
      status: 'active'
    },
    {
      from: 'battery3',
      to: 'generator3',
      type: 'power',
      status: 'inactive'
    },
    
    // Generator to Gauge connections
    {
      from: 'generator1',
      to: 'pressure-gauge',
      type: 'data',
      status: 'active'
    },
    {
      from: 'generator2',
      to: 'temperature-gauge',
      type: 'data',
      status: 'active'
    },
    {
      from: 'generator3',
      to: 'flow-gauge',
      type: 'data',
      status: 'inactive'
    },
    
    // Slider to Generator connections
    {
      from: 'power-slider',
      to: 'generator1',
      type: 'control',
      status: 'active'
    },
    {
      from: 'flow-slider',
      to: 'generator2',
      type: 'control',
      status: 'active'
    },
    {
      from: 'pressure-slider',
      to: 'generator3',
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
      
      // Determine if connection is horizontal or vertical
      const isHorizontal = Math.abs(toX - fromX) > Math.abs(toY - fromY);
      
      if (isHorizontal) {
        // Horizontal connection with vertical segments
        const midX = (fromX + toX) / 2;
        
        return (
          <React.Fragment key={`connection-${index}`}>
            {/* Horizontal line from source */}
            <div 
              className={`connection-line horizontal ${connection.status}`}
              style={{
                left: fromX,
                top: fromY,
                width: Math.abs(midX - fromX),
                transform: fromX > midX ? 'translateX(-100%)' : 'none'
              }}
            ></div>
            
            {/* Vertical line */}
            <div 
              className={`connection-line vertical ${connection.status}`}
              style={{
                left: midX,
                top: Math.min(fromY, toY),
                height: Math.abs(toY - fromY)
              }}
            ></div>
            
            {/* Horizontal line to target */}
            <div 
              className={`connection-line horizontal ${connection.status}`}
              style={{
                left: Math.min(midX, toX),
                top: toY,
                width: Math.abs(toX - midX)
              }}
            ></div>
            
            {/* Connection nodes */}
            <div 
              className={`connection-node ${connection.status}`}
              style={{ left: fromX, top: fromY }}
            ></div>
            <div 
              className={`connection-node ${connection.status}`}
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
              className={`connection-line vertical ${connection.status}`}
              style={{
                left: fromX,
                top: Math.min(fromY, midY),
                height: Math.abs(midY - fromY)
              }}
            ></div>
            
            {/* Horizontal line */}
            <div 
              className={`connection-line horizontal ${connection.status}`}
              style={{
                left: Math.min(fromX, toX),
                top: midY,
                width: Math.abs(toX - fromX)
              }}
            ></div>
            
            {/* Vertical line to target */}
            <div 
              className={`connection-line vertical ${connection.status}`}
              style={{
                left: toX,
                top: Math.min(midY, toY),
                height: Math.abs(toY - midY)
              }}
            ></div>
            
            {/* Connection nodes */}
            <div 
              className={`connection-node ${connection.status}`}
              style={{ left: fromX, top: fromY }}
            ></div>
            <div 
              className={`connection-node ${connection.status}`}
              style={{ left: toX, top: toY }}
            ></div>
          </React.Fragment>
        );
      }
    });
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
            <BatteryDisplay {...props} width={width} height={height} />
          </div>
        );
      case 'generator':
        return (
          <div key={id} className="fixed-component" style={style}>
            <GeneratorDisplay {...props} width={width} height={height} />
          </div>
        );
      case 'gauge':
        return (
          <div key={id} className="fixed-component" style={style}>
            <GaugeDisplay {...props} width={width} height={height} />
          </div>
        );
      case 'slider':
        return (
          <div key={id} className="fixed-component" style={style}>
            <SliderControl {...props} width={width} height={height} />
          </div>
        );
      default:
        return null;
    }
  };
  
  // Update component values based on systemData if available
  useEffect(() => {
    if (systemData) {
      // Here you would update component values based on systemData
      // For now, we'll just use the simulated values
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
  const minHeight = Math.max(...components.map(c => c.y + c.height)) + 50;

  return (
    <div className="control-panel" style={{ minHeight: `${minHeight}px` }}>
      <div className="panel-screw-top-left"></div>
      <div className="panel-screw-top-right"></div>
      <div className="panel-screw-bottom-left"></div>
      <div className="panel-screw-bottom-right"></div>
      
      <h1 className="control-panel-title">INFINITE MACHINE CONTROL SYSTEM</h1>
      
      {/* System status indicators */}
      <div className="status-indicator">
        <div className="indicator">
          <div className={`indicator-led ${systemStatus.toLowerCase()}`}></div>
          <div className="indicator-label">System</div>
        </div>
        <div className="indicator">
          <div className="indicator-led active"></div>
          <div className="indicator-label">Power</div>
        </div>
        <div className="indicator">
          <div className="indicator-led active"></div>
          <div className="indicator-label">Network</div>
        </div>
      </div>
      
      {/* System metrics */}
      <div className="system-status">
        <div>
          <div className="system-status-label">System Load</div>
          <div className={`system-status-value ${systemStatus.toLowerCase()}`}>{Math.round(systemLoad)}%</div>
        </div>
        <div>
          <div className="system-status-label">Power Output</div>
          <div className="system-status-value">{powerOutput.toFixed(1)} kW</div>
        </div>
        <div>
          <div className="system-status-label">Efficiency</div>
          <div className="system-status-value">{Math.round(efficiency)}%</div>
        </div>
      </div>
      
      {/* Render all components */}
      {components.map(renderComponent)}
      
      {/* Render connections between components */}
      {renderConnections()}
    </div>
  );
};

export default ControlPanel;
