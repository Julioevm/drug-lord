// Core interfaces for Drug Wars game

export interface Drug {
  id: string;
  name: string;
  basePrice: number;
  price: number; // Current fluctuating price
  quantity: number;
  amount?: number; // UI only: selected buy amount
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  demandMultipliers: {
    [drugType: string]: number;
  };
  policeHeat: number; // 0-100
}

export const LOCATIONS: Location[] = [
  {
    id: 'downtown',
    name: 'Downtown',
    description: 'The business and entertainment hub. High-end clientele, lots of police patrols.',
    demandMultipliers: { quality: 1.5, cheap: 0.5 },
    policeHeat: 80,
  },
  {
    id: 'slums',
    name: 'Slums',
    description: 'Poorer area with high demand for cheap drugs, low police presence.',
    demandMultipliers: { quality: 0.5, cheap: 1.5 },
    policeHeat: 30,
  },
  {
    id: 'suburbs',
    name: 'Suburbs',
    description: 'Middle-class families, moderate police presence.',
    demandMultipliers: { quality: 1.0, cheap: 1.0 },
    policeHeat: 50,
  },
  {
    id: 'university',
    name: 'University',
    description: 'Young crowd, high demand for party drugs, some police patrols.',
    demandMultipliers: { quality: 1.2, cheap: 1.1 },
    policeHeat: 60,
  },
  {
    id: 'industrial',
    name: 'Industrial District',
    description: 'Factories and warehouses. Few police, but low demand.',
    demandMultipliers: { quality: 0.7, cheap: 0.8 },
    policeHeat: 20,
  }
];

export interface Player {
  inventory: { [drugId: string]: number };
  cleanMoney: number;
  dirtyMoney: number;
  upgrades: string[];
  location: string;
  maxInventory: number;
  timeUnits: number;
  notoriety: number;
  inventoryLimit: number; // For upgradeable inventory
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  effect: string;
}

export interface GameState {
  player: Player;
  day: number;
  drugs: Drug[];
  upgrades: Upgrade[];
  locations: Location[];
  events: GameEvent[];
}
