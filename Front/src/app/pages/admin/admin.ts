import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TableAdmin } from './components/table-admin';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property/property';
import { TenantService } from '../../services/tenant/tenant';
import { PaymentService } from '../../services/payment/payment';
import { ContractService } from '../../services/contract/contract';
import { Spinner } from '../../components/spinner/spinner';
import { firstValueFrom } from 'rxjs';



@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, TableAdmin, Spinner],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class Admin {
  loading = false;
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
          this.loading = true;
          this.tableData = await this.tenantService.getAll();
          this.loading = false;
          console.log(this.tableData);
          break;
        case 'properties':
          this.loading = true;
          this.tableData = await this.propertyService.getAll();
          this.loading = false;
          console.log(this.tableData);
          break;
        case 'payments':
          this.loading = true;
          this.tableData = await this.paymentService.getAll();
          this.loading = false;
          console.log(this.tableData);
          break;
        case 'contracts':
          this.loading = true;
          this.tableData = await firstValueFrom(this.contractService.getAll());
          this.loading = false;
          console.log(this.tableData);
          break;
        case 'transactions':
          this.loading = true;
          this.tableData = await this.paymentService.getAllTransactions();
          this.loading = false;
          console.log(this.tableData);
          break;
        case 'comments':
          this.loading = true;
          this.tableData = await this.tenantService.getAllComments();
          this.loading = false;
          console.log(this.tableData);
          break;
        default:
          this.tableData = [];
          this.loading = false;
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      this.tableData = [];
      this.loading = false;
    }
  }

  // Si querés que cargue los datos al iniciar la página
  ngOnInit() {
    this.onTableChange();
  }
}