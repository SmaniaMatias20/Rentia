import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

interface Column {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'status' | 'role';
}

@Component({
  selector: 'app-table-admin',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './table-admin.html',
  styleUrls: ['./table-admin.css'],
})
export class TableAdmin {
  @Input() data: any[] = [];

  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor() { }

  // ================= COLUMNS DINÁMICAS =================
  get columns(): Column[] {
    if (this.data.length === 0) return [];
    const first = this.data[0];
    return Object.keys(first)
      .filter(key => key !== 'password' && key !== 'image_url' && key !== 'url_image') // <- ignorar columnas
      .map((key) => {
        let type: Column['type'] = 'text';

        if (key.toLowerCase().includes('date') || key === 'created_at') type = 'date';
        else if (key === 'active' || key === 'is_enabled') type = 'status';
        else if (key === 'role') type = 'role';

        return { key, label: this.formatLabel(key), type };
      });
  }

  private formatLabel(key: string) {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // ================= FILTRO =================
  get filteredData(): any[] {
    return this.data.filter((row) =>
      Object.values(row).some((value: any) =>
        value?.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  }

  // ================= PAGINACIÓN =================
  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage) || 1;
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  // ================= HELPERS =================
  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  getValue(row: any, column: Column) {
    return row[column.key];
  }

  // ================= ACTIONS =================
  toggleStatus(row: any): void {
    if (row.hasOwnProperty('active')) {
      row.active = !row.active;
    } else if (row.hasOwnProperty('is_enabled')) {
      row.is_enabled = !row.is_enabled;
    }
  }

  editUser(row: any): void {
    console.log('Editar', row);
  }
}