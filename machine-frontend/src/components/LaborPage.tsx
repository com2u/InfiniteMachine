import React, { useEffect, useState } from 'react';
import ComponentRenderer from './ComponentRenderer';
import './LaborPage.css';
import type { Component, MachineVariables } from '../types/MachineTypes';

interface LaborStructureData {
  components: Component[];
  connections: Array<{
    from: string;
    to: string;
    type: string;
  }>;
}

function LaborPage() {
  const [backendData, setBackendData] = useState<MachineVariables>({});
  const [error, setError] = useState<string | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  
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
        setComponents(data.components);
      } catch (err) {
        console.error('Error fetching labor structure:', err);
        setError(err instanceof Error ? err.message : 'Failed to load labor configuration');
      }
    };
    
    fetchLaborStructure();
  }, []);
  
  // Fetch data on component mount and set up interval for periodic updates
  useEffect(() => {
    // Initial fetch
    fetchBackendData();
    
    // Set up interval for periodic updates
    const interval = setInterval(fetchBackendData, 1000);
    
    return () => clearInterval(interval);
  }, []);

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
      <div className="labor-container">
        <div className="labor-header">
          <h1>LABORATORY CONTROL SYSTEM</h1>
          <div className="system-status">
            <span className={`status-indicator ${backendData['system.status']?.toString().toLowerCase() || 'operational'}`}>
              {backendData['system.status'] || 'OPERATIONAL'}
            </span>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}
        
        {/* Render all components using ComponentRenderer */}
        <div className="components-grid">
          {components.map((component) => (
            <div 
              key={component.id} 
              className="component-container"
              style={{
                position: 'absolute',
                left: `${component.position?.x || 0}px`,
                top: `${component.position?.y || 0}px`,
                width: `${component.position?.width || 250}px`,
                height: `${component.position?.height || 300}px`
              }}
            >
              <ComponentRenderer
                component={component}
                machineState={backendData}
                updateVariable={updateBackendVariable}
              />
            </div>
          ))}
        </div>
        
        <div className="navigation">
          <a href="/" className="nav-link">← Back to Main System</a>
        </div>
      </div>
    </div>
  );
}

export default LaborPage;
