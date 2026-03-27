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
          const { data: tenants, error: tenantsError } = await this.tenantService.getAll();

          if (tenantsError) {
            console.error('Error al obtener tenants:', tenantsError);
            return;
          }

          this.tableData = tenants;
          this.loading = false;
          console.log(this.tableData);
          break;
        case 'properties':
          this.loading = true;
          const { data: properties, error: propertiesError } =
            await this.propertyService.getAll();

          if (propertiesError) {
            console.error('Error:', propertiesError);
            this.tableData = [];
          } else {
            this.tableData = properties;
          }
          this.loading = false;
          console.log(this.tableData);
          break;
        case 'payments':
          this.loading = true;

          const { data: payments, error: paymentsError } =
            await this.paymentService.getAll();

          if (paymentsError) {
            console.error('Error:', paymentsError);
            this.tableData = [];
          } else {
            this.tableData = payments;
          }

          this.loading = false;
          break;
        case 'contracts':
          this.loading = true;
          const { data: contracts, error: contractsError } =
            await this.contractService.getAll();

          if (contractsError) {
            console.error('Error:', contractsError);
            this.tableData = [];
          } else {
            this.tableData = contracts;
          }
          this.loading = false;
          console.log(this.tableData);
          break;
        case 'transactions':
          this.loading = true;

          const { data: transactions, error: transactionsError } =
            await this.paymentService.getAllTransactions();

          if (transactionsError) {
            console.error('Error:', transactionsError);
            this.tableData = [];
          } else {
            this.tableData = transactions;
          }

          this.loading = false;
          break;
        case 'comments':
          this.loading = true;
          const { data, error } = await this.tenantService.getAllComments();
          if (error) {
            console.error('Error al obtener comentarios:', error);
            return;
          }
          this.tableData = data;
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