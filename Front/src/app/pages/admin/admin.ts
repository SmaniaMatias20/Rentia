import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TableAdmin } from './components/table-admin';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property/property';
import { TenantService } from '../../services/tenant/tenant';
import { PaymentService } from '../../services/payment/payment';
import { ContractService } from '../../services/contract/contract';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, TableAdmin],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class Admin {
  selectedTable = 'tenants'; // valor inicial
  tableData: any[] = [];      // aquí guardamos los datos del fetch

  constructor(
    private router: Router,
    private propertyService: PropertyService,
    private tenantService: TenantService,
    private paymentService: PaymentService,
    private contractService: ContractService,
  ) { }

  goToHome() {
    this.router.navigate(['/home']);
  }

  async onTableChange(event?: Event) {
    try {
      switch (this.selectedTable) {
        case 'tenants':
          this.tableData = await this.tenantService.getAll();
          console.log(this.tableData);
          break;
        case 'properties':
          this.tableData = await this.propertyService.getAll()
          console.log(this.tableData);
          break;
        case 'payments':
          this.tableData = await this.paymentService.getAll()
          console.log(this.tableData);
          break;
        case 'contracts':
          this.tableData = await this.contractService.getAll()
          console.log(this.tableData);
          break;
        default:
          this.tableData = [];
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      this.tableData = [];
    }
  }

  // Si querés que cargue los datos al iniciar la página
  ngOnInit() {
    this.onTableChange();
  }
}