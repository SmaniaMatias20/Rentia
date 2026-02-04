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
  imports: [CommonModule, Spinner, FormsModule, CardPayment, FormNote, Toast],
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
  paymentMonthEdit: any | null = null;
  @ViewChild('toast') toast!: Toast;


  constructor(private router: Router, private propertyService: PropertyService, private authService: AuthService, private paymentService: PaymentService, private contractService: ContractService) { }

  async ngOnInit() {
    try {
      this.loading = true;
      this.currentUser = await this.authService.getCurrentUser();
      this.properties = await this.propertyService.getProperties(this.currentUser.id);
      this.contracts = await this.contractService.getContractsByUser(this.currentUser.id);
      console.log(this.contracts);
      this.loading = false;
    } catch (error) {
      console.error(error);
      this.loading = false;
    }
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  openFormPayment() {
    console.log('openFormPayment');
  }

  async onContractSelected(contract: any) {
    if (!contract) return;

    const contractId = contract.id;

    // Traer pagos del contrato
    console.log('onContractSelected', contractId);
    const payments = await this.paymentService.getPaymentsByContract(contractId);

    console.log(payments);
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
      console.log(payments);
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
        rent_amount: contract.rent_amount,
        total_rent_amount: total_rent_amount,
        water: payment ? payment.water : false,
        electricy: payment ? payment.electricy : false,
        gas: payment ? payment.gas : false,
        description: payment ? payment.description : '',
        contract_id: contract.id
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

  onCheckbox(event: any) {
    console.log(event);
  }

  onAddNote(month: any) {
    console.log('onAddNote', month);
    this.paymentMonthEdit = month;
    this.openFormNote = true;
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
}
