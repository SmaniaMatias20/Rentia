import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CardProperty } from './components/card-property/card-property';
import { FormProperty } from './components/form-property/form-property';
import { Property } from '../../services/property/property';
import { Auth } from '../../services/auth/auth';
import { Spinner } from '../../components/spinner/spinner';


@Component({
  selector: 'app-properties',
  imports: [CardProperty, FormProperty, Spinner],
  templateUrl: './properties.html',
  styleUrl: './properties.css',
})
export class Properties {
  properties: any[] = [];
  loading = false;
  user: any;
  formProperty = false;

  constructor(private router: Router, private property: Property, private auth: Auth) {
    this.user = this.auth.getCurrentUser();
  }

  ngOnInit() {
    this.loadUserAndProperties();
  }

  async loadUserAndProperties() {
    try {
      this.loading = true;
      this.user = await this.auth.getCurrentUser();

      if (this.user) {
        this.loadProperties();
      }
    } catch (error) {
      console.error('Error al cargar usuario y propiedades:', error);
      this.loading = false;
    }
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  openFormProperty() {
    this.formProperty = true;
  }

  async loadProperties() {
    this.loading = true;
    this.properties = await this.property.getProperties(this.user.id);
    this.loading = false;
  }

  onPropertyCreated() {
    this.loadProperties();
    this.formProperty = false;
  }

  goToNewProperty() {
    this.openFormProperty();
  }



}
