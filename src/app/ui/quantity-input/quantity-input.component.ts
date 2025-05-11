import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-quantity-input',
  templateUrl: './quantity-input.component.html',
  styleUrls: ['./quantity-input.component.scss']
})
export class QuantityInputComponent {
  @Input() value = 1;
  @Input() min = 1;
  @Input() max: number | null = null;
  @Output() valueChange = new EventEmitter<number>();

  decrement() {
    if (this.value > this.min) {
      this.value--;
      this.valueChange.emit(this.value);
    }
  }

  increment() {
    if (this.max === null || this.value < this.max) {
      this.value++;
      this.valueChange.emit(this.value);
    }
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = parseInt(input.value, 10);
    if (isNaN(val)) val = this.min;
    if (val < this.min) val = this.min;
    if (this.max !== null && val > this.max) val = this.max;
    this.value = val;
    this.valueChange.emit(this.value);
  }
}
