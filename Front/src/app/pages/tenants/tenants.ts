import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CardTenant } from './components/card-tenant/card-tenant';
import { FormTenant } from './components/form-tenant/form-tenant';
import { Tenant } from '../../services/tenant/tenant';
import { Auth } from '../../services/auth/auth';
import { Spinner } from '../../components/spinner/spinner';

@Component({
  selector: 'app-tenants',
  imports: [CardTenant, FormTenant, Spinner],
  templateUrl: './tenants.html',
  styleUrl: './tenants.css',
})
export class Tenants {
  loading = false;
  formTenant = false;
  tenants: any[] = [];
  user: any;

  constructor(private router: Router, private tenant: Tenant, private auth: Auth) {
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
    this.tenants = await this.tenant.getTenants(this.user.id);
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

}
