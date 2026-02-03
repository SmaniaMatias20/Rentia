import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-table-contracts',
  imports: [NgClass],
  templateUrl: './table-contracts.html',
  styleUrl: './table-contracts.css',
})
export class TableContracts {
  @Output() deleteContract = new EventEmitter<any>();
  @Input() contracts: any[] = [];
  currentDate: Date = new Date();

  formatFrequency(freq: string) {
    const map: any = {
      monthly: 'Mensual',
      quarterly: 'Trimestral',
      yearly: 'Anual'
    };
    return map[freq] || freq;
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('es-AR');
  }

  calculateCurrentRent(contract: any) {
    const base = contract.rent_amount;
    const percent = contract.increase_percentage / 100;

    const start = new Date(contract.valid_from);
    const now = new Date();

    // si hay fecha de fin, usar la menor entre hoy y valid_to
    const end = contract.valid_to ? new Date(contract.valid_to) : now;

    const effectiveDate = now > end ? end : now;

    let periods = 0;

    const monthsDiff =
      (effectiveDate.getFullYear() - start.getFullYear()) * 12 +
      (effectiveDate.getMonth() - start.getMonth());

    if (contract.increase_frequency === 'monthly') {
      periods = monthsDiff;
    }

    if (contract.increase_frequency === 'quarterly') {
      periods = Math.floor(monthsDiff / 3);
    }

    if (contract.increase_frequency === 'yearly') {
      periods = Math.floor(monthsDiff / 12);
    }

    return Math.round(base * Math.pow(1 + percent, Math.max(periods, 0)));
  }


  isExpiringSoon(contract: any): boolean {
    if (!contract.valid_to) return false;

    const now = new Date();
    const end = new Date(contract.valid_to);

    const diffMs = end.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // 3 meses exactos ≈ 90 días
    return diffDays <= 90 && diffDays >= 0;
  }

  isExpired(contract: any): boolean {
    if (!contract.valid_to) return false;

    const now = new Date();
    const end = new Date(contract.valid_to);

    const diffMs = end.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays <= -1;
  }





}
