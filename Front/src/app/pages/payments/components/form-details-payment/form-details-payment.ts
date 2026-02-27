import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../../services/payment/payment';

@Component({
  selector: 'app-form-details-payment',
  imports: [CommonModule],
  templateUrl: './form-details-payment.html',
  styleUrl: './form-details-payment.css',
})
export class FormDetailsPayment {

  @Input() details: any[] = [];
  @Output() cancel = new EventEmitter<void>();
  @Output() detailDeleted = new EventEmitter<any>();

  sortedDetails: any[] = [];
  totalPaid: number = 0;

  constructor(private paymentService: PaymentService) { }

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

  async deleteDetailPayment(id: string) {
    try {
      const { error } = await this.paymentService.deleteDetailPayment(id);

      if (error) {
        console.error('Error al borrar detalle de pago:', error);
        return;
      }

      // Actualizar los valores en la interfaz
      this.sortedDetails = this.sortedDetails.filter(d => d.id !== id);
      this.totalPaid = this.sortedDetails.reduce((acc, d) =>
        acc + (d.amount || 0), 0
      );

      this.detailDeleted.emit(id);
    } catch (error) {
      console.error('Error al borrar detalle de pago:', error);
    }
  }


}
