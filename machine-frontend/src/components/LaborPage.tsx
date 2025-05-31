import React, { useEffect, useState } from 'react';
import ChemicalIngredient from './ChemicalIngredient';
import MixerControl from './MixerControl';
import SystemDisplay from './SystemDisplay';
import './LaborPage.css';

// Define the type for backend API data
interface BackendData {
  [key: string]: any;
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

interface LaborStructureData {
  components: MachineComponent[];
  connections: MachineConnection[];
}

function LaborPage() {
  const [backendData, setBackendData] = useState<BackendData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [components, setComponents] = useState<ComponentPosition[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [systemStatus, setSystemStatus] = useState('OPERATIONAL');
  
  // Function to update a backend variable
  const updateBackendVariable = async (key: string, value: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update ${key}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Update successful:', result);
      
      // Refresh data immediately after update
      fetchBackendData();
      
      return result;
    } catch (err) {
      console.error('Error updating variable:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };
  
  // Fetch data from the backend API
  const fetchBackendData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/status');
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      setBackendData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };
  
  // Fetch labor structure from labor.json file
  useEffect(() => {
    const fetchLaborStructure = async () => {
      try {
        const response = await fetch('/labor.json');
        
        if (!response.ok) {
          throw new Error(`Failed to load labor.json: ${response.statusText}`);
        }
        
        const data = await response.json() as LaborStructureData;
        
        // Create components from labor structure
        const newComponents: ComponentPosition[] = data.components.map((component) => {
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
          
          return {
            id: component.id,
            type: component.type,
            x: component.position?.x || 0,
            y: component.position?.y || 0,
            width: component.position?.width || 250,
            height: component.position?.height || 300,
            props
          };
        });
        
        setComponents(newComponents);
        
        // Create connections from labor structure
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
        console.error('Error fetching labor structure:', err);
        setError(err instanceof Error ? err.message : 'Failed to load labor configuration');
      }
    };
    
    fetchLaborStructure();
  }, []);
  
  // Update component values from backend data
  useEffect(() => {
    if (backendData && components.length > 0) {
      const updatedComponents = [...components];
      
      updatedComponents.forEach(component => {
        // Update component props based on backend data
        if (component.type === 'chemical') {
          component.props.isActive = backendData[`${component.id}.active`] || false;
          component.props.fillLevel = backendData[`${component.id}.value`] || 0;
          component.props.purity = backendData[`${component.id}.purity`] || 0;
          component.props.outputLevel = backendData[`${component.id}.output`] || 0;
        }
        else if (component.type === 'mixer') {
          component.props.isActive = backendData[`${component.id}.active`] || false;
          component.props.chem1Amount = backendData[`chemical1.output`] || 0;
          component.props.chem2Amount = backendData[`chemical2.output`] || 0;
          component.props.chem3Amount = backendData[`chemical3.output`] || 0;
          component.props.maxThroughput = backendData[`${component.id}.max_throughput`] || 0;
          component.props.mixtureQuality = backendData[`${component.id}.mixture_quality`] || 0;
        }
        else if (component.type === 'system') {
          component.props.isActive = backendData[`${component.id}.active`] || false;
          component.props.status = backendData[`${component.id}.status`] || 'OPERATIONAL';
        }
      });
      
      setComponents(updatedComponents);
      
      // Update connection status based on component active state
      const updatedConnections = [...connections];
      updatedConnections.forEach(connection => {
        const fromComponent = components.find(c => c.id === connection.from);
        const toComponent = components.find(c => c.id === connection.to);
        
        if (fromComponent && toComponent) {
          const fromIsActive = backendData[`${fromComponent.id}.active`] !== false;
          const toIsActive = backendData[`${toComponent.id}.active`] !== false;
          
          if (fromIsActive && toIsActive) {
            connection.status = 'active';
          } else if (fromIsActive || toIsActive) {
            connection.status = 'warning';
          } else {
            connection.status = 'inactive';
          }
        }
      });
      
      setConnections(updatedConnections);
      
      // Determine system status based on backend data
      const chemicalsActive = 
        backendData['chemical1.active'] || 
        backendData['chemical2.active'] || 
        backendData['chemical3.active'];
      
      const mixerActive = backendData['mixer.active'];
      
      if (!chemicalsActive) {
        setSystemStatus('CRITICAL');
      } else if (!mixerActive) {
        setSystemStatus('WARNING');
      } else {
        setSystemStatus('OPERATIONAL');
      }
    }
  }, [backendData, components.length]);
  
  // Fetch data on component mount and set up interval for periodic updates
  useEffect(() => {
    // Initial fetch
    fetchBackendData();
    
    // Set up interval for periodic updates
    const interval = setInterval(fetchBackendData, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle chemical toggle
  const handleChemicalToggle = (chemicalId: string) => {
    const backendKey = `${chemicalId}.active`;
    const currentValue = backendData?.[backendKey];
    
    if (currentValue !== undefined) {
      updateBackendVariable(backendKey, !currentValue);
    }
  };
  
  // Handle chemical fill level change
  const handleChemicalFillLevelChange = (chemicalId: string, value: number) => {
    const backendKey = `${chemicalId}.value`;
    updateBackendVariable(backendKey, value);
  };
  
  // Handle chemical output level change
  const handleChemicalOutputChange = (chemicalId: string, value: number) => {
    const backendKey = `${chemicalId}.output`;
    updateBackendVariable(backendKey, value);
  };
  
  // Handle mixer toggle
  const handleMixerToggle = () => {
    const backendKey = 'mixer.active';
    const currentValue = backendData?.[backendKey];
    
    if (currentValue !== undefined) {
      updateBackendVariable(backendKey, !currentValue);
    }
  };
  
  // Handle system toggle
  const handleSystemToggle = () => {
    const backendKey = 'system.active';
    const currentValue = backendData?.[backendKey];
    
    if (currentValue !== undefined) {
      updateBackendVariable(backendKey, !currentValue);
    }
  };
  
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
              onToggle={() => handleChemicalToggle(id)}
              onFillLevelChange={(value: number) => handleChemicalFillLevelChange(id, value)}
              onOutputChange={(value: number) => handleChemicalOutputChange(id, value)}
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
              onToggle={handleSystemToggle}
              onDebug={() => updateBackendVariable('system.debug', true)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Calculate the minimum height needed for all components
  const minHeight = Math.max(...components.map(c => c.y + c.height)) + 100;

  if (components.length === 0) {
    return (
      <div className="labor-page">
        <div className="loading">Loading laboratory configuration...</div>
      </div>
    );
  }

  return (
    <div className="labor-page">
      <div className="labor-background"></div>
      <div className="labor-container" style={{ minHeight: `${minHeight}px`, position: 'relative' }}>
        <div className="labor-header">
          <h1>LABORATORY CONTROL SYSTEM</h1>
          <div className="system-status">
            <span className={`status-indicator ${systemStatus.toLowerCase()}`}>
              {systemStatus}
            </span>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}
        
        {/* Render all components */}
        {components.map(renderComponent)}
        
        {/* Render connections between components */}
        {renderConnections()}
        
        <div className="navigation">
          <a href="/" className="nav-link">← Back to Main System</a>
        </div>
      </div>
    </div>
  );
}

export default LaborPage;
