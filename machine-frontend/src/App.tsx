import { useState, useEffect } from 'react';
import './components/App.css';
import ControlPanel from './components/ControlPanel';

// Define types for the system data
interface Battery {
  id: number;
  charge: number;
  isActive: boolean;
}

interface Generator {
  id: number;
  output: number;
  isActive: boolean;
}

interface Metrics {
  systemLoad: number;
  powerOutput: number;
  efficiency: number;
  pressure: number;
  temperature: number;
  flowRate: number;
}

interface SystemData {
  status: string;
  batteries: Battery[];
  generators: Generator[];
  metrics: Metrics;
}

function App() {
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Attempt to fetch data from the API
        const response = await fetch('http://localhost:8000/api/status', {
          signal: AbortSignal.timeout(3000), // Timeout after 3 seconds
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch system data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setSystemData(data);
        setLoading(false);
        setError(null);
        setConnectionAttempts(0); // Reset connection attempts on success
      } catch (err: any) {
        // Handle connection errors gracefully
        console.error('Error fetching data:', err);
        
        // If we've tried to connect multiple times, show a more detailed error
        if (connectionAttempts > 3) {
          setError('Error connecting to machine simulator. Please ensure it is running.');
        } else {
          setError('Connecting to machine simulator...');
          setConnectionAttempts(prev => prev + 1);
        }
        
        // Even if there's an error, we're no longer in the initial loading state
        setLoading(false);
        
        // Use mock data for UI development when backend is not available
        const mockData: SystemData = {
          status: 'SIMULATED',
          batteries: [
            { id: 1, charge: 87, isActive: true },
            { id: 2, charge: 65, isActive: true },
            { id: 3, charge: 30, isActive: false }
          ],
          generators: [
            { id: 1, output: 75, isActive: true },
            { id: 2, output: 65, isActive: true },
            { id: 3, output: 0, isActive: false }
          ],
          metrics: {
            systemLoad: 78,
            powerOutput: 1.2,
            efficiency: 85,
            pressure: 75,
            temperature: 65,
            flowRate: 42
          }
        };
        
        setSystemData(mockData);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling interval - less frequent if we're having connection issues
    const intervalId = setInterval(fetchData, connectionAttempts > 3 ? 5000 : 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [connectionAttempts]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>INFINITE MACHINE</h1>
        <div className="system-info">
          {loading ? (
            <span className="status-loading">Connecting to system...</span>
          ) : error ? (
            <div className="status-error">
              <span className="error-indicator"></span>
              {error}
            </div>
          ) : (
            <div className="status-connected">
              <span className="connected-indicator"></span>
              System Connected
            </div>
          )}
        </div>
      </header>

      <main className="app-content">
        <ControlPanel systemData={systemData} />
      </main>

      <footer className="app-footer">
        <p>INFINITE MACHINE CONTROL SYSTEM v1.0</p>
        <p>© 2025 Industrial Control Systems</p>
      </footer>
    </div>
  );
}

export default App;
