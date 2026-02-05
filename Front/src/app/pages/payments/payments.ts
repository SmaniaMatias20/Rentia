import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../services/property/property';
import { AuthService } from '../../services/auth/auth';
import { Spinner } from '../../components/spinner/spinner';
import { PaymentService } from '../../services/payment/payment';
import { FormPayment } from './components/form-payment/form-payment';
import { ContractService } from '../../services/contract/contract';
import { FormsModule } from '@angular/forms';
import { CardPayment } from './components/card-payment/card-payment';
import { FormNote } from './components/form-note/form-note';
import { Toast } from '../../components/toast/toast';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, Spinner, FormsModule, CardPayment, FormNote, Toast, FormPayment],
  templateUrl: './payments.html',
  styleUrls: ['./payments.css'],
})
export class Payments {
  loading = false;
  properties: any[] = [];
  contracts: any[] = [];
  currentUser: any;
  selectedProperty: any | null = null;
  selectedYear: string | null = null;
  months: any[] = [];
  years = Array.from({ length: 12 }, (_, i) => 2026 + i);
  payments: any[] = [];
  selectedContract: any | null = null;
  openFormNote = false;
  openFormPayment = false;
  paymentMonthEdit: any | null = null;
  @ViewChild('toast') toast!: Toast;


  constructor(private router: Router, private propertyService: PropertyService, private authService: AuthService, private paymentService: PaymentService, private contractService: ContractService) { }

  async ngOnInit() {
    try {
      this.loading = true;
      this.currentUser = await this.authService.getCurrentUser();
      this.properties = await this.propertyService.getProperties(this.currentUser.id);
      this.contracts = await this.contractService.getContractsByUser(this.currentUser.id);
      this.loading = false;
    } catch (error) {
      console.error(error);
      this.loading = false;
    }
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }


  async onContractSelected(contract: any) {
    if (!contract) return;

    const contractId = contract.id;

    // Traer pagos del contrato
    const payments = await this.paymentService.getPaymentsByContract(contractId);

    // Generar cards por mes
    this.months = this.generateMonthlyCards(contract, payments);
  }


  generateMonthlyCalendar(start: Date, end: Date): string[] {
    const months: string[] = [];
    const date = new Date(start.getFullYear(), start.getMonth(), 1);

    while (date <= end) {
      // Formatear como "MM/yyyy"
      months.push(`${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`);
      date.setMonth(date.getMonth() + 1);
    }

    return months;
  }

  generateMonthlyCards(contract: any, payments: any[]): any[] {
    const months = [];
    const start = new Date(contract.valid_from);
    const end = new Date(contract.valid_to);

    const date = new Date(start.getFullYear(), start.getMonth(), 1);
    let monthIndex = 0; // cantidad de meses desde el inicio del contrato

    while (date <= end) {
      // Buscar pago existente
      const payment = payments.find(p => {
        const payMonth = new Date(p.rent_month);
        return payMonth.getFullYear() === date.getFullYear() &&
          payMonth.getMonth() === date.getMonth();
      });

      // Calcular total acumulado
      const total_rent_amount = this.calculateAccumulatedRent(
        contract.rent_amount,
        contract.increase_percentage,
        contract.increase_frequency,
        monthIndex
      );

      months.push({
        id: payment ? payment.id : null,
        rent_month: new Date(date),
        status: payment ? payment.status : false,
        rent_amount: payment ? payment.rent_amount : 0,
        total_rent_amount: total_rent_amount,
        water: payment ? payment.water : false,
        electricy: payment ? payment.electricy : false,
        gas: payment ? payment.gas : false,
        hoa_fees: payment ? payment.hoa_fees : false,
        description: payment ? payment.description : '',
        contract_id: contract.id,
        payment_method: payment ? payment.payment_method : '',
      });

      date.setMonth(date.getMonth() + 1);
      monthIndex++;
    }

    return months;
  }


