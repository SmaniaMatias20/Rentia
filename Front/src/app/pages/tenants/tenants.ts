import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CardTenant } from './components/card-tenant/card-tenant';
import { FormTenant } from './components/form-tenant/form-tenant';

@Component({
  selector: 'app-tenants',
  imports: [CardTenant, FormTenant],
  templateUrl: './tenants.html',
  styleUrl: './tenants.css',
})
export class Tenants {
  formTenant = false;

  constructor(private router: Router) { }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  openFormTenant() {
    this.formTenant = true;
  }

}
