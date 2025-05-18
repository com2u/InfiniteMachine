export interface Property {
  key: string;
  type: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  units?: string;
  digits?: number;
  max_key?: string;
  controllable: boolean;
}

export interface Visualization {
  type: string;
  width?: number;
  height?: number;
  description?: string;
  source_key?: string;
  label?: string;
  thresholds?: Array<{
    max?: number;
    label: string;
  }>;
}

export interface Layout {
  colspan?: number;
}

export interface Component {
  id: string;
  type: string;
  name: string;
  description: string;
  properties: Property[];
  visualization: Visualization;
  layout?: Layout;
  category?: string;
}

export interface Connection {
  from: string;
  to: string;
  type: string;
}

export interface GridColumns {
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface GridLayout {
  columns: GridColumns;
}

export interface MachineLayout {
  grid: GridLayout;
}

export interface MachineStructure {
  components: Component[];
  layout: MachineLayout;
  connections: Connection[];
}

export interface MachineVariables {
  [key: string]: number | boolean;
}
