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

  constructor() { }

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
    console.log(`Servicio: ${type}, Valor: ${value}, Mes: ${month.rent_month}`);

    // Aquí podés actualizar la data local
    month[type] = value;

    this.onCheckbox.emit({ type, value, month });

    // O llamar a un servicio para guardar el cambio en la base de datos
    // Ejemplo:
    // this.paymentService.updateService(month.id, type, value).subscribe(...);
  }


}
