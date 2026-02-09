import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PropertyService } from '../../services/property/property';
import { AuthService } from '../../services/auth/auth';
import { Spinner } from '../../components/spinner/spinner';
import { TenantService } from '../../services/tenant/tenant';
import { CardStatistic } from './components/card-statistic/card-statistic';

@Component({
  selector: 'app-statistics',
  imports: [Spinner, CardStatistic],
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
  quantityOfTenants: number = 0;
  totalRent: number = 0;
  averageRent: number = 0;
  highestRent: number = 0;
  lowestRent: number = 0;

  constructor(private router: Router, private propertyService: PropertyService, private auth: AuthService, private tenantService: TenantService) {
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    try {
      // Obtener el usuario actual
      this.currentUser = await this.auth.getCurrentUser();
      // Obtener la cantidad de propiedades por usuario
      this.quantityOfPropertiesByUser = await this.propertyService.getQuantityOfPropertiesByUser(this.currentUser.id);
      // Obtener la cantidad de propiedades con inquilino 
      this.quantityOfPropertiesWithTenantByUser = await this.propertyService.getQuantityOfPropertiesWithTenantByUser(this.currentUser.id);
      // Obtener la cantidad de propiedades sin inquilino
      this.quantityOfPropertiesWithoutTenantByUser = this.quantityOfPropertiesByUser - this.quantityOfPropertiesWithTenantByUser;
      // Obtener la cantidad de inquilinos por usuario
      this.quantityOfTenants = await this.tenantService.getQuantityOfTenantsByUser(this.currentUser.id);
      // Obtener el total de alquileres por usuario
      this.totalRent = await this.propertyService.getTotalRentByUser(this.currentUser.id);
      // Obtener el promedio de alquiler por usuario
      this.averageRent = this.totalRent / this.quantityOfPropertiesByUser;
      // Obtener el máximo de alquiler por usuario
      this.highestRent = await this.propertyService.getHighestRentByUser(this.currentUser.id);
      // Obtener el mínimo de alquiler por usuario
      this.lowestRent = await this.propertyService.getLowestRentByUser(this.currentUser.id);

      this.calculatePercentageOfPropertiesWithTenantByUser();
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


}
