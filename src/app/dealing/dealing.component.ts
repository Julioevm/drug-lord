import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Drug, Location } from '../models/game.models';

@Component({
  selector: 'app-dealing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dealing.component.html',
  styleUrls: ['./dealing.component.scss']
})
export class DealingComponent {
  // These would be provided by a service in a real game
  drugs: Drug[] = [];
  policeHeat: number = 0;
  timeUnits: number = 0;
  location: Location | null = null;

  selectedDrugIds: Set<string> = new Set();

  ngOnInit() {
    this.selectedDrugIds = new Set(this.drugs.map(d => d.id));
  }

  toggleDrug(drugId: string, checked: boolean) {
    if (checked) {
      this.selectedDrugIds.add(drugId);
    } else {
      this.selectedDrugIds.delete(drugId);
    }
  }

  onDeal() {
    // Placeholder for deal logic
    // Would call a service to process dealing
    alert('Dealing drugs: ' + Array.from(this.selectedDrugIds).join(', '));
  }

  onCancel() {
    // Navigate back to main screen (map)
    window.history.back();
  }
}
