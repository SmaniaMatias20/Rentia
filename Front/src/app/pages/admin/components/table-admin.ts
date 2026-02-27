import { Component } from '@angular/core';
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
  styleUrl: './table-admin.css',
})
export class TableAdmin {

  // ================= STATE =================

  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  // ================= COLUMNS =================

  columns: Column[] = [
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'role', label: 'Rol', type: 'role' },
    { key: 'created_at', label: 'Fecha creación', type: 'date' },
    { key: 'active', label: 'Estado', type: 'status' }
  ];

  // ================= DATA (GENÉRICA) =================

  data: any[] = [
    {
      id: 1,
      name: 'Matias Smania',
      email: 'matias@email.com',
      role: 'admin',
      created_at: new Date(),
      active: true,
      numero: 123456789,
      fecha: new Date(),
      direccion: 'Calle 123...',
      telefono: '+54 123456789',
    },
    {
      id: 2,
      name: 'Juan Perez',
      email: 'juan@email.com',
      role: 'user',
      created_at: new Date(),
      active: false,
      numero: 987654321,
      fecha: new Date(),
      direccion: 'Otra calle...',
      telefono: '+54 987654321',
    }
  ];

  // ================= FILTER =================

  get filteredData(): any[] {
    return this.data.filter((row: any) =>
      Object.values(row).some((value: any) =>
        value?.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  }

  // ================= PAGINATION =================

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage) || 1;
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  // ================= HELPERS =================

  formatDate(date: any): string {
    return new Date(date).toLocaleDateString();
  }

  getValue(row: any, column: Column) {
    return row[column.key];
  }

  // ================= ACTIONS =================

  toggleStatus(row: any): void {
    if (row.hasOwnProperty('active')) {
      row.active = !row.active;
    }
  }

  editUser(row: any): void {
    console.log('Editar', row);
  }

}