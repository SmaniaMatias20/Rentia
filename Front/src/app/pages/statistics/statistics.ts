import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PropertyService } from '../../services/property/property';
import { AuthService } from '../../services/auth/auth';
import { Spinner } from '../../components/spinner/spinner';

@Component({
  selector: 'app-statistics',
  imports: [Spinner],
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

  constructor(private router: Router, private propertyService: PropertyService, private auth: AuthService) {
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    try {
      this.currentUser = await this.auth.getCurrentUser();
      this.quantityOfPropertiesByUser = await this.propertyService.getQuantityOfPropertiesByUser(this.currentUser.id);
      this.quantityOfPropertiesWithoutTenantByUser = await this.propertyService.getQuantityOfPropertiesWithoutTenantByUser(this.currentUser.id);
      this.quantityOfPropertiesWithTenantByUser = await this.propertyService.getQuantityOfPropertiesWithTenantByUser(this.currentUser.id);

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
