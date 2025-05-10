import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameState, Player, Drug, Upgrade, Location, GameEvent } from './models/game.models';

const INITIAL_DRUGS: Drug[] = [
  { id: 'weed', name: 'Weed', basePrice: 100, quantity: 0 },
  { id: 'coke', name: 'Cocaine', basePrice: 1000, quantity: 0 },
  { id: 'heroin', name: 'Heroin', basePrice: 800, quantity: 0 },
  { id: 'acid', name: 'Acid', basePrice: 300, quantity: 0 }
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

  nextDay() {
    const player = { ...this.getPlayer(), timeUnits: 6 };
    const state = { ...this.gameState$.value, day: this.gameState$.value.day + 1, player };
    this.gameState$.next(state);
  }
}

