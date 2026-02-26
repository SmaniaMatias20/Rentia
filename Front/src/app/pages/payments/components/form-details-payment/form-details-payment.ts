import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-details-payment',
  imports: [CommonModule],
  templateUrl: './form-details-payment.html',
  styleUrl: './form-details-payment.css',
})
export class FormDetailsPayment {

  @Input() details: any[] = [];
  @Output() cancel = new EventEmitter<void>();

  sortedDetails: any[] = [];
  totalPaid: number = 0;

  ngOnInit(): void {

    // ordenar por fecha descendente
    this.sortedDetails = [...this.details].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // calcular total (ignorar null)
    this.totalPaid = this.details.reduce((acc, d) =>
      acc + (d.amount || 0), 0
    );
  }

  paymentMethodLabels: Record<string, string> = {
    card: 'Tarjeta de crédito',
    transfer: 'Transferencia',
    cash: 'Efectivo',
    mixed: 'Más de un método'
  };

  getPaymentMethodLabel(method: string): string {
    return this.paymentMethodLabels[method] || 'Desconocido';
  }
}
