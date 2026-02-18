import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card-payment',
  imports: [NgClass, CommonModule, FormsModule],
  templateUrl: './card-payment.html',
  styleUrl: './card-payment.css',
})
export class CardPayment {
  @Input() month: any;
  @Output() onCheckbox = new EventEmitter<any>();
  @Output() onAddNote = new EventEmitter<any>();
  @Output() onAddPayment = new EventEmitter<any>();
  @Output() onEditTotalRentAmount = new EventEmitter<any>();
  @Output() onAddServicesAmount = new EventEmitter<any>();

  constructor() {
    console.log(this.month);
  }

  formatRentMonth(date: Date | string): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const d = new Date(date);
    const mes = meses[d.getMonth()];
    const anio = d.getFullYear();

    return `${mes} ${anio}`;
  }

  onCheckboxChange(type: string, value: boolean, month: any) {
    this.onCheckbox.emit({
      type,
      value,
      rent_month: month.rent_month
    });
  }
}
