import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../game.service';
import { Drug, Player } from '../models/game.models';
import { ValuesSumPipe } from '../pipes/values-sum.pipe';
import { QuantityInputComponent } from '../ui/quantity-input/quantity-input.component';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, FormsModule, ValuesSumPipe, QuantityInputComponent],
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent {
  @Output() backToSummary = new EventEmitter<void>();
  drugs: Drug[] = [];
  availableDrugs: Drug[] = [];
  player: Player | null = null;
  errorMsg: string = '';
  payWith: 'dirty' | 'clean' = 'dirty';

  constructor(private gameService: GameService) {
    this.gameService.getGameState().subscribe(state => {
      this.drugs = state.drugs;
      this.player = state.player;
      this.availableDrugs = this.drugs.filter(drug => drug.minNotoriety ? this.player!.notoriety >= drug.minNotoriety : true);
    });
  }

  setPayWith(type: 'dirty' | 'clean') {
    this.payWith = type;
  }

  get totalCost(): number {
    return this.drugs.reduce((sum, drug) => sum + (drug.amount ? drug.amount * drug.price : 0), 0);
  }

  get totalAmount(): number {
    return this.drugs.reduce((sum, drug) => sum + (drug.amount ? drug.amount : 0), 0);
  }

  get availableMoney(): number {
    if (!this.player) return 0;
    return this.payWith === 'dirty' ? this.player.dirtyMoney : this.player.cleanMoney;
  }

  get availableCleanMoney(): number {
    return this.player ? this.player.cleanMoney : 0;
  }

  get availableDirtyMoney(): number {
    return this.player ? this.player.dirtyMoney : 0;
  }

  get freeSpace(): number {
    if (!this.player) return 0;
    const used = Object.values(this.player.inventory).reduce((a, b) => a + b, 0);
    return this.player.inventoryLimit - used;
  }

  get overMoney(): boolean {
    return this.totalCost > this.availableMoney;
  }

  get overSpace(): boolean {
    return this.totalAmount > this.freeSpace;
  }

  get canBuy(): boolean {
    return this.totalCost > 0 && !this.overMoney && !this.overSpace;
  }

  buyAll() {
    if (!this.player) return;
    if (!this.canBuy) return;
    // For each drug, buy the selected amount
    let error = '';
    for (const drug of this.drugs) {
      if (drug.amount && drug.amount > 0) {
        const result = this.gameService.buyDrugWithType(drug.id, drug.amount, this.payWith);
        if (!result.success) {
          error = result.error || 'Could not buy ' + drug.name;
          break;
        }
        drug.amount = 0; // Reset selection after buying
      }
    }
    this.errorMsg = error;
  }
  
  onBackClick() {
    this.backToSummary.emit();
  }
}

