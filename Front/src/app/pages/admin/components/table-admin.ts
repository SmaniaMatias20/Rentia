import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ModalConfirm } from '../../../components/modal-confirm/modal-confirm';

interface Column {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'status' | 'role' | 'currency' | 'increase_frequency';
}

@Component({
  selector: 'app-table-admin',
  standalone: true,
  imports: [NgClass, FormsModule, ModalConfirm],
  templateUrl: './table-admin.html',
  styleUrls: ['./table-admin.css'],
})
export class TableAdmin {
  @Input() data: any[] = [];

  searchTerm: string = '';
  currentPage = 1;
  itemsPerPage = 10;

  openConfirmModal: boolean = false;

  constructor() { }

  // ================= TRADUCCIONES =================

  private columnsTranslate: Record<string, string> = {
    created_at: 'Creado el',
    currency: 'Moneda',
    id: 'ID',
    increase_frequency: 'Frecuencia de aumento',
    increase_percentage: 'Porcentaje de aumento',
    owner_id: 'Id propietario',
    property_id: 'Id propiedad',
    rent_amount: 'Monto del alquiler',
    status: 'Estado',
    tenant_id: 'Id inquilino',
    valid_from: 'Válido desde',
    valid_to: 'Válido hasta',
    cuit: 'CUIT',
    document: 'Documento',
    email: 'Correo electrónico',
    firstname: 'Nombre',
    lastname: 'Apellido',
    password: 'Contraseña',
    phone: 'Teléfono',
    role: 'Rol',
    username: 'Usuario',
    contract_id: 'ID del contrato',
    description: 'Descripción',
    electricy: 'Electricidad',
    electricy_amount: 'Monto electricidad',
    gas: 'Gas',
    gas_amount: 'Monto gas',
    hoa_fees: 'Expensas',
    hoa_fees_amount: 'Monto expensas',
    payment_method: 'Método de pago',
    rent_month: 'Mes de alquiler',
    total_rent_amount: 'Total alquiler',
    water: 'Agua',
    water_amount: 'Monto agua',
    is_enabled: 'Activo',
    user_id: 'Usuario',
    rooms: 'Habitaciones',
    floor: 'Piso',
    type: 'Tipo',
    address: 'Dirección',
    name: 'Nombre',
    amount: 'Monto',
    payment_id: 'ID de pago',
    content: 'Contenido',
    show: 'Mostrar',
    is_read: 'Leído',
  };

  // Mapa de traducción de valores
  private valuesTranslate: Record<string, string> = {
    monthly: 'Mensual',
    bimonthly: 'Bimestral',
    quarterly: 'Trimestral',
    four_monthly: 'Cuatrimestral',
    semiannual: 'Semestral',
    annual: 'Anual',
    tenant: 'Inquilino',
    admin: 'Administrador',
    owner: 'Propietario',
  };

  // Función para obtener el label traducido
  private columnTranslate(key: string): string {
    return this.columnsTranslate[key] || this.formatLabel(key);
  }



  // ================= COLUMNS DINÁMICAS =================
  get columns(): Column[] {
    if (this.data.length === 0) return [];
    const first = this.data[0];
    return Object.keys(first)
      .filter(key => key !== 'password' && key !== 'image_url' && key !== 'url_image')
      .map((key) => {
        let type: Column['type'] = 'text';
        if (key.toLowerCase().includes('date') || ['created_at', 'valid_from', 'valid_to', 'rent_month'].includes(key)) type = 'date';
        else if (['active', 'is_enabled', 'status'].includes(key)) type = 'status';
        else if (key === 'role') type = 'role';
        else if (key === 'currency') type = 'currency';
        else if (key === 'increase_frequency') type = 'increase_frequency';

        return {
          key,
          label: this.columnTranslate(key),
          type
        };
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
    // Si es la columna increase_frequency, traducimos el valor
    if (column.key === 'increase_frequency' || column.key === 'role') {
      return this.valuesTranslate[row[column.key]] || row[column.key];
    }

    // Para todo lo demás
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

  async delete(data: any): Promise<void> {
    console.log('Eliminar', data);
  }
}