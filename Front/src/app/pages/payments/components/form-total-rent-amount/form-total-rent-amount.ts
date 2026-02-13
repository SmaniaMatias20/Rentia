import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-total-rent-amount',
  imports: [FormsModule],
  templateUrl: './form-total-rent-amount.html',
  styleUrl: './form-total-rent-amount.css',
})
export class FormTotalRentAmount {
  @Input() rent_amount: any = 0;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();


  constructor() { }

  close() {
    this.rent_amount = 0;
    this.cancel.emit();
  }

  saveTotalRentAmount() {
    if (!this.rent_amount || this.rent_amount < 0) return;

    this.save.emit(this.rent_amount);
  }

}
