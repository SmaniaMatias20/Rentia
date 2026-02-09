import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CardProperty } from './components/card-property/card-property';
import { FormProperty } from './components/form-property/form-property';
import { PropertyService } from '../../services/property/property';
import { AuthService } from '../../services/auth/auth';
import { Spinner } from '../../components/spinner/spinner';
import { Toast } from '../../components/toast/toast';


@Component({
  selector: 'app-properties',
  imports: [CardProperty, FormProperty, Spinner],
  templateUrl: './properties.html',
  styleUrl: './properties.css',
})
export class Properties {
  @ViewChild('toast') toast!: Toast;
  properties: any[] = [];
  loading = false;
  user: any;
  formProperty = false;

  constructor(private router: Router, private property: PropertyService, private auth: AuthService) {
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

  async removeProperty(id: number) {
    try {
      await this.property.deleteProperty(id);
      this.loadProperties();
      this.toast.showToast('Propiedad eliminada correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar propiedad:', error);
      this.toast.showToast('Error al eliminar propiedad', 'error');
    }
  }

  async isPropertyEnabled(property: any) {
    try {
      await this.property.toggleProperty(property);
      this.loadProperties();
      this.toast.showToast('Propiedad activada correctamente', 'success');
    } catch (error) {
      console.error('Error al activar propiedad:', error);
      this.toast.showToast('Error al activar propiedad', 'error');
    }
  }


}
