import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PropertyService } from '../../services/property/property';
import { AuthService } from '../../services/auth/auth';
import { Spinner } from '../../components/spinner/spinner';
import { TenantService } from '../../services/tenant/tenant';
import { ContractService } from '../../services/contract/contract';
import { CardStatistic } from './components/card-statistic/card-statistic';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-statistics',
  imports: [Spinner, CardStatistic, FormsModule],
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.css']
})
export class Statistics {
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
  totalRent: number = 0;
  averageRent: number = 0;
  highestRent: number = 0;
  lowestRent: number = 0;
  selectedMonthYear: string = '';

  constructor(private router: Router, private propertyService: PropertyService, private auth: AuthService, private tenantService: TenantService, private contractService: ContractService) {
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    try {
      // Obtener el usuario actual
      this.currentUser = await this.auth.getCurrentUser();
      // Obtener la cantidad de propiedades por usuario
      this.quantityOfPropertiesByUser = await this.propertyService.getQuantityOfPropertiesByUser(this.currentUser.id);
      // Obtener la cantidad de propiedades con inquilino 
      this.quantityOfPropertiesWithTenantByUser = await this.propertyService.getQuantityOfPropertiesWithActiveTenantByUser(this.currentUser.id);
      // Obtener la cantidad de propiedades sin inquilino
      this.quantityOfPropertiesWithoutTenantByUser = this.quantityOfPropertiesByUser - this.quantityOfPropertiesWithTenantByUser;
      // Obtener la cantidad de inquilinos por usuario
      this.quantityOfTenantsByUser = await this.tenantService.getQuantityOfTenantsByUser(this.currentUser.id);
      // // Obtener el máximo de alquiler por usuario
      this.highestRent = await this.contractService.getHighestRentByUser(this.currentUser.id);
      // Obtener el mínimo de alquiler por usuario
      this.lowestRent = await this.contractService.getLowestRentByUser(this.currentUser.id);
      // Obtener la cantidad de contratos activos por usuario
      this.quantityOfActiveContractsByUser = await this.contractService.getQuantityOfActiveContractsByUser(this.currentUser.id);
      // Obtener la cantidad de contratos por vencer por usuario
      this.quantityOfContractsToVenceByUser = await this.contractService.getQuantityOfContractsToVenceByUser(this.currentUser.id);
      // Obtener la cantidad de contratos vencidos por usuario
      this.quantityOfContractsVencedByUser = await this.contractService.getQuantityOfContractsVencedByUser(this.currentUser.id);
      // Calcular el porcentaje de propiedades con inquilino
      this.calculatePercentageOfPropertiesWithTenantByUser();
      // Calcular el porcentaje de propiedades sin inquilino
      this.calculatePercentageOfPropertiesWithoutTenantByUser();
    } catch (error) {
      console.error('Error al obtener usuario:', error);
    } finally {
      this.loading = false;
    }
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  calculatePercentageOfPropertiesWithTenantByUser() {
    this.percentageOfPropertiesWithTenantByUser = Math.round(
      (this.quantityOfPropertiesWithTenantByUser /
        this.quantityOfPropertiesByUser) *
      100
    );
  }

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

  applyMonthYearFilter() {
    console.log('Filtro aplicado:', this.selectedMonthYear);
  }

  clearMonthYearFilter() {
    this.selectedMonthYear = '';
    console.log('Filtro eliminado');

  }
}
