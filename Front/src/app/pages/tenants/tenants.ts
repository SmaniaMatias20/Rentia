import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CardTenant } from './components/card-tenant/card-tenant';
import { FormTenant } from './components/form-tenant/form-tenant';
import { TenantService } from '../../services/tenant/tenant';
import { AuthService } from '../../services/auth/auth';
import { Spinner } from '../../components/spinner/spinner';
import { Toast } from '../../components/toast/toast';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tenants',
  imports: [CardTenant, FormTenant, Spinner, Toast, FormsModule],
  templateUrl: './tenants.html',
  styleUrl: './tenants.css',
})
export class Tenants {
  @ViewChild('toast') toast!: Toast;
  loading = false;
  formTenant = false;
  tenants: any[] = [];
  user: any;
  filter: string = 'active';

  constructor(private router: Router, private tenant: TenantService, private auth: AuthService) {
    this.user = this.auth.getCurrentUser();
  }

  ngOnInit() {
    this.loadUserAndTenants();
  }

  async loadUserAndTenants() {
    try {
      this.loading = true;
      this.user = await this.auth.getCurrentUser();

      if (this.user) {
        this.loadTenants();
      }
    } catch (error) {
      console.error('Error al cargar usuario y tenants:', error);
      this.loading = false;
    }
  }

  async loadTenants() {
    this.loading = true;
    this.tenants = await this.tenant.getTenantsByUser(this.user.id, this.filter);
    this.loading = false;
  }

  onTenantCreated() {
    this.loadTenants();
    this.formTenant = false;
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  openFormTenant() {
    this.formTenant = true;
  }

  async removeTenant(id: number) {
    try {
      await this.tenant.deleteTenant(id);
      this.loadTenants();
      this.toast.showToast('Inquilino eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar tenant:', error);
      this.toast.showToast('Error al eliminar inquilino', 'error');
    }
  }

  async isTenantEnabled(tenant: any) {
    try {
      await this.tenant.toggleTenant(tenant);
      this.loadTenants();
      this.toast.showToast('Inquilino activado correctamente', 'success');
    } catch (error) {
      console.error('Error al activar tenant:', error);
      this.toast.showToast('Error al activar tenant', 'error');
    }
  }

  onFilterChange() {
    this.loadTenants();
  }

}
