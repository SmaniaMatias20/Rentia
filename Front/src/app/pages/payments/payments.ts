import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Property {
  id: string;
  name: string;
  address: string;
}

interface MonthPayment {
  key: string;
  label: string;
  paid: boolean;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class Payments {

  constructor(private router: Router) { }

  properties: Property[] = [
    { id: '1', name: 'Departamento Centro', address: 'Av. Corrientes 123' },
    { id: '2', name: 'Casa Norte', address: 'Belgrano 456' },
  ];

  selectedProperty: Property | null = null;
  selectedYear: string | null = null;

  months: MonthPayment[] = [
    { key: '2026-01', label: 'Enero 2026', paid: true },
    { key: '2026-02', label: 'Febrero 2026', paid: false },
    { key: '2026-03', label: 'Marzo 2026', paid: false },
    { key: '2026-04', label: 'Abril 2026', paid: true },
    { key: '2026-05', label: 'Mayo 2026', paid: false },
    { key: '2026-06', label: 'Junio 2026', paid: false },
    { key: '2026-07', label: 'Julio 2026', paid: true },
    { key: '2026-08', label: 'Agosto 2026', paid: false },
    { key: '2026-09', label: 'Septiembre 2026', paid: false },
    { key: '2026-10', label: 'Octubre 2026', paid: true },
    { key: '2026-11', label: 'Noviembre 2026', paid: false },
    { key: '2026-12', label: 'Diciembre 2026', paid: false },
  ];

  years = Array.from({ length: 12 }, (_, i) => 2026 + i);

  onPropertyChange(propertyId: string) {
    this.selectedProperty =
      this.properties.find(p => p.id === propertyId) || null;
  }

  onYearChange(year: string) {
    this.selectedYear = year;
  }

  togglePayment(month: MonthPayment) {
    month.paid = !month.paid;
  }

  get paidCount() {
    return this.months.filter(m => m.paid).length;
  }

  get unpaidCount() {
    return this.months.filter(m => !m.paid).length;
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }
}
