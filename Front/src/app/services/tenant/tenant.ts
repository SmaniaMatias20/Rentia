import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

type ApiResponse<T> = {
  data: T;
  error?: string;
};

@Injectable({
  providedIn: 'root',
})
export class TenantService {

  private API_URL = 'http://localhost:3000/tenants';

  constructor(private http: HttpClient) { }

  /** Obtener todos los tenants */
  async getAll(): Promise<ApiResponse<any[]>> {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.API_URL}/all`)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al obtener tenants:', error);
      return {
        data: [],
        error: error?.error?.message || 'Error al obtener tenants'
      };
    }
  }

  /** Obtener tenants por usuario */
  async getTenantsByUser(userId: string, filter: string = 'all'): Promise<ApiResponse<any[]>> {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.API_URL}/user/${userId}?filter=${filter}`)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al obtener tenants:', error);
      return {
        data: [],
        error: error?.error?.message || 'Error al obtener tenants'
      };
    }
  }

  /** Obtener un tenant */
  async getTenant(id: string): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.get<any>(`${this.API_URL}/${id}`)
      );
      return data;
    } catch (error: any) {
      console.error('Error al obtener tenant:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al obtener tenant'
      };
    }
  }

  /** Crear tenant */
  async createTenant(tenant: {
    username: string;
    phone: string;
    email: string;
    role: string;
    owner_id: string;
  }): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.post(`${this.API_URL}/create`, tenant)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al crear tenant:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al crear tenant'
      };
    }
  }

  /** Actualizar tenant */
  async updateTenant(id: string, body: any): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.put(`${this.API_URL}/${id}`, body)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al actualizar tenant:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al actualizar tenant'
      };
    }
  }

  /** Eliminar tenant */
  async deleteTenant(id: number): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.delete(`${this.API_URL}/${id}`)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al eliminar tenant:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al eliminar tenant'
      };
    }
  }

  /** Activar / desactivar tenant */
  async toggleTenant(tenant: any): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.put(`${this.API_URL}/toggle/${tenant.id}`, {
          is_enabled: tenant.is_enabled,
        })
      );
      return { data };
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al actualizar tenant'
      };
    }
  }

  // ===========================
  // 💬 COMMENTS
  // ===========================

  /** Todos los comentarios */
  async getAllComments(): Promise<ApiResponse<any[]>> {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.API_URL}/comments`)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al obtener comentarios:', error);
      return {
        data: [],
        error: error?.error?.message || 'Error al obtener comentarios'
      };
    }
  }

  /** Comentarios por tenant */
  async getCommentsByTenant(tenantId: string): Promise<ApiResponse<any[]>> {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.API_URL}/comments/${tenantId}`)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al obtener comentarios:', error);
      return {
        data: [],
        error: error?.error?.message || 'Error al obtener comentarios'
      };
    }
  }

  /** Guardar comentario */
  async saveComment(tenantId: string, comment: string, ownerId: string): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.post(`${this.API_URL}/comments`, {
          tenant_id: tenantId,
          owner_id: ownerId,
          content: comment
        })
      );
      return { data };
    } catch (error: any) {
      console.error('Error al guardar comentario:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al guardar comentario'
      };
    }
  }

  /** Eliminar comentario */
  async deleteComment(id: string): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.delete(`${this.API_URL}/comments/${id}`)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al eliminar comentario:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al eliminar comentario'
      };
    }
  }

  /** Mostrar / ocultar comentario */
  async toggleComment(id: string): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.put(`${this.API_URL}/comments/toggle/${id}`, {})
      );
      return { data };
    } catch (error: any) {
      console.error('Error al cambiar comentario:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al actualizar comentario'
      };
    }
  }

  async showComment(id: string): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.put(`${this.API_URL}/comments/toggle/${id}`, {})
      );
      return { data };
    } catch (error: any) {
      console.error('Error al mostrar comentario:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al mostrar comentario'
      };
    }
  }
}