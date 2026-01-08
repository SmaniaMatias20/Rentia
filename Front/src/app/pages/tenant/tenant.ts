import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { Spinner } from '../../components/spinner/spinner';
import { Toast } from '../../components/toast/toast';
import { TenantService } from '../../services/tenant/tenant';
// import { FormEditTenant } from './components/form-edit-tenant/form-edit-tenant';

type EditType = 'username' | 'email' | 'phone';

@Component({
  selector: 'app-tenant',
  imports: [NgClass, Spinner, Toast],
  templateUrl: './tenant.html',
  styleUrl: './tenant.css',
})
export class Tenant {
  loading = false;
  tenantData: any;

  formEditTenant = false;
  editType!: EditType;
  editValue: any;

  @ViewChild('toast') toast!: Toast;

  constructor(
    private tenantService: TenantService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    try {
      this.loading = true;

      const id = this.route.snapshot.paramMap.get('id');
      this.tenantData = await this.tenantService.getTenant(id || '');

      this.loading = false;
    } catch (error) {
      console.error(error);
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigateByUrl('/tenants');
  }

  openEdit(type: EditType, value: any) {
    this.editType = type;
    this.editValue = value;
    this.formEditTenant = true;
  }

  closeFormEditTenant() {
    this.formEditTenant = false;
  }

  // async onSave(newValue: any) {
  //   try {
  //     this.loading = true;

  //     await this.tenantService.updateTenant(
  //       this.tenantData.id,
  //       { [this.editType]: newValue }
  //     );

  //     // 🔁 actualizar UI sin recargar
  //     this.tenantData[this.editType] = newValue;

  //     this.closeFormEditTenant();
  //     this.toast.showToast('Inquilino actualizado correctamente', 'success');
  //   } catch (error) {
  //     console.error(error);
  //     this.toast.showToast('Error al actualizar el inquilino', 'error');
  //   } finally {
  //     this.loading = false;
  //   }
  // }
}
