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
import { FormTotalRentAmount } from './components/form-total-rent-amount/form-total-rent-amount';
import { FormServicesAmount } from './components/form-services-amount/form-services-amount';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, Spinner, FormsModule, CardPayment, FormNote, Toast, FormPayment, FormTotalRentAmount, FormServicesAmount],
  templateUrl: './payments.html',
  styleUrls: ['./payments.css'],
})
export class Payments {
  @ViewChild('toast') toast!: Toast;
  loading = false;
  currentUser: any;
  properties: any[] = [];
  contracts: any[] = [];
  payments: any[] = [];

  selectedProperty: any | null = null;
  selectedYear: string | null = null;
  selectedContract: any | null = null;

  months: any[] = [];
  years = Array.from({ length: 12 }, (_, i) => 2026 + i);
  paymentMonthEdit: any | null = null;
  currentMonthPage: number = 1;
  monthsPerPage: number = 12;

  openFormNote = false;
  openFormPayment = false;
  openFormTotalRentAmount = false;
  openFormServicesAmount = false;

  servicesAmount: any;


  constructor(private router: Router, private propertyService: PropertyService, private authService: AuthService, private paymentService: PaymentService, private contractService: ContractService) { }

  get paginatedMonths() {
    const startIndex = (this.currentMonthPage - 1) * this.monthsPerPage;
    const endIndex = startIndex + this.monthsPerPage;
    return this.months.slice(startIndex, endIndex);
  }

  get totalMonthPages(): number {
    return Math.ceil(this.months.length / this.monthsPerPage) || 1;
  }


  async ngOnInit() {
    try {
      this.loading = true;
      this.currentUser = await this.authService.getCurrentUser();
      this.properties = await this.propertyService.getProperties(this.currentUser.id);
      this.contracts = await this.contractService.getContractsByUser(this.currentUser.id, "active");
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
        total_rent_amount: payment ? payment.total_rent_amount : total_rent_amount,
        water: payment ? payment.water : false,
        electricy: payment ? payment.electricy : false,
        gas: payment ? payment.gas : false,
        hoa_fees: payment ? payment.hoa_fees : false,
        description: payment ? payment.description : '',
        contract_id: contract.id,
        payment_method: payment ? payment.payment_method : '',
        electricy_amount: payment ? payment.electricy_amount : 0,
        gas_amount: payment ? payment.gas_amount : 0,
        hoa_fees_amount: payment ? payment.hoa_fees_amount : 0,
        water_amount: payment ? payment.water_amount : 0,
      });

