import { Component, EventEmitter, Output, ViewChild, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth';
import { TenantService } from '../../../../services/tenant/tenant';
import { PropertyService } from '../../../../services/property/property';
import { Toast } from '../../../../components/toast/toast';

@Component({
  selector: 'app-form-tenant',
  templateUrl: './form-tenant.html',
  styleUrls: ['./form-tenant.css'],
  imports: [ReactiveFormsModule, Toast],
})
export class FormTenant implements OnInit {
  @ViewChild('toast') toast!: Toast;

  @Output() closeForm = new EventEmitter<void>();
  @Output() createTenant = new EventEmitter<void>();

  tenantForm: FormGroup;
  submitting = false;

  properties: any[] = []; // ⬅️ propiedades del usuario

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private tenant: TenantService,
    private propertyService: PropertyService
  ) {
    this.tenantForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
      email: ['', [Validators.email]],
      role: ['tenant'],
      property_id: ['', Validators.required],
    });

  }

  get f() {
    return this.tenantForm.controls;
  }

  async ngOnInit() {
    const currentUser = await this.auth.getCurrentUser();
    if (!currentUser) return;

    this.properties = await this.propertyService.getProperties(currentUser.id);
  }

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

    const { username, phone, email, property_id, role } = this.tenantForm.value;

    const { error } = await this.tenant.createTenant({
      username,
      phone,
      email,
      role,
    });

    if (error) {
      this.toast.showToast('Error al guardar el inquilino', 'error');
      this.submitting = false;
      return;
    }

    this.toast.showToast('Inquilino creado correctamente', 'success');
    this.tenantForm.reset();
    this.submitting = false;

    setTimeout(() => {
      this.createTenant.emit();
      this.close();
    }, 2000);
  }

  close() {
    this.tenantForm.reset();
    this.closeForm.emit();
  }
}
