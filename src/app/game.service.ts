import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameState, Player, Drug, Upgrade, Location, GameEvent, LOCATIONS, Buyer, DRUGS, UPGRADES } from './models/game.models';

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
  drugs: DRUGS,
  upgrades: UPGRADES,
  locations: LOCATIONS,
  events: []
};

// Storage key for saving game state
const STORAGE_KEY = 'drug-lord-game-state';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameState$ = new BehaviorSubject<GameState>({ ...INITIAL_STATE });

  constructor() {
    this.loadGameState();
  }

  /**
   * Move the player to a new location if they have enough time units (TU).
   * Deducts 1 TU and updates the player's location.
   * Returns { success: boolean, error?: string }
   */
  movePlayer(locationId: string): { success: boolean; error?: string } {
    const player = { ...this.getPlayer() };
    if (player.timeUnits < 1) {
      return { success: false, error: 'Not enough Time Units (TU) to move.' };
    }
    player.location = locationId;
    player.timeUnits -= 1;
    this.updatePlayer(player);
    return { success: true };
  }

  getGameState() {
    return this.gameState$.asObservable();
  }

  getPlayer() {
    return this.gameState$.value.player;
  }

  updatePlayer(player: Player) {
    const state = { ...this.gameState$.value, player };
    this.gameState$.next(state);
    this.saveGameState();
  }

  spendTime(units: number) {
    const player = { ...this.getPlayer(), timeUnits: this.getPlayer().timeUnits - units };
    this.updatePlayer(player);
  }

  getCurrentLocation() {
    return this.gameState$.value.locations.find(loc => loc.id === this.getPlayer().location);
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
    this.saveGameState();
  }

  /**
   * Attempt to buy a drug. Enforces inventory limit and increases notoriety.
   * Uses clean money by default for backward compatibility.
   */
  buyDrug(drugId: string, amount: number): { success: boolean; error?: string } {
    return this.buyDrugWithType(drugId, amount, 'clean');
  }

  /**
   * Attempt to buy a drug with either clean or dirty money.
   */
  buyDrugWithType(drugId: string, amount: number, type: 'clean' | 'dirty'): { success: boolean; error?: string } {
    const state = this.gameState$.value;
    const player = { ...state.player };
    const drug = state.drugs.find(d => d.id === drugId);
    if (!drug) return { success: false, error: 'Drug not found.' };
    const totalInventory = Object.values(player.inventory).reduce((a, b) => a + b, 0);
    if (totalInventory + amount > player.inventoryLimit) {
      return { success: false, error: 'Not enough inventory space.' };
    }
    const totalCost = drug.price * amount;
    if (type === 'clean') {
      if (player.cleanMoney < totalCost) {
        return { success: false, error: 'Not enough clean money.' };
      }
      player.cleanMoney -= totalCost;
    } else {
      if (player.dirtyMoney < totalCost) {
        return { success: false, error: 'Not enough dirty money.' };
      }
      player.dirtyMoney -= totalCost;
    }
    // Update inventory, money, notoriety
    player.inventory[drugId] = (player.inventory[drugId] || 0) + amount;
    player.notoriety += amount; // 1 notoriety per drug bought
    this.updatePlayer(player);
    return { success: true };
  }

  nextDay() {
    const player = { ...this.getPlayer(), timeUnits: 6 };
    const state = { ...this.gameState$.value, day: this.gameState$.value.day + 1, player };
    this.gameState$.next(state);
    this.saveGameState();
  }

  /**
   * Process a drug deal action: determines buyers, drugs sold, updates player, and returns deal result.
   * @param selectedDrugIds Set of drug IDs selected for dealing
   * @returns { sold: { [drugId: string]: number }, notorietyGain: number, totalEarned: number, buyers: Buyer[] }
   */
  processDeal(selectedDrugIds: Set<string>) {
    const player = this.getPlayer();
    const location = this.getCurrentLocation();
    if (!player || !location || player.timeUnits < 1) return null;
    // 1. Determine number of buyers: 1-3 + notoriety bonus
    const notoriety = player.notoriety;
    const baseBuyers = Math.floor(Math.random() * 3) + 1;
    const bonusBuyers = Math.floor(notoriety / 10); // Every 10 notoriety, +1 buyer
    const numBuyers = baseBuyers + bonusBuyers;
    // 2. For each buyer, pick preferred and (maybe) secondary drug based on location demand
    const drugs = this.gameState$.value.drugs
      .map(drug => ({ ...drug, quantity: player.inventory[drug.id] || 0 }))
      .filter(drug => drug.quantity > 0);
    const drugIds = drugs.filter(d => selectedDrugIds.has(d.id)).map(d => d.id);
    const demand = location.demandMultipliers;
    const buyers: Buyer[] = [];
    for (let i = 0; i < numBuyers; i++) {
      const availableDrugs = drugIds.filter(id => Math.random() < (demand[id] || 0));
      if (availableDrugs.length === 0) continue;
      const preferred = availableDrugs[Math.floor(Math.random() * availableDrugs.length)];
      let secondary: string | undefined = undefined;
      if (Math.random() < 0.4 && availableDrugs.length > 1) {
        const others = availableDrugs.filter(id => id !== preferred);
        secondary = others[Math.floor(Math.random() * others.length)];
      }
      buyers.push({ preferred, secondary, bought: null });
    }
    // 3. Process sales
    const sold: { [drugId: string]: number } = {};
    let notorietyGain = 0;
    let totalEarned = 0;
    const playerCopy: Player = JSON.parse(JSON.stringify(player));
    for (const buyer of buyers) {
      let boughtDrug: string | null = null;
      for (const tryDrug of [buyer.preferred, buyer.secondary]) {
        if (!tryDrug) continue;
        if (selectedDrugIds.has(tryDrug) && playerCopy.inventory[tryDrug] > 0) {
          playerCopy.inventory[tryDrug] -= 1;
          sold[tryDrug] = (sold[tryDrug] || 0) + 1;
          const drugObj = drugs.find(d => d.id === tryDrug);
          if (drugObj) {
            const salePrice = this.getSalePrice(drugObj, location);
            playerCopy.dirtyMoney += salePrice;
            totalEarned += salePrice;
          }
          boughtDrug = tryDrug;
          notorietyGain += 1;
          break;
        }
      }
      buyer.bought = boughtDrug;
    }
    // 4. Update player state
    playerCopy.notoriety += notorietyGain;
    playerCopy.timeUnits = Math.max(0, playerCopy.timeUnits - 1);
    this.updatePlayer(playerCopy);
    // 5. Return result for UI
    return { sold, notorietyGain, totalEarned, buyers };
  }

  /**
   * Calculate sale price for a drug at a given location
   */
  getSalePrice(drug: Drug, location?: Location): number {
    if (!location) return drug.price;
    const markup = location.priceMarkup[drug.id] || 1;
    return Math.round(drug.price * markup);
  }

  /**
   * Weighted random selection utility
   */
  weightedRandom(items: string[], weights: number[]): string {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      if (r < weights[i]) return items[i];
      r -= weights[i];
    }
    return items[0];
  }

  /**
   * Save the current game state to localStorage
   */
  private saveGameState(): void {
    try {
      const serializedState = JSON.stringify(this.gameState$.value);
      localStorage.setItem(STORAGE_KEY, serializedState);
    } catch (error) {
      console.error('Failed to save game state to localStorage:', error);
    }
  }

  /**
   * Load game state from localStorage, or initialize with default state if not found
   */
  private loadGameState(): void {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.gameState$.next(parsedState);
      }
    } catch (error) {
      console.error('Failed to load game state from localStorage:', error);
      // If there's an error loading, use initial state
      this.resetGameState();
    }
  }

  /**
   * Reset game state to initial values and clear localStorage
   */
  resetGameState(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.gameState$.next({ ...INITIAL_STATE });
  }
}

