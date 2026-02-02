import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-table-contracts',
  templateUrl: './table-contracts.html',
  styleUrl: './table-contracts.css',
})
export class TableContracts {
  @Output() deleteContract = new EventEmitter<any>();
  @Input() contracts: any[] = [];

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

    let periods = 0;

    if (contract.increase_frequency === 'monthly') {
      periods = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    }
    if (contract.increase_frequency === 'quarterly') {
      periods = Math.floor(((now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())) / 3);
    }
    if (contract.increase_frequency === 'yearly') {
      periods = now.getFullYear() - start.getFullYear();
    }

    return Math.round(base * Math.pow(1 + percent, Math.max(periods, 0)));
  }



}
