import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Drug, Location, Player, Log } from '../models/game.models';
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
  @Output() backToSummary = new EventEmitter<void>();
  getSalePrice(drug: Drug): number {
    return this.gameService.getSalePrice(drug, this.location!);
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
  dealLogs: Log[] = [];
  currentDay: number = 1;

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.gameService.getGameState().subscribe(state => {
      this.currentDay = state.day;
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
    // Call the game logic in the service, passing selected drugs
    const result = this.gameService.processDeal(this.selectedDrugIds);
    if (result) {
      this.dealResult = {
        sold: result.sold,
        notorietyGain: result.notorietyGain,
        totalEarned: result.totalEarned
      };
      this.buyers = result.buyers;

      // Create and store the deal log
      const logMessage = Object.entries(result.sold).length > 0 ? `Sold ${Object.entries(result.sold).map(([drugId, quantity]) => `${quantity} ${this.getDrugName(drugId)}`).join(', ')} for $${result.totalEarned}` : 'Found no buyers.';
      const dealLog: Log = {
        timestamp: new Date().toLocaleTimeString(),
        location: this.location?.name || 'Unknown',
        day: this.currentDay,
        type: 'deal',
        message: logMessage
      };
      this.dealLogs.unshift(dealLog); // Add to beginning of array
    }
  }

  onBackClick() {
    this.backToSummary.emit();
  }
}
