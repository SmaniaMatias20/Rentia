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
export class PropertyService {

  private API_URL = 'http://localhost:3000/properties';

  constructor(private http: HttpClient) { }

  /** Obtener todas las propiedades (con username) */
  async getAll(): Promise<ApiResponse<any[]>> {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.API_URL}/all`)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al obtener propiedades:', error);
      return {
        data: [],
        error: error?.error?.message || 'Error al obtener propiedades'
      };
    }
  }

  /** Crear propiedad */
  async createProperty(property: { user_id: string; name: string; address: string }): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.post(`${this.API_URL}/create`, property)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al crear propiedad:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al crear propiedad'
      };
    }
  }

  /** Obtener propiedades por usuario */
  async getProperties(userId: string, filter: string = 'all'): Promise<ApiResponse<any[]>> {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.API_URL}/user/${userId}?filter=${filter}`)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al obtener propiedades:', error);
      return {
        data: [],
        error: error?.error?.message || 'Error al obtener propiedades'
      };
    }
  }

  /** Propiedades sin inquilino */
  async getPropertiesWithoutTenant(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.API_URL}/user/${userId}/without-tenant`)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al obtener propiedades sin inquilino:', error);
      return {
        data: [],
        error: error?.error?.message || 'Error al obtener propiedades'
      };
    }
  }

  /** Eliminar propiedad */
  async deleteProperty(id: number): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.delete(`${this.API_URL}/${id}`)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al eliminar propiedad:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al eliminar propiedad'
      };
    }
  }

  /** Activar / desactivar */
  async toggleProperty(property: any): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.put(`${this.API_URL}/toggle/${property.id}`, {
          is_enabled: property.is_enabled,
        })
      );
      return { data };
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al actualizar propiedad'
      };
    }
  }

  /** Obtener una propiedad */
  async getProperty(id: string): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.get<any>(`${this.API_URL}/${id}`)
      );
      return data;
    } catch (error: any) {
      console.error('Error al obtener propiedad:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al obtener propiedad'
      };
    }
  }

  /** Actualizar propiedad */
  async updateProperty(id: string, body: any): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.put(`${this.API_URL}/${id}`, body)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al actualizar propiedad:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al actualizar propiedad'
      };
    }
  }
}

