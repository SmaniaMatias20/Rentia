import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../services/property/property';
import { AuthService } from '../../services/auth/auth';



@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payments.html',
  styleUrls: ['./payments.css'],
})
export class Payments {
  properties: any[] = [];
  currentUser: any;

  constructor(private router: Router, private propertyService: PropertyService, private authService: AuthService) { }

  async ngOnInit() {
    try {
      this.currentUser = await this.authService.getCurrentUser();
      this.properties = await this.propertyService.getProperties(this.currentUser.id);
      console.log(this.properties);

    } catch (error) {
      console.error(error);
    }


  }

  selectedProperty: any | null = null;
  selectedYear: string | null = null;

  months: any[] = [];

  years = Array.from({ length: 12 }, (_, i) => 2026 + i);

  onPropertyChange(propertyId: string) {
    this.selectedProperty = this.properties.find(p => p.id === propertyId) || null;
    this.generateMonths();
  }

  onYearChange(year: string) {
    this.selectedYear = year;
    this.generateMonths();
  }

  togglePayment(month: any) {
    month.paid = !month.paid;
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  // Método para generar meses dinámicamente según el año seleccionado
  private generateMonths() {
    if (!this.selectedYear || !this.selectedProperty) {
      this.months = [];
      return;
    }

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    this.months = monthNames.map((name, index) => ({
      key: `${this.selectedYear}-${String(index + 1).padStart(2, '0')}`,
      label: `${name} ${this.selectedYear}`,
      paid: false,
      totalRent: this.selectedProperty.value || 0,
      additionalCosts: this.selectedProperty.additional_costs || 0,
    }));
  }


  get paidCount() {
    return this.months.filter(m => m.paid).length;
  }

  get unpaidCount() {
    return this.months.filter(m => !m.paid).length;
  }
}
