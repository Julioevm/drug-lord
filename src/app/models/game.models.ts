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
}

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
