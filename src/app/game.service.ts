import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameState, Player, Drug, Upgrade, Location, GameEvent } from './models/game.models';

const INITIAL_DRUGS: Drug[] = [
  { id: 'weed', name: 'Weed', basePrice: 100, price: 100, quantity: 0 },
  { id: 'coke', name: 'Cocaine', basePrice: 1000, price: 1000, quantity: 0 },
  { id: 'heroin', name: 'Heroin', basePrice: 800, price: 800, quantity: 0 },
  { id: 'acid', name: 'Acid', basePrice: 300, price: 300, quantity: 0 }
];

const INITIAL_UPGRADES: Upgrade[] = [
  { id: 'backpack', name: 'Backpack', description: 'Increase inventory by 10', cost: 500, effect: 'inventory+10' }
];

const INITIAL_LOCATIONS: Location[] = [
  { id: 'downtown', name: 'Downtown', description: 'Busy city center' },
  { id: 'suburbs', name: 'Suburbs', description: 'Quieter area' },
  { id: 'docks', name: 'Docks', description: 'Shady deals happen here' }
];

const INITIAL_PLAYER: Player = {
  inventory: { weed: 0, coke: 0, heroin: 0, acid: 0 },
  cleanMoney: 500,
  dirtyMoney: 0,
  upgrades: [],
  location: 'downtown',
  maxInventory: 20,
  inventoryLimit: 20,
  notoriety: 0,
  timeUnits: 6
};

const INITIAL_STATE: GameState = {
  player: INITIAL_PLAYER,
  day: 1,
  drugs: INITIAL_DRUGS,
  upgrades: INITIAL_UPGRADES,
  locations: INITIAL_LOCATIONS,
  events: []
};

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameState$ = new BehaviorSubject<GameState>({ ...INITIAL_STATE });

  getGameState() {
    return this.gameState$.asObservable();
  }

  getPlayer() {
    return this.gameState$.value.player;
  }

  updatePlayer(player: Player) {
    const state = { ...this.gameState$.value, player };
    this.gameState$.next(state);
  }

  spendTime(units: number) {
    const player = { ...this.getPlayer(), timeUnits: this.getPlayer().timeUnits - units };
    this.updatePlayer(player);
  }

  /**
   * Randomize drug prices (fluctuate +/- 30% from base)
   */
  randomizeDrugPrices() {
    const drugs = this.gameState$.value.drugs.map(drug => {
      const fluctuation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
      return { ...drug, price: Math.round(drug.basePrice * fluctuation) };
    });
    const state = { ...this.gameState$.value, drugs };
    this.gameState$.next(state);
  }

  /**
   * Attempt to buy a drug. Enforces inventory limit and increases notoriety.
   */
  buyDrug(drugId: string, amount: number): { success: boolean; error?: string } {
    const state = this.gameState$.value;
    const player = { ...state.player };
    const drug = state.drugs.find(d => d.id === drugId);
    if (!drug) return { success: false, error: 'Drug not found.' };
    const totalInventory = Object.values(player.inventory).reduce((a, b) => a + b, 0);
    if (totalInventory + amount > player.inventoryLimit) {
      return { success: false, error: 'Not enough inventory space.' };
    }
    const totalCost = drug.price * amount;
    if (player.cleanMoney < totalCost) {
      return { success: false, error: 'Not enough money.' };
    }
    // Update inventory, money, notoriety
    player.inventory[drugId] = (player.inventory[drugId] || 0) + amount;
    player.cleanMoney -= totalCost;
    player.notoriety += amount; // 1 notoriety per drug bought
    this.updatePlayer(player);
    return { success: true };
  }

  nextDay() {
    const player = { ...this.getPlayer(), timeUnits: 6 };
    const state = { ...this.gameState$.value, day: this.gameState$.value.day + 1, player };
    this.gameState$.next(state);
  }
}

