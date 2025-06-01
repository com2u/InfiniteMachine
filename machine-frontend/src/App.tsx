import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ControlPanel from './components/ControlPanel';
import LaborPage from './components/LaborPage';
import './App.css';

// Define the type for our system data
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

function App() {
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [backendData, setBackendData] = useState<BackendData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
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
      
      // Only update if data has actually changed
      setBackendData(prevData => {
        if (!prevData || JSON.stringify(prevData) !== JSON.stringify(data)) {
          return data;
        }
        return prevData;
      });
      
      // Transform backend data to match SystemData interface
      const transformedData: SystemData = {
        timestamp: systemData?.timestamp || new Date().toISOString(), // Keep existing timestamp to prevent unnecessary updates
        systemStatus: determineSystemStatus(data),
        components: {
          batteries: [
            { 
              id: 1, 
              status: data['akku1.active'] ? 'active' : 'inactive', 
              powerLevel: calculatePowerLevel(data['akku1.value'], data['akku1.capacity'])
            },
            { 
              id: 2, 
              status: data['akku2.active'] ? 'active' : 'inactive', 
              powerLevel: calculatePowerLevel(data['akku2.value'], data['akku2.capacity'])
            },
            { 
              id: 3, 
              status: data['akku3.active'] ? 'active' : 'inactive', 
              powerLevel: calculatePowerLevel(data['akku3.value'], data['akku3.capacity'])
            }
          ],
          generators: [
            { 
              id: 1, 
              status: data['generator1.active'] ? 'active' : 'inactive', 
              powerLevel: calculateGeneratorPowerLevel(data['generator1.value'])
            },
            { 
              id: 2, 
              status: data['generator2.active'] ? 'active' : 'inactive', 
              powerLevel: calculateGeneratorPowerLevel(data['generator2.value'])
            },
            { 
              id: 3, 
              status: data['generator3.active'] ? 'active' : 'inactive', 
              powerLevel: calculateGeneratorPowerLevel(data['generator3.value'])
            }
          ],
          chemicals: [
            {
              id: 1,
              status: data['chemical1.active'] ? 'active' : 'inactive',
              fillLevel: data['chemical1.value'],
              purity: data['chemical1.purity'],
              outputLevel: data['chemical1.output'] || 50
            },
            {
              id: 2,
              status: data['chemical2.active'] ? 'active' : 'inactive',
              fillLevel: data['chemical2.value'],
              purity: data['chemical2.purity'],
              outputLevel: data['chemical2.output'] || 50
            },
            {
              id: 3,
              status: data['chemical3.active'] ? 'active' : 'inactive',
              fillLevel: data['chemical3.value'],
              purity: data['chemical3.purity'],
              outputLevel: data['chemical3.output'] || 50
            }
          ],
          mixer: {
            active: data['mixer.active'],
            chem1Amount: data['chemical1.output'] || 50,
            chem2Amount: data['chemical2.output'] || 50,
            chem3Amount: data['chemical3.output'] || 50,
            maxThroughput: data['mixer.max_throughput'] || 200,
            mixtureQuality: data['mixer.mixture_quality']
          },
          sensors: {
            pressure: 75, // These could be mapped to actual backend values if available
            temperature: Math.round(data['room.temp']),
            flowRate: 42
          }
        }
      };
      
      // Only update systemData if it has actually changed
      setSystemData(prevSystemData => {
        if (!prevSystemData || JSON.stringify(prevSystemData) !== JSON.stringify(transformedData)) {
          return transformedData;
        }
        return prevSystemData;
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };
  
  // Helper function to determine system status based on backend data
  const determineSystemStatus = (data: BackendData): string => {
    // Example logic - could be adjusted based on actual backend data
    const generatorsActive = 
      data['generator1.active'] || 
      data['generator2.active'] || 
      data['generator3.active'];
    
    const akkusActive = 
      data['akku1.active'] || 
      data['akku2.active'] || 
      data['akku3.active'];
    
    if (!generatorsActive) {
      return 'critical';
    } else if (!akkusActive) {
      return 'warning';
    } else {
      return 'operational';
    }
  };
  
  // Helper function to calculate battery power level as percentage
  const calculatePowerLevel = (value: number, capacity: number): number => {
    if (!capacity) return 0;
    return Math.round((value / capacity) * 100);
  };
  
  // Helper function to convert generator value (0-10) to percentage (0-100)
  const calculateGeneratorPowerLevel = (value: number): number => {
    return Math.round((value / 10) * 100);
  };
  
  // Fetch data on component mount and set up interval for periodic updates
  useEffect(() => {
    // Initial fetch
    fetchBackendData();
    
    // Set up interval for frequent value updates (every 1 second)
    const interval = setInterval(fetchBackendData, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const MainPage = () => (
    <div className="app">
      <div className="app-background"></div>
      <div className="app-container">
        <div className="navigation-header">
          <Link to="/labor" className="nav-button">
            🧪 Laboratory System
          </Link>
        </div>
        {error && (
          <div className="error-message">
            Error connecting to backend: {error}
          </div>
        )}
        <ControlPanel 
          systemData={systemData} 
          backendData={backendData}
          onUpdateBackend={updateBackendVariable}
        />
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/labor" element={<LaborPage />} />
      </Routes>
    </Router>
  );
}

export default App;
