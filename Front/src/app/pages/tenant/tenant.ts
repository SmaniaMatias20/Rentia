import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormEditTenant } from './components/form-edit-tenant/form-edit-tenant';
import { Spinner } from '../../components/spinner/spinner';
import { Toast } from '../../components/toast/toast';
import { TenantService } from '../../services/tenant/tenant';
import { AuthService } from '../../services/auth/auth';

import { CreateComment } from './components/create-comment/create-comment';
import { ShowComment } from './components/show-comment/show-comment';

type EditType = 'username' | 'email' | 'phone' | 'firstname' | 'lastname' | 'document' | 'cuit';

@Component({
  selector: 'app-tenant',
  imports: [NgClass, Spinner, Toast, FormsModule, CreateComment, ShowComment, FormEditTenant],
  templateUrl: './tenant.html',
  styleUrl: './tenant.css',
})
export class Tenant {
  loading = false;
  tenantData: any;
  comments: string[] = [];
  formEditTenant = false;
  editType!: EditType;
  editValue: any;
  user: any;
  currentCommentPage: number = 1;
  commentsPerPage: number = 3;
  @ViewChild('toast') toast!: Toast;

  constructor(
    private tenantService: TenantService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  get paginatedComments() {
    const startIndex = (this.currentCommentPage - 1) * this.commentsPerPage;
    const endIndex = startIndex + this.commentsPerPage;
    return this.comments.slice(startIndex, endIndex);
  }

  get totalCommentPages(): number {
    return Math.ceil(this.comments.length / this.commentsPerPage) || 1;
  }


  async ngOnInit() {
    try {
      this.loading = true;

      const id = this.route.snapshot.paramMap.get('id') || '';
      this.tenantData = await this.tenantService.getTenant(id);
      console.log(this.tenantData);
      this.user = await this.authService.getCurrentUser();

      // 👉 Traer comentarios del inquilino
      const { data: comments, error: commentsError } = await this.tenantService.getCommentsByTenant(id);
      if (commentsError) {
        console.error('Error al obtener comentarios:', commentsError);
        this.toast.showToast(commentsError, 'error');
        return;
      }

      this.comments = comments;
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

      // 👉 Guardar comentario en el backend
      await this.tenantService.saveComment(this.tenantData.id, newComment, this.user.id);

      // 🔁 Actualizar la lista local de comentarios para reflejarlo inmediatamente
      this.comments.push(newComment);

      this.toast.showToast('Comentario guardado correctamente', 'success');

      // 🔁 Actualizar la lista local de comentarios para reflejarlo inmediatamente
      const { data, error } = await this.tenantService.getCommentsByTenant(this.tenantData.id);

      if (error) {
        console.error('Error al obtener comentarios:', error);
        this.toast.showToast(error, 'error');
        return;
      }

      this.comments = data;
    } catch (error) {
      console.error(error);
      this.toast.showToast('Error al guardar el comentario', 'error');
    } finally {
      this.loading = false;
    }
  }

  async onDeleteComment(id: string) {
    try {
      await this.tenantService.deleteComment(id);
      const { data, error } = await this.tenantService.getCommentsByTenant(this.tenantData.id);

      if (error) {
        console.error('Error al eliminar comentario:', error);
        this.toast.showToast(error, 'error');
        return;
      }

      this.comments = data;
      this.toast.showToast('Comentario eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      this.toast.showToast('Error al eliminar comentario', 'error');
    }
  }

  async onToggleComment(id: string) {
    try {
      await this.tenantService.showComment(id);
      const { data, error } = await this.tenantService.getCommentsByTenant(this.tenantData.id);

      if (error) {
        console.error('Error al mostrar comentario:', error);
        this.toast.showToast(error, 'error');
        return;
      }

      this.comments = data;
      this.toast.showToast('Comentario actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error al mostrar comentario:', error);
      this.toast.showToast('Error al mostrar comentario', 'error');
    }
  }

  async onSaveEdit(newValue: any) {
    try {
      const { error } = await this.tenantService.updateTenant(this.tenantData.id, { [this.editType]: newValue });

      if (error) {
        console.error('Error al actualizar datos:', error);
        this.toast.showToast(error, 'error');
        this.closeFormEditTenant();
        return;
      }

      this.toast.showToast('Datos actualizados correctamente', 'success');
      this.closeFormEditTenant();

      this.tenantData[this.editType] = newValue;
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      this.toast.showToast('Error al actualizar datos', 'error');
    } finally {
      this.loading = false;
    }
  }

}
