import { Component, EventEmitter, Output, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth';
import { TenantService } from '../../../../services/tenant/tenant';
import { PropertyService } from '../../../../services/property/property';
import { ContractService } from '../../../../services/contract/contract';
import { Toast } from '../../../../components/toast/toast';

@Component({
  selector: 'app-form-contract',
  imports: [Toast, ReactiveFormsModule],
  templateUrl: './form-contract.html',
  styleUrl: './form-contract.css',
})
export class FormContract implements OnInit {

  @ViewChild('toast') toast!: Toast;

  @Output() closeForm = new EventEmitter<void>();
  @Output() createContract = new EventEmitter<void>();

  contractForm: FormGroup;
  submitting = false;

  properties: any[] = [];
  tenants: any[] = [];
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private tenantService: TenantService,
    private propertyService: PropertyService,
    private contractService: ContractService
  ) {
    this.contractForm = this.fb.group({
      property_id: ['', Validators.required],
      tenant_id: ['', Validators.required],
      rent_amount: ['', [Validators.required, Validators.min(1)]],
      currency: ['ARS', Validators.required],
      increase_percentage: ['', [Validators.required, Validators.min(0)]],
      increase_frequency: ['quarterly', Validators.required],
      valid_from: ['', Validators.required],
      valid_to: ['']
    }, {
      validators: this.dateRangeValidator
    });

  }

  get f() {
    return this.contractForm.controls;
  }

  async ngOnInit() {
    this.currentUser = await this.auth.getCurrentUser();
    if (!this.currentUser) return;

    this.properties = await this.propertyService.getProperties(this.currentUser.id);
    this.tenants = await this.tenantService.getTenantsByUser(this.currentUser.id);
  }

  async submit() {
    if (this.contractForm.invalid) {
      this.contractForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    try {
      this.contractForm.value.owner_id = this.currentUser.id;
      const response = await this.contractService.createContract(this.contractForm.value);

      if (response.error && response.error.message) {
        this.toast.showToast(response.error.message, 'error');
        return;
      }

      this.toast.showToast('Contrato creado correctamente', 'success');
      this.contractForm.reset();
      this.createContract.emit();

      setTimeout(() => this.close(), 1200);

    } catch (error) {
      this.toast.showToast('Error al crear contrato', 'error');
    } finally {
      this.submitting = false;
    }
  }

  close() {
    this.contractForm.reset();
    this.closeForm.emit();
  }

  dateRangeValidator(group: FormGroup) {
    const from = group.get('valid_from')?.value;
    const to = group.get('valid_to')?.value;

    if (!from || !to) return null;

    return new Date(from) > new Date(to)
      ? { invalidDateRange: true }
      : null;
  }

}
