import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location, LOCATIONS } from '../models/game.models';
import { GameService } from '../game.service';
import { NgpDialog, NgpDialogTitle, NgpDialogDescription, NgpDialogTrigger, NgpDialogOverlay } from 'ng-primitives/dialog';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule,
    NgpDialog,
    NgpDialogTitle,
    NgpDialogDescription,
    NgpDialogTrigger,
    NgpDialogOverlay
  ],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
import { Output, EventEmitter } from '@angular/core';

export class MapComponent {
  locations: Location[] = LOCATIONS;
  selectedLocation: Location | null = null;
  error: string | null = null;

  @ViewChild('dialogTrigger', { static: false }) dialogTrigger!: ElementRef<HTMLButtonElement>;
  @Output() moveConfirmed = new EventEmitter<void>();

  constructor(private gameService: GameService) {}

  onLocationClick(location: Location) {
    this.selectedLocation = location;
    this.error = null;
    // Programmatically open the dialog
    setTimeout(() => {
      if (this.dialogTrigger) {
        this.dialogTrigger.nativeElement.click();
      }
    });
  }

  confirmMove(close?: () => void) {
    if (!this.selectedLocation) return;
    const result = this.gameService.movePlayer(this.selectedLocation.id);
    if (!result.success) {
      this.error = result.error || 'Unknown error.';
      return;
    }
    this.selectedLocation = null;
    this.error = null;
    this.moveConfirmed.emit();
    if (close) close();
  }

  cancelMove(close?: () => void) {
    this.selectedLocation = null;
    this.error = null;
    if (close) close();
  }
}

