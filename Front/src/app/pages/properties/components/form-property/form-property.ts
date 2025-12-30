import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Toast } from '../../../../components/toast/toast';
import { Auth } from '../../../../services/auth/auth';
import { Property } from '../../../../services/property/property';


@Component({
  selector: 'app-form-property',
  imports: [Toast, ReactiveFormsModule],
  templateUrl: './form-property.html',
  styleUrls: ['./form-property.css'],
})
export class FormProperty {
  @ViewChild('toast') toast!: Toast;
  propertyForm: FormGroup;
  submitting = false;
  @Output() closeForm = new EventEmitter<void>();
  @Output() createProperty = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private property: Property,
  ) {
    // Inicializamos el formulario reactivo
    this.propertyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      value: ['', [Validators.required, Validators.pattern(/^\d+$/)]], // solo números
    });
  }

  // Getters para acceder a los controles desde el template
  get name() { return this.propertyForm.get('name'); }
  get address() { return this.propertyForm.get('address'); }
  get value() { return this.propertyForm.get('value'); }

  // Guardar propiedad
  async submit() {
    if (this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const currentUser = await this.auth.getCurrentUser();
    if (!currentUser) {
      this.toast.showToast('No hay usuario logueado', 'error');
      this.submitting = false;
      return;
    }

    const user_id = currentUser.id;
    const { name, address, value } = this.propertyForm.value;

    const { error } = await this.property.createProperty({ user_id, name, address, value });

    if (error) {
      this.toast.showToast('Error al guardar la propiedad', 'error');
      this.submitting = false;
      return;
    }

    this.toast.showToast('Propiedad creada correctamente', 'success');
    this.propertyForm.reset();
    this.submitting = false;

    setTimeout(() => {
      this.createProperty.emit();
      this.close();
    }, 3000);
  }

  close() {
    this.propertyForm.reset();
    this.closeForm.emit();
  }
}
