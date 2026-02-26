import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-payment',
  imports: [CommonModule, FormsModule],
  templateUrl: './form-payment.html',
  styleUrl: './form-payment.css',
})
export class FormPayment {
  rent_amount: any;
  @Input() payment_method: any = "";
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  constructor() { }

  close() {
    this.payment_method = "";
    this.cancel.emit();
  }

  savePayment() {
    if (!this.rent_amount) return;
    this.save.emit({ rent_amount: this.rent_amount, payment_method: this.payment_method });
  }



}
