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
  demandMultipliers: { // % chance of drug being requested (0-1)
    [drugId: string]: number;
  };
  priceMarkup: { // % increase in base price (1 = no markup, 2 = double price)
    [drugId: string]: number;
  };
  policeHeat: number; // 0-100
}

export const LOCATIONS: Location[] = [
  {
    id: 'downtown',
    name: 'Downtown',
    description: 'The business and entertainment hub. High-end clientele, lots of police patrols.',
    demandMultipliers: {
      weed: 0.3,     // Low demand
      cocaine: 0.8,  // High demand
      heroin: 0.4,   // Medium demand
      meth: 0.2,     // Low demand
      ecstasy: 0.7   // High demand
    },
    priceMarkup: {
      weed: 1.2,     // 20% markup
      cocaine: 2.0,   // 100% markup
      heroin: 1.8,    // 80% markup
      meth: 1.5,      // 50% markup
      ecstasy: 2.0    // 100% markup
    },
    policeHeat: 80,
  },
  {
    id: 'slums',
    name: 'Slums',
    description: 'Poorer area with high demand for cheap drugs, low police presence.',
    demandMultipliers: {
      weed: 0.6,     // Medium demand
      cocaine: 0.3,   // Low demand
      heroin: 0.8,    // High demand
      meth: 0.9,      // Very high demand
      ecstasy: 0.2    // Low demand
    },
    priceMarkup: {
      weed: 0.8,      // 20% discount
      cocaine: 0.7,    // 30% discount
      heroin: 0.9,     // 10% discount
      meth: 1.0,       // Normal price
      ecstasy: 0.6     // 40% discount
    },
    policeHeat: 30,
  },
  {
    id: 'suburbs',
    name: 'Suburbs',
    description: 'Middle-class families, moderate police presence.',
    demandMultipliers: {
      weed: 0.5,     // Medium demand
      cocaine: 0.4,   // Medium-low demand
      heroin: 0.2,    // Low demand
      meth: 0.3,      // Low demand
      ecstasy: 0.4    // Medium-low demand
    },
    priceMarkup: {
      weed: 1.3,      // 30% markup
      cocaine: 1.5,    // 50% markup
      heroin: 1.4,     // 40% markup
      meth: 1.3,       // 30% markup
      ecstasy: 1.4     // 40% markup
    },
    policeHeat: 50,
  },
  {
    id: 'university',
    name: 'University',
    description: 'Young crowd, high demand for party drugs, some police patrols.',
    demandMultipliers: {
      weed: 0.8,     // High demand
      cocaine: 0.6,   // Medium demand
      heroin: 0.2,    // Low demand
      meth: 0.4,      // Medium-low demand
      ecstasy: 0.9    // Very high demand
    },
    priceMarkup: {
      weed: 1.4,      // 40% markup
      cocaine: 1.6,    // 60% markup
      heroin: 1.2,     // 20% markup
      meth: 1.3,       // 30% markup
      ecstasy: 1.8     // 80% markup
    },
    policeHeat: 60,
  },
  {
    id: 'industrial',
    name: 'Industrial District',
    description: 'Factories and warehouses. Few police, but low demand.',
    demandMultipliers: {
      weed: 0.4,     // Medium-low demand
      cocaine: 0.3,   // Low demand
      heroin: 0.5,    // Medium demand
      meth: 0.7,      // High demand
      ecstasy: 0.3    // Low demand
    },
    priceMarkup: {
      weed: 0.9,      // 10% discount
      cocaine: 0.8,    // 20% discount
      heroin: 1.0,     // Normal price
      meth: 1.2,       // 20% markup
      ecstasy: 0.8     // 20% discount
    },
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
