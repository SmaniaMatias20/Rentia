import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';
import { PaymentService } from '../../services/payment/payment';
import { Spinner } from '../../components/spinner/spinner';
import { CardStatistic } from './components/card-statistic/card-statistic';
import { StatisticsService } from '../../services/statistics/statistics';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../components/toast/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-statistics',
  imports: [Spinner, CardStatistic, FormsModule, Toast, CommonModule],
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.css']
})
export class Statistics {
  @ViewChild('toast') toast!: Toast;
  loading = false;
  currentUser: any;
  quantityOfPropertiesByUser: number = 0;
  quantityOfPropertiesWithoutTenantByUser: number = 0;
  quantityOfPropertiesWithTenantByUser: number = 0;
  percentageOfPropertiesWithTenantByUser: number = 0;
  percentageOfPropertiesWithoutTenantByUser: number = 0;
  quantityOfTenantsByUser: number = 0;
  quantityOfActiveContractsByUser: number = 0;
  quantityOfContractsToVenceByUser: number = 0;
  quantityOfContractsVencedByUser: number = 0;
  quantityOfContractsPendingByUser: number = 0;
  quantityOfPaymentsByUser: number = 0;
  monthlyRentIncome: number = 0;
  monthlyElectricityIncome: number = 0;
  monthlyGasIncome: number = 0;
  monthlyHoaIncome: number = 0;
  monthlyWaterIncome: number = 0;
  averageRent: number = 0;
  highestRent: number = 0;
  lowestRent: number = 0;
  selectedMonthYear: string = '';

  constructor(private router: Router, private auth: AuthService, private paymentService: PaymentService, private statisticsService: StatisticsService) {
  }

  get visibleMonthYear(): string {
    const date = this.selectedMonthYear
      ? new Date(this.selectedMonthYear)
      : new Date();

    return date.toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric'
    }).replace(/^./, c => c.toUpperCase());
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    try {
      // 👤 Usuario actual
      this.currentUser = await this.auth.getCurrentUser();

      // 📊 Todas las estadísticas en UNA llamada lógica
      const stats = await this.statisticsService.getStatisticsByUser(
        this.currentUser.id
      );

      // 🏠 Propiedades
      this.quantityOfPropertiesByUser = stats.properties.total;
      this.quantityOfPropertiesWithTenantByUser =
        stats.properties.withTenant;
      this.quantityOfPropertiesWithoutTenantByUser =
        stats.properties.withoutTenant;
      this.percentageOfPropertiesWithTenantByUser =
        stats.properties.percentageWithTenant;
      this.percentageOfPropertiesWithoutTenantByUser =
        stats.properties.percentageWithoutTenant;

      // 👥 Inquilinos
      this.quantityOfTenantsByUser = stats.tenants;

      // 💰 Alquileres
      this.highestRent = stats.rents.highest;
      this.lowestRent = stats.rents.lowest;

      // 📄 Contratos
      this.quantityOfActiveContractsByUser = stats.contracts.active;
      this.quantityOfContractsToVenceByUser = stats.contracts.toExpire;
      this.quantityOfContractsVencedByUser = stats.contracts.expired;
      this.quantityOfContractsPendingByUser = stats.contracts.pending;

      // 💵 Ingresos mensuales (se mantiene aparte)
      await this.getDefaultMonthlyRentIncomeByUser();

      this.toast.showToast(
        'Estadísticas obtenidas correctamente',
        'success'
      );
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      this.toast.showToast('Error al obtener estadísticas', 'error');
    } finally {
      this.loading = false;
    }
  }

  // Ir a la página de inicio
  goToHome() {
    this.router.navigateByUrl('/home');
  }

  // Calcular el porcentaje de propiedades con inquilino
  calculatePercentageOfPropertiesWithTenantByUser() {
    this.percentageOfPropertiesWithTenantByUser = Math.round(
      (this.quantityOfPropertiesWithTenantByUser /
        this.quantityOfPropertiesByUser) *
      100
    );
  }

  // Calcular el porcentaje de propiedades sin inquilino
  calculatePercentageOfPropertiesWithoutTenantByUser() {
    this.percentageOfPropertiesWithoutTenantByUser = Math.round(
      (this.quantityOfPropertiesWithoutTenantByUser /
        this.quantityOfPropertiesByUser) *
      100
    );
  }

  onMonthYearChange() {
    console.log('onMonthYearChange');
    console.log(this.selectedMonthYear);
  }

  // Aplicar filtro y obtener ingresos mensuales
  async applyMonthYearFilter() {
    if (!this.selectedMonthYear) return;

    this.loading = true;
    try {
      const [year, month] = this.selectedMonthYear.split('-').map(Number);

      this.monthlyRentIncome =
        await this.paymentService.getMonthlyRentIncomeByUser(
          this.currentUser.id,
          year,
          month
        );

      this.monthlyElectricityIncome =
        await this.paymentService.getMonthlyElectricityIncomeByUser(
          this.currentUser.id,
          year,
          month
        );

      this.monthlyGasIncome =
        await this.paymentService.getMonthlyGasIncomeByUser(
          this.currentUser.id,
          year,
          month
        );

      this.monthlyHoaIncome =
        await this.paymentService.getMonthlyHoaIncomeByUser(
          this.currentUser.id,
          year,
          month
        );

      this.monthlyWaterIncome =
        await this.paymentService.getMonthlyWaterIncomeByUser(
          this.currentUser.id,
          year,
          month
        );

      this.quantityOfPaymentsByUser =
        await this.paymentService.getQuantityOfPaymentsByUser(
          this.currentUser.id,
          year,
          month
        );

      this.loading = false;
      this.toast.showToast('Ingresos/costos mensuales obtenidos correctamente', 'success');
    } catch (error) {
      console.error('Error al obtener ingresos/costos mensuales:', error);
      this.toast.showToast('Error al obtener ingresos/costos mensuales', 'error');
    }
  }

  // Limpiar filtro y obtener ingresos mensuales por defecto
  async clearMonthYearFilter() {
    this.selectedMonthYear = '';
    await this.getDefaultMonthlyRentIncomeByUser();
  }

  // Obtener ingresos mensuales por defecto (Sin filtro)
  async getDefaultMonthlyRentIncomeByUser() {
    try {
      this.loading = true;
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      this.monthlyRentIncome =
        await this.paymentService.getMonthlyRentIncomeByUser(
          this.currentUser.id,
          year,
          month
        );

      this.monthlyElectricityIncome =
        await this.paymentService.getMonthlyElectricityIncomeByUser(
          this.currentUser.id,
          year,
          month
        );

      this.monthlyGasIncome =
        await this.paymentService.getMonthlyGasIncomeByUser(
          this.currentUser.id,
          year,
          month
        );

      this.monthlyHoaIncome =
        await this.paymentService.getMonthlyHoaIncomeByUser(
          this.currentUser.id,
          year,
          month
        );

      this.monthlyWaterIncome =
        await this.paymentService.getMonthlyWaterIncomeByUser(
          this.currentUser.id,
          year,
          month
        );

      this.quantityOfPaymentsByUser =
        await this.paymentService.getQuantityOfPaymentsByUser(
          this.currentUser.id,
          year,
          month
        );

      this.loading = false;
    } catch (error) {
      console.error('Error al obtener ingresos/costos mensuales:', error);
      this.toast.showToast('Error al obtener ingresos/costos mensuales', 'error');
      this.loading = true;
    }
  }
}