  calculateAccumulatedRent(base: number, increase: number, frequency: string, monthIndex: number): number {
    const inc = increase / 100;
    let total = base;

    switch (frequency) {
      case 'monthly':
        total = base * Math.pow(1 + inc, monthIndex);
        break;
      case 'quarterly':
        const quarterIndex = Math.floor(monthIndex / 3);
        total = base * Math.pow(1 + inc, quarterIndex);
        break;
      case 'annual':
        const yearIndex = Math.floor(monthIndex / 12);
        total = base * Math.pow(1 + inc, yearIndex);
        break;
    }

    return Math.round(total);
  }

  calculateStatus(month: any): boolean {
    const allServicesChecked =
      month.water &&
      month.electricy &&
      month.gas &&
      month.hoa_fees;

    const rentCovered =
      month.rent_amount >= month.total_rent_amount;

    return allServicesChecked && rentCovered;
  }

  async onCheckbox(event: any) {
    const { type, value, rent_month } = event;

    const index = this.months.findIndex(m =>
      new Date(m.rent_month).getTime() === new Date(rent_month).getTime()
    );

    if (index === -1) return;

    // Actualizar servicio
    this.months[index][type] = value;

    // Recalcular status
    this.months[index].status = this.calculateStatus(this.months[index]);

    // 🔥 Forzar cambio de referencia (Angular detecta cambios)
    this.months = [...this.months];

    // Clonar para backend
    this.paymentMonthEdit = { ...this.months[index] };

    // Persistencia
    if (!this.paymentMonthEdit.id) {
      const payload = { ...this.paymentMonthEdit };
      delete payload.id;

      const { error, data } = await this.paymentService.createPayment(payload);

      if (error) {
        console.error('Error al crear servicio:', error);
        this.toast.showToast('Error al crear servicio', 'error');
        return;
      }

      if (!error && data) {
        this.months[index].id = data.id;
        this.paymentMonthEdit.id = data.id;
      }

      this.toast.showToast('Servicio agregado correctamente', 'success');
      return;
    }

    try {
      await this.paymentService.updatePayment(this.paymentMonthEdit);
      this.toast.showToast('Servicio actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error al actualizar servicio:', error);
      this.toast.showToast('Error al actualizar servicio', 'error');
    }
  }


  onAddNote(month: any) {
    this.paymentMonthEdit = month;
    this.openFormNote = true;
  }

  onAddPayment(month: any) {
    this.paymentMonthEdit = month;
    this.openFormPayment = true;
  }


  async onSaveNote(note: string) {
    this.paymentMonthEdit.description = note;

    if (!this.paymentMonthEdit.id) {
      delete this.paymentMonthEdit.id;

      const { error, data } = await this.paymentService.createPayment(this.paymentMonthEdit);

      if (error) {
        console.error('Error al crear observación:', error);
        this.toast.showToast('Error al crear observación', 'error');
        return;
      }

      this.paymentMonthEdit.id = data.id;

      this.toast.showToast('Observacion creada correctamente', 'success');
      this.openFormNote = false;
      return;
    }

    // Si existe pago, actualizar
    const { error } = await this.paymentService.updatePayment(this.paymentMonthEdit);

    if (error) {
      console.error('Error al actualizar observación:', error);
      this.toast.showToast('Error al actualizar observación', 'error');
      return;
    }

    this.toast.showToast('Observación actualizada correctamente', 'success');
    this.openFormNote = false;
  }

  async onSavePayment(payment: any) {
    this.paymentMonthEdit.rent_amount = payment.rent_amount;
    this.paymentMonthEdit.payment_method = payment.payment_method;

    try {
      if (!this.paymentMonthEdit.id) {
        delete this.paymentMonthEdit.id;
        const { error, data } = await this.paymentService.createPayment(this.paymentMonthEdit);

        if (error || !data) {
          this.toast.showToast('Error al crear pago', 'error');
          return;
        }

        this.paymentMonthEdit.id = data.id;

        this.toast.showToast('Pago creado correctamente', 'success');
        this.openFormPayment = false;
        return;

      }

      const { error } = await this.paymentService.updatePayment(this.paymentMonthEdit);

      if (error) {
        this.toast.showToast('Error al actualizar pago', 'error');
        return;
      }

      this.toast.showToast('Pago actualizado correctamente', 'success');
      this.openFormPayment = false;

    } catch (error) {
      console.error('Error al guardar pago:', error);
      this.toast.showToast('Error al guardar pago', 'error');
    }

  }


}
