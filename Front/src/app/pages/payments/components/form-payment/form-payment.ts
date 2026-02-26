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
  amount: any;
  payment_method: any = "";
  @Input() total_rent_amount: any;
  @Input() rent_amount: any;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  constructor() { }

  // Calcular cuando se puede pagar como maximo
  get remainingAmount(): number {
    return (this.total_rent_amount || 0) - (this.rent_amount || 0);
  }

  close() {
    this.payment_method = "";
    this.cancel.emit();
  }

  savePayment() {

    if (!this.amount) return;

    if (this.amount > this.remainingAmount) {
      return; // bloquea totalmente
    }

    this.save.emit({
      rent_amount: this.amount,
      payment_method: this.payment_method
    });
  }

}
