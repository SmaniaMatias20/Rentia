import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Spinner } from '../../components/spinner/spinner';
import { Toast } from '../../components/toast/toast';
import { TenantService } from '../../services/tenant/tenant';

import { CreateComment } from './components/create-comment/create-comment';
import { ShowComment } from './components/show-comment/show-comment';

type EditType = 'username' | 'email' | 'phone';

@Component({
  selector: 'app-tenant',
  imports: [NgClass, Spinner, Toast, FormsModule, CreateComment, ShowComment],
  templateUrl: './tenant.html',
  styleUrl: './tenant.css',
})
export class Tenant {
  loading = false;
  tenantData: any;
  comments: string[] = []; // Lista de comentarios

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

      const id = this.route.snapshot.paramMap.get('id') || '';
      this.tenantData = await this.tenantService.getTenant(id);

      // 👉 Traer comentarios del inquilino
      this.comments = await this.tenantService.getCommentsByTenant(id);

      this.loading = false;
    } catch (error) {
      console.error(error);
      this.loading = false;
    }
  }

  goToTenants() {
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

  async onSaveComment(newComment: any) {
    try {
      this.loading = true;
      console.log('Comentario guardado:', newComment);

      // 👉 Guardar comentario en el backend
      await this.tenantService.saveComment(this.tenantData.id, newComment);

      // 🔁 Actualizar la lista local de comentarios para reflejarlo inmediatamente
      this.comments.push(newComment);

      this.toast.showToast('Comentario guardado correctamente', 'success');
    } catch (error) {
      console.error(error);
      this.toast.showToast('Error al guardar el comentario', 'error');
    } finally {
      this.loading = false;
    }
  }
}
