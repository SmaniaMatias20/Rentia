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
export class StatisticsService {

  private API_URL = 'http://localhost:3000/statistics';

  constructor(private http: HttpClient) { }

  /** Obtener todas las estadísticas del usuario */
  async getStatisticsByUser(userId: string): Promise<ApiResponse<any>> {
    try {
      const data = await firstValueFrom(
        this.http.get<any>(`${this.API_URL}/${userId}`)
      );

      return { data };

    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);

      return {
        data: null,
        error: error?.error?.message || 'Error al obtener estadísticas'
      };
    }
  }
}