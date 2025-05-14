import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Drug, Location, Player } from '../models/game.models';
import { GameService } from '../game.service';

interface Buyer {
  preferred: string; // drug id
  secondary?: string; // drug id
  bought: string | null; // drug id actually bought
}

@Component({
  selector: 'app-dealing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dealing.component.html',
  styleUrls: ['./dealing.component.scss']
})
export class DealingComponent implements OnInit {
  getSalePrice(drug: Drug): number {
    if (!this.location) return drug.price;
    const markup = this.location.priceMarkup[drug.id] || 1;
    return Math.round(drug.price * markup);
  }
  getDrugName(drugId: string | undefined | null): string {
    if (!drugId) return '-';
    const drug = this.drugs.find(d => d.id === drugId);
    return drug ? drug.name : '-';
  }
  drugs: Drug[] = [];
  policeHeat: number = 0;
  timeUnits: number = 0;
  location: Location | null = null;
  player: Player | null = null;

  selectedDrugIds: Set<string> = new Set();
  buyers: Buyer[] = [];
  dealResult: { sold: { [drugId: string]: number }; notorietyGain: number; totalEarned: number } | null = null;

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.gameService.getGameState().subscribe(state => {
      this.player = state.player;
      this.location = state.locations.find(l => l.id === this.player?.location) || null;
      // Only show drugs the player has in inventory
      this.drugs = state.drugs
        .map(drug => ({ ...drug, quantity: this.player?.inventory[drug.id] || 0 }))
        .filter(drug => drug.quantity > 0);
      this.policeHeat = this.location?.policeHeat || 0;
      this.timeUnits = this.player?.timeUnits || 0;
      // By default, enable all drugs
      if (this.selectedDrugIds.size === 0) {
        this.selectedDrugIds = new Set(this.drugs.map(d => d.id));
      }
    });
  }

  toggleDrug(drugId: string, checked: boolean) {
    if (checked) {
      this.selectedDrugIds.add(drugId);
    } else {
      this.selectedDrugIds.delete(drugId);
    }
  }

  onDeal() {
    if (!this.player || !this.location) return;
    // 1. Determine number of buyers: 1-3 + notoriety bonus
    const notoriety = this.player.notoriety;
    const baseBuyers = Math.floor(Math.random() * 3) + 1;
    const bonusBuyers = Math.floor(notoriety / 10); // Every 10 notoriety, +1 buyer
    const numBuyers = baseBuyers + bonusBuyers;
    // 2. For each buyer, pick preferred and (maybe) secondary drug based on location demand
    const drugIds = this.drugs.filter(d => this.selectedDrugIds.has(d.id)).map(d => d.id);
    const demand = this.location.demandMultipliers;
    const buyers: Buyer[] = [];
    for (let i = 0; i < numBuyers; i++) {
      // For each drug, roll against its demand chance
      const availableDrugs = drugIds.filter(id => Math.random() < (demand[id] || 0));
      if (availableDrugs.length === 0) continue; // Skip if no drugs pass demand check
      
      // Pick preferred from available drugs (equal weight)
      const preferred = availableDrugs[Math.floor(Math.random() * availableDrugs.length)];
      
      // 40% chance to have a secondary from remaining available drugs
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
    const playerCopy: Player = JSON.parse(JSON.stringify(this.player));
    for (const buyer of buyers) {
      let boughtDrug: string | null = null;
      for (const tryDrug of [buyer.preferred, buyer.secondary]) {
        if (!tryDrug) continue;
        if (this.selectedDrugIds.has(tryDrug) && playerCopy.inventory[tryDrug] > 0) {
          playerCopy.inventory[tryDrug] -= 1;
          sold[tryDrug] = (sold[tryDrug] || 0) + 1;
          // Calculate sale price with markup based on location demand
          const drugObj = this.drugs.find(d => d.id === tryDrug);
          if (drugObj) {
            const salePrice = this.getSalePrice(drugObj);
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
    this.gameService.updatePlayer(playerCopy);
    // 5. Show result
    this.dealResult = { sold, notorietyGain, totalEarned };
  }

  weightedRandom(items: string[], weights: number[]): string {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      if (r < weights[i]) return items[i];
      r -= weights[i];
    }
    return items[0];
  }
}
