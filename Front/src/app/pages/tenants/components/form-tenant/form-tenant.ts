import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { Auth } from '../../../../services/auth/auth';
import { Tenant } from '../../../../services/tenant/tenant';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Toast } from '../../../../components/toast/toast';


@Component({
  selector: 'app-form-tenant',
  templateUrl: './form-tenant.html',
  styleUrls: ['./form-tenant.css'],
  imports: [ReactiveFormsModule, Toast],
})
export class FormTenant {
  @ViewChild('toast') toast!: Toast;
  tenantForm: FormGroup;
  submitting = false;
  @Output() closeForm = new EventEmitter<void>();
  @Output() createTenant = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private tenant: Tenant,
  ) {
    // Inicializamos el formulario reactivo
    this.tenantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
      email: ['', [Validators.email]],
    });
  }


  // getter para simplificar el acceso en el template
  get name() { return this.tenantForm.get('name'); }
  get phone() { return this.tenantForm.get('phone'); }
  get email() { return this.tenantForm.get('email'); }


  // Helper para acceder a los controles
  get f() {
    return this.tenantForm.controls;
  }

  // Guardar inquilino
  async submit() {
    if (this.tenantForm.invalid) {
      this.tenantForm.markAllAsTouched();
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
    const { name, phone, email } = this.tenantForm.value;

    const { error } = await this.tenant.createTenant({ user_id, name, phone, email });

    if (error) {
      this.toast.showToast('Error al guardar el inquilino');
      this.submitting = false;
      return;
    }

    this.toast.showToast('Inquilino creado correctamente', 'success');
    this.tenantForm.reset();
    this.submitting = false;
    setTimeout(() => {
      this.createTenant.emit();
      this.close();
    }, 3000);
  }

  close() {
    this.tenantForm.reset();
    this.closeForm.emit();
  }

}
