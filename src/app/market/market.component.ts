import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../game.service';
import { Drug, Player } from '../models/game.models';
import { ValuesSumPipe } from '../pipes/values-sum.pipe';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, ValuesSumPipe],
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent {
  drugs: Drug[] = [];
  player: Player | null = null;
  errorMsg: string = '';

  constructor(private gameService: GameService) {
    this.gameService.getGameState().subscribe(state => {
      this.drugs = state.drugs;
      this.player = state.player;
    });
  }

  buyDrug(drugId: string, amount: number) {
    if (!amount || amount <= 0) {
      this.errorMsg = 'Enter a valid amount.';
      return;
    }
    const result = this.gameService.buyDrug(drugId, amount);
    if (!result.success) {
      this.errorMsg = result.error || 'Could not buy drug.';
    } else {
      this.errorMsg = '';
    }
  }
}