      date.setMonth(date.getMonth() + 1);
      monthIndex++;
    }

    return months;
  }


  calculateAccumulatedRent(
    base: number,
    increase: number,
    frequency: string,
    monthIndex: number
  ): number {
    const inc = increase / 100;

    const frequencyMap: Record<string, number> = {
      monthly: 1,
      bimonthly: 2,
      quarterly: 3,
      four_monthly: 4,
      semiannual: 6,
      annual: 12,
    };

    const period = frequencyMap[frequency];

    // fallback seguro
    if (!period) return Math.round(base);

    const index = Math.floor(monthIndex / period);
    const total = base * Math.pow(1 + inc, index);

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

  formatFrequency(freq: string) {
    const map: Record<string, string> = {
      monthly: 'Mensual',
      bimonthly: 'Bimestral',
      quarterly: 'Trimestral',
      four_monthly: 'Cuatrimestral',
      semiannual: 'Semestral',
      annual: 'Anual'
    };

    return map[freq] || freq;
  }


  onAddNote(month: any) {
    this.paymentMonthEdit = month;
    this.openFormNote = true;
  }

  onAddPayment(month: any) {
    this.paymentMonthEdit = month;
    this.openFormPayment = true;
  }

  onEditTotalRentAmount(month: any) {
    this.paymentMonthEdit = month;
    this.openFormTotalRentAmount = true;
  }

  onAddServicesAmount(month: any) {
    this.paymentMonthEdit = { ...month }; // 👈 CLAVE (clon)

    this.servicesAmount = {
      electricity: month.electricy_amount ?? 0,
      gas: month.gas_amount ?? 0,
      hoa_fees: month.hoa_fees_amount ?? 0,
      water: month.water_amount ?? 0,
    };

    this.openFormServicesAmount = true;
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
    try {

      // 🔹 Actualizar valores en memoria
      this.paymentMonthEdit.rent_amount += payment.rent_amount;
      this.paymentMonthEdit.payment_method = payment.payment_method;

      // 🔹 CREATE
      if (!this.paymentMonthEdit.id) {

        const payload = { ...this.paymentMonthEdit };
        delete payload.id;

        const { error, data } =
          await this.paymentService.createPayment(payload);

        if (error || !data) {
          this.toast.showToast('Error al crear pago', 'error');
          return;
        }

        this.paymentMonthEdit.id = data.id;
      }
      else {
        // 🔹 UPDATE
        const { error } =
          await this.paymentService.updatePayment(this.paymentMonthEdit);

        if (error) {
          this.toast.showToast('Error al actualizar pago', 'error');
          return;
        }
      }

      // 🔥 Crear detalle de pago (siempre)
      const { error: errorDetail } =
        await this.paymentService.createDetailPayment(
          this.paymentMonthEdit.id,
          payment.rent_amount,
          payment.payment_method
        );

      if (errorDetail) {
        this.toast.showToast('Error al crear detalle de pago', 'error');
        return;
      }

      // 🔹 Recalcular estado del mes
      this.paymentMonthEdit.status =
        this.calculateStatus(this.paymentMonthEdit);

      // 🔥 Actualizar mes en el array principal
      const index = this.months.findIndex(m =>
        new Date(m.rent_month).getTime() ===
        new Date(this.paymentMonthEdit.rent_month).getTime()
      );

      if (index !== -1) {
        this.months[index] = {
          ...this.months[index],
          rent_amount: this.paymentMonthEdit.rent_amount,
          payment_method: this.paymentMonthEdit.payment_method,
          status: this.paymentMonthEdit.status,
          id: this.paymentMonthEdit.id
        };

        // 🚀 CLAVE: nueva referencia para refrescar la card
        this.months = [...this.months];
      }

      this.toast.showToast(
        this.paymentMonthEdit.id
          ? 'Pago actualizado correctamente'
          : 'Pago creado correctamente',
        'success'
      );

      this.openFormPayment = false;

    } catch (error) {
      console.error('Error al guardar pago:', error);
      this.toast.showToast('Error al guardar pago', 'error');
    }
  }

  async onSaveTotalRentAmount(total_rent_amount: number) {
    this.paymentMonthEdit.total_rent_amount = total_rent_amount;

    if (!this.paymentMonthEdit.id) {
      delete this.paymentMonthEdit.id;

      const { error, data } = await this.paymentService.createPayment(this.paymentMonthEdit);

      if (error) {
        console.error('Error al crear total alquiler:', error);
        this.toast.showToast('Error al crear total alquiler', 'error');
        return;
      }

      this.paymentMonthEdit.id = data.id;

      this.toast.showToast('Total alquiler creado correctamente', 'success');
      this.openFormTotalRentAmount = false;
      return;
    }

    const { error } = await this.paymentService.updatePayment(this.paymentMonthEdit);

    if (error) {
      console.error('Error al actualizar total alquiler:', error);
      this.toast.showToast('Error al actualizar total alquiler', 'error');
      return;
    }

    this.toast.showToast('Total alquiler actualizado correctamente', 'success');
    this.openFormTotalRentAmount = false;
  }

  async onSaveServicesAmount(services_amount: any) {
    // 🔥 mapear valores al edit
    this.paymentMonthEdit.electricy_amount = services_amount.electricity;
    this.paymentMonthEdit.gas_amount = services_amount.gas;
    this.paymentMonthEdit.hoa_fees_amount = services_amount.hoa_fees;
    this.paymentMonthEdit.water_amount = services_amount.water;

    // 🆕 CREATE
    if (!this.paymentMonthEdit.id) {
      const payload = { ...this.paymentMonthEdit };
      delete payload.id;

      const { error, data } = await this.paymentService.createPayment(payload);

      if (error || !data) {
        console.error('Error al cargar los valores de los servicios:', error);
        this.toast.showToast('Error al cargar los valores de los servicios', 'error');
        return;
      }

      this.paymentMonthEdit.id = data.id;
    } else {
      // 🔄 UPDATE
      const { error } = await this.paymentService.updatePayment(this.paymentMonthEdit);

      if (error) {
        console.error('Error al actualizar los valores de los servicios:', error);
        this.toast.showToast('Error al actualizar los valores de los servicios', 'error');
        return;
      }
    }

    const index = this.months.findIndex(m =>
      new Date(m.rent_month).getTime() ===
      new Date(this.paymentMonthEdit.rent_month).getTime()
    );

    if (index !== -1) {
      this.months[index] = {
        ...this.months[index],
        electricy_amount: this.paymentMonthEdit.electricy_amount,
        gas_amount: this.paymentMonthEdit.gas_amount,
        hoa_fees_amount: this.paymentMonthEdit.hoa_fees_amount,
        water_amount: this.paymentMonthEdit.water_amount,
        id: this.paymentMonthEdit.id
      };

      // 🔥 MUY IMPORTANTE: nueva referencia
      this.months = [...this.months];
    }

    this.toast.showToast(
      'Valores de los servicios actualizados correctamente',
      'success'
    );

    this.openFormServicesAmount = false;
  }




}
