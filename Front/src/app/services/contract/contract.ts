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
export class ContractService {

  private API_URL = 'http://localhost:3000/contracts';

  constructor(private http: HttpClient) { }

  /** Obtener todos los contratos */
  async getAll(): Promise<ApiResponse<any[]>> {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.API_URL}`)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al obtener contratos:', error);
      return {
        data: [],
        error: error?.error?.message || 'Error al obtener contratos'
      };
    }
  }

  /** Crear contrato */
  async createContract(contract: any): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.post(`${this.API_URL}/create`, contract)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al crear contrato:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al crear contrato'
      };
    }
  }

  /** Obtener contratos por usuario */
  async getContractsByUser(userId: string, filter: string = 'all'): Promise<ApiResponse<any[]>> {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(
          `${this.API_URL}/user/${userId}?filter=${filter}`
        )
      );
      return { data };
    } catch (error: any) {
      console.error('Error al obtener contratos:', error);
      return {
        data: [],
        error: error?.error?.message || 'Error al obtener contratos'
      };
    }
  }

  /** Eliminar contrato */
  async deleteContract(id: string): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.delete(`${this.API_URL}/${id}`)
      );
      return { data };
    } catch (error: any) {
      console.error('Error al eliminar contrato:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al eliminar contrato'
      };
    }
  }

  /** Cambiar estado del contrato */
  async updateContractStatus(id: string, status: boolean): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.put(`${this.API_URL}/status/${id}`, { status })
      );
      return { data };
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      return {
        data: null,
        error: error?.error?.message || 'Error al actualizar contrato'
      };
    }
  }
}