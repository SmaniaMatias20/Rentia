import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  private API_URL = 'http://localhost:3000/payments';

  constructor(private http: HttpClient) { }

  // 🧾 GET ALL
  async getAll() {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.API_URL}`)
      );
      return { data };
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      return { data: [], error };
    }
  }

  // 💳 GET ALL TRANSACTIONS
  async getAllTransactions() {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.API_URL}/transactions`)
      );
      return { data };
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      return { data: [], error };
    }
  }

  // 🔎 DETAILS
  async getDetailPaymentsByPaymentId(paymentId: string) {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.API_URL}/transactions/${paymentId}`)
      );
      return { data };
    } catch (error) {
      console.error('Error al obtener detalles:', error);
      return { data: [], error };
    }
  }

  // ❌ DELETE
  async deleteDetailPayment(id: string) {
    try {
      await firstValueFrom(
        this.http.delete(`${this.API_URL}/transactions/${id}`)
      );
      return {};
    } catch (error) {
      console.error('Error al eliminar:', error);
      return { error };
    }
  }

  // 📄 BY CONTRACT
  async getPaymentsByContract(contractId: string) {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.API_URL}/contract/${contractId}`)
      );

      console.log(data);
      return { data };
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      return { data: [], error };
    }
  }

  // ➕ CREATE PAYMENT (🔥 IMPORTANTE)
  async createPayment(payment: any) {
    try {
      const response: any = await firstValueFrom(
        this.http.post(`${this.API_URL}/create`, payment)
      );

      // 👇 el backend devuelve el objeto creado
      return { data: response, id: response.id };

    } catch (error) {
      console.error('Error al crear pago:', error);
      return { error };
    }
  }

  // ✏️ UPDATE
  async updatePayment(payment: any) {
    try {
      await firstValueFrom(
        this.http.put(`${this.API_URL}/${payment.id}`, payment)
      );
      return {};
    } catch (error) {
      console.error('Error al actualizar pago:', error);
      return { error };
    }
  }

  // ➕ TRANSACTION
  async createDetailPayment(paymentId: string, amount: number, payment_method: string) {
    try {
      await firstValueFrom(
        this.http.post(`${this.API_URL}/transactions`, {
          paymentId,
          amount,
          payment_method
        })
      );
      return {};
    } catch (error) {
      console.error('Error al crear transacción:', error);
      return { error };
    }
  }

  // 📊 REPORTES

  async getMonthlyRentIncomeByUser(userId: string, year: number, month: number) {
    try {
      const data = await firstValueFrom(
        this.http.get<number>(`${this.API_URL}/reports/rent`, {
          params: { userId, year, month }
        })
      );
      return data;
    } catch (error) {
      console.error('Error rent:', error);
      return 0;
    }
  }

  async getMonthlyElectricityIncomeByUser(userId: string, year: number, month: number) {
    try {
      const data = await firstValueFrom(
        this.http.get<number>(`${this.API_URL}/reports/electricity`, {
          params: { userId, year, month }
        })
      );
      return data;
    } catch (error) {
      console.error('Error electricity:', error);
      return 0;
    }
  }

  async getMonthlyGasIncomeByUser(userId: string, year: number, month: number) {
    try {
      const data = await firstValueFrom(
        this.http.get<number>(`${this.API_URL}/reports/gas`, {
          params: { userId, year, month }
        })
      );
      return data;
    } catch (error) {
      console.error('Error gas:', error);
      return 0;
    }
  }

  async getMonthlyHoaIncomeByUser(userId: string, year: number, month: number) {
    try {
      const data = await firstValueFrom(
        this.http.get<number>(`${this.API_URL}/reports/hoa`, {
          params: { userId, year, month }
        })
      );
      return data;
    } catch (error) {
      console.error('Error hoa:', error);
      return 0;
    }
  }

  async getMonthlyWaterIncomeByUser(userId: string, year: number, month: number) {
    try {
      const data = await firstValueFrom(
        this.http.get<number>(`${this.API_URL}/reports/water`, {
          params: { userId, year, month }
        })
      );
      return data;
    } catch (error) {
      console.error('Error water:', error);
      return 0;
    }
  }

  async getQuantityOfPaymentsByUser(userId: string, year: number, month: number) {
    try {
      const data = await firstValueFrom(
        this.http.get<number>(`${this.API_URL}/reports/count`, {
          params: { userId, year, month }
        })
      );
      return data;
    } catch (error) {
      console.error('Error count:', error);
      return 0;
    }
  }
}
