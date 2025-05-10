import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../game.service';
import { Player } from '../models/game.models';
import { MarketComponent } from '../market/market.component';
import { ValuesSumPipe } from '../pipes/values-sum.pipe';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, MarketComponent, ValuesSumPipe],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  player: Player | null = null;
  day: number = 1;
  viewMode: 'summary' | 'market' = 'summary';

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.getGameState().subscribe(state => {
      this.player = state.player;
      this.day = state.day;
    });
  }

  gotoMarket() {
    this.viewMode = 'market';
  }

  gotoSummary() {
    this.viewMode = 'summary';
  }
}

