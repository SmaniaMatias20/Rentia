import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../../services/payment/payment';
import { FormDetailsPayment } from '../form-details-payment/form-details-payment';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-card-payment',
  imports: [NgClass, CommonModule, FormsModule, FormDetailsPayment],
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
  detailPayments: any[] = [];
  openDetailsForm = false;

  today = new Date();

  constructor(private paymentService: PaymentService) {
  }

  async ngOnInit() {
    await this.loadDetailPayments();
  }

  async ngOnChanges() {
    await this.loadDetailPayments();
  }

  async loadDetailPayments() {
    if (!this.month?.id) return;

    const { data, error } =
      await this.paymentService.getDetailPaymentsByPaymentId(this.month.id);

    if (error) {
      console.error('Error al obtener detalles:', error.message);
      return;
    }

    this.detailPayments = data || [];
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

  downloadPDF(month: any) {
    try {
      const template = document.getElementById('payment-content');
      if (!template) return;

      // Clonar el contenido para no tocar el original
      const clone = template.cloneNode(true) as HTMLElement;
      clone.style.display = 'block';
      clone.classList.remove('hidden');

      if (month.payment_method) {
        if (month.payment_method === 'transfer') {
          clone.querySelector('#payment-method')!.textContent = 'Transferencia bancaria';
        }
        if (month.payment_method === 'cash') {
          clone.querySelector('#payment-method')!.textContent = 'Efectivo';
        }
        if (month.payment_method === 'mixed') {
          clone.querySelector('#payment-method')!.textContent = 'Mixto';
        }
        if (month.payment_method === 'card') {
          clone.querySelector('#payment-method')!.textContent = 'Tarjeta';
        }
      } else {
        clone.querySelector('#payment-method')!.textContent = 'No especificado';
      }

      // Actualizar datos principales
      clone.querySelector('#period')!.textContent = this.formatRentMonth(month.rent_month);
      // clone.querySelector('#payment-method')!.textContent = month.payment_method || 'No especificado';
      clone.querySelector('#total-rent-amount')!.textContent =
        month.total_rent_amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
      clone.querySelector('#rent-amount')!.textContent =
        month.rent_amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
      clone.querySelector('#balance-pending')!.textContent =
        (month.total_rent_amount - month.rent_amount).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

      // 🔹 Nuevo: nombre del inquilino (AJUSTAR)
      const tenantNameEl = clone.querySelector('#tenant-name') as HTMLElement;
      tenantNameEl.textContent = month.tenant_name || 'Inquilino no especificado';

      // Observaciones
      const obs = clone.querySelector('#observations') as HTMLElement;
      obs.textContent = month.description || 'Sin observaciones';

      // Opciones PDF
      const options = {
        margin: 10,
        filename: `${this.formatRentMonth(month.rent_month)}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      // Renderizar PDF
      html2pdf().set(options).from(clone).save();

    } catch (error) {
      console.log(error);
    }
  }




}
