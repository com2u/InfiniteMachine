# Infinite Machine

A simulator for machine operations with a modern frontend interface.

![Infinite Machine Screenshot](machine-frontend/public/InfiniteMachine.jpg)

## Project Structure

This project consists of:
- Python-based machine simulator (`machine_simulator.py`)
- React/TypeScript frontend application (`machine-frontend/`)
- Machine configuration file (`machine1.json`)

## Architecture

- All components and variables are derived from the `machine1.json` configuration file
- The backend handles the logic for the machine, including state management and calculations
- The frontend provides a visual representation of the machine state and allows for user interaction

## Features

- Interactive machine simulation
- Real-time visualization of machine states
- Capacity and gauge displays
- LED indicators and seven-segment displays
- Plotting capabilities
- Dynamic component rendering based on configuration

## Installation

### Backend

```bash
# Install Python dependencies
pip install -r requirements.txt
```

### Frontend

```bash
# Navigate to frontend directory
cd machine-frontend

# Install dependencies
npm install
```

## Usage

### Running the Simulator

```bash
python machine_simulator.py
```

### Starting the Frontend

```bash
cd machine-frontend
npm run dev
```

## Development

The frontend is built with:
- React
- TypeScript
- Vite
- Tailwind CSS

## License

[MIT](LICENSE)
