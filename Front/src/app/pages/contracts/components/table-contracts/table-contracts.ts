import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table-contracts',
  imports: [NgClass, FormsModule],
  templateUrl: './table-contracts.html',
  styleUrl: './table-contracts.css',
})
export class TableContracts {
  @Output() updateContractStatus = new EventEmitter<any>();
  @Input() contracts: any[] = [];
  currentDate: Date = new Date();
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 8;

  get filteredContracts() {
    if (!this.searchTerm.trim()) return this.contracts;

    const term = this.searchTerm.toLowerCase();

    return this.contracts.filter(contract => {
      // 🔹 estado legible
      const statusText = contract.status ? 'activo' : 'inactivo';

      // 🔹 vigencia legible
      let vigenciaText = 'en curso';
      if (this.isExpired(contract)) vigenciaText = 'vencido';
      else if (this.isExpiringSoon(contract)) vigenciaText = 'por vencer';
      else if (this.isPending(contract)) vigenciaText = 'pendiente';

      // 🔹 frecuencia legible
      const freqText = this.formatFrequency(contract.increase_frequency);

      // 🔹 juntar todo lo buscable
      const searchable = [
        contract.property_name,
        contract.tenant_name,
        contract.rent_amount,
        contract.increase_percentage,
        freqText,
        this.calculateCurrentRent(contract),
        this.formatDate(contract.valid_from),
        this.formatDate(contract.valid_to),
        statusText,
        vigenciaText
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(term);
    });
  }


  get paginatedContracts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredContracts.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredContracts.length / this.itemsPerPage) || 1;
  }

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
    if (this.isPending(contract)) return false;

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

  isPending(contract: any): boolean {
    if (!contract.valid_from) return false;

    const now = new Date();
    const end = new Date(contract.valid_from);

    // esta pendiente si la fecha de hoy es menor a la fecha de comienzo
    return now < end;
  }

}
