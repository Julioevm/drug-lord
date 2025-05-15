import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../game.service';
import { Player } from '../models/game.models';
import { MarketComponent } from '../market/market.component';
import { MapComponent } from '../map/map.component';
import { ValuesSumPipe } from '../pipes/values-sum.pipe';
import { DealingComponent } from '../dealing/dealing.component';
import { NgpDialog, NgpDialogDescription, NgpDialogOverlay, NgpDialogTitle, NgpDialogTrigger } from 'ng-primitives/dialog';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, MarketComponent, MapComponent, ValuesSumPipe, DealingComponent, NgpDialog,
    NgpDialogTitle,
    NgpDialogDescription,
    NgpDialogTrigger,
    NgpDialogOverlay],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  player: Player | null = null;
  day: number = 1;
  viewMode: 'summary' | 'market' | 'map' | 'dealing' = 'summary';
  @ViewChild('dialogTrigger', { static: false }) dialogTrigger!: ElementRef<HTMLButtonElement>;

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

  gotoMap() {
    this.viewMode = 'map';
  }

  gotoDealing() {
    this.viewMode = 'dealing';
  }

  checkSleep() {
    if ((this.player?.timeUnits ?? 0) < 1) {
      this.sleep();
      return;
    }
     // Programmatically open the dialog
     setTimeout(() => {
      if (this.dialogTrigger) {
        this.dialogTrigger.nativeElement.click();
      }
    });
  }

  sleep() {
    this.gameService.nextDay();
    this.viewMode = 'summary';
  }

  getCurrentLocation() {
    return this.gameService.getCurrentLocation();
  }

  confirmSleep(close?: () => void) {

    this.sleep();
    if (close) close();
  }

}

