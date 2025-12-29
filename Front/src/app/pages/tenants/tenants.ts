import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CardTenant } from './components/card-tenant/card-tenant';

@Component({
  selector: 'app-tenants',
  imports: [CardTenant],
  templateUrl: './tenants.html',
  styleUrl: './tenants.css',
})
export class Tenants {

  constructor(private router: Router) { }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  goToNewTenant() {
    console.log('go to new tenant');
  }

}
