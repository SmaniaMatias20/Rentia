// import { Injectable } from '@angular/core';
// import { Database } from '../database/database';
// import { PostgrestError } from '@supabase/supabase-js';

// @Injectable({
//   providedIn: 'root',
// })
// export class PaymentService {

//   constructor(private database: Database) { }

//   async getAll(): Promise<any[]> {
//     const { data, error } = await this.database.client
//       .from('payments')
//       .select('*')
//       .order('created_at', { ascending: false });

//     if (error) {
//       console.error('Error al obtener pagos:', error.message);
//       return [];
//     }

//     return data || [];
//   }

//   async getAllTransactions(): Promise<any[]> {
//     const { data, error } = await this.database.client
//       .from('payment_transactions')
//       .select('*')
//       .order('created_at', { ascending: false });

//     if (error) {
//       console.error('Error al obtener transacciones:', error.message);
//       return [];
//     }

//     return data || [];
//   }

//   async getDetailPaymentsByPaymentId(paymentId: string): Promise<{ data: any[]; error?: PostgrestError }> {
//     const { data, error } = await this.database.client
//       .from('payment_transactions')
//       .select('*')
//       .eq('payment_id', paymentId);

//     if (error) {
//       console.error('Error al obtener detalles de pago:', error.message);
//       return { data: [], error };
//     }

//     return { data };
//   }

//   async deleteDetailPayment(id: string): Promise<{ error?: PostgrestError }> {
//     try {
//       // 1️⃣ Borrar la transacción y obtener los datos eliminados
//       const { error, data } = await this.database.client
//         .from('payment_transactions')
//         .delete()
//         .eq('id', id)
//         .select('*');

//       if (error) {
//         console.error('Error al borrar detalle de pago:', error.message);
//         return { error };
//       }

//       if (!data || data.length === 0) {
//         return {};
//       }

//       const deletedTransaction = data[0];

//       // 2️⃣ Obtener el payment actual para calcular correctamente
//       const { data: payment, error: paymentFetchError } = await this.database.client
//         .from('payments')
//         .select('rent_amount')
//         .eq('id', deletedTransaction.payment_id)
//         .single();

//       if (paymentFetchError) {
//         console.error('Error al obtener payment:', paymentFetchError.message);
//         return { error: paymentFetchError };
//       }

//       const newAmount = (payment.rent_amount || 0) - (deletedTransaction.amount || 0);

//       // 3️⃣ Actualizar el total del payment
//       const { error: errorPayment } = await this.database.client
//         .from('payments')
//         .update({ rent_amount: newAmount })
//         .eq('id', deletedTransaction.payment_id);

//       if (errorPayment) {
//         console.error('Error al actualizar total de pago:', errorPayment.message);
//         return { error: errorPayment };
//       }

//       return {};
//     } catch (error) {
//       console.error('Error al borrar detalle de pago:', error);
//     }

//     return {};
//   }

//   async getPaymentsByContract(contractId: string): Promise<any[]> {
//     const { data, error } = await this.database.client
//       .from('payments')
//       .select('*')
//       .eq('contract_id', contractId);

//     if (error) {
//       console.error('Error al obtener pagos:', error.message);
//       return [];
//     }

//     return data || [];
//   }

//   async createPayment(payment: any): Promise<{ error?: PostgrestError; data?: any }> {

//     if (payment.water && payment.electricy && payment.gas && payment.hoa_fees && payment.rent_amount >= payment.total_rent_amount) {
//       payment.status = true;
//     } else {
//       payment.status = false;
//     }

//     const { data, error } = await this.database.client
//       .from('payments')
//       .insert(payment)
//       .select('*'); // pedimos que devuelva filas

//     if (error) {
//       console.error('Error al crear pago:', error.message);
//       return { error };
//     }

//     // Supabase devuelve array si no usás .single()
//     const inserted = Array.isArray(data) ? data[0] : data;

//     if (!inserted) {
//       return {
//         error: {
//           message: 'No se pudo recuperar el pago creado',
//         } as PostgrestError,
//       };
//     }

//     return { data: inserted };
//   }


//   async updatePayment(payment: any): Promise<{ error?: PostgrestError }> {

//     if (payment.water && payment.electricy && payment.gas && payment.hoa_fees && payment.rent_amount >= payment.total_rent_amount) {
//       payment.status = true;
//     } else {
//       payment.status = false;
//     }

//     const { error } = await this.database.client
//       .from('payments')
//       .update(payment)
//       .eq('id', payment.id);

//     if (error) {
//       console.error('Error al actualizar pago:', error.message);
//       return { error };
//     }

//     return {};
//   }

//   async createDetailPayment(paymentId: string, amount: number, payment_method: string): Promise<{ error?: PostgrestError }> {
//     const detailPayment = {
//       amount,
//       payment_method,
//       payment_id: paymentId
//     };

//     const { error } = await this.database.client
//       .from('payment_transactions')
//       .insert(detailPayment)

//     if (error) {
//       console.error('Error al crear detalle de pago:', error.message);
//       return { error };
//     }

//     return {};
//   }

//   async getMonthlyRentIncomeByUser(
//     userId: string,
//     year: number,
//     month: number
//   ): Promise<number> {

//     // 📅 rango del mes
//     const from = new Date(year, month - 1, 1).toISOString();
//     const to = new Date(year, month, 1).toISOString();

//     // 🔎 1. obtener contratos del usuario
//     const { data: contracts, error: errorContracts } =
//       await this.database.client
//         .from('contracts')
//         .select('id')
//         .eq('owner_id', userId)
//         .eq('status', true);

//     if (errorContracts) {
//       console.error('Error al obtener contratos:', errorContracts.message);
//       return 0;
//     }

//     if (!contracts?.length) return 0;

//     const contractIds = contracts.map(c => c.id);

//     // 💰 2. obtener pagos del mes
//     const { data: payments, error: errorPayments } =
//       await this.database.client
//         .from('payments')
//         .select('rent_amount')
//         .in('contract_id', contractIds)
//         .gte('rent_month', from)
//         .lt('rent_month', to);

//     if (errorPayments) {
//       console.error('Error al obtener pagos:', errorPayments.message);
//       return 0;
//     }

//     // ➕ 3. suma total
//     const total = payments.reduce(
//       (acc, p) => acc + (p.rent_amount ?? 0),
//       0
//     );

//     return total;
//   }

//   async getMonthlyElectricityIncomeByUser(
//     userId: string,
//     year: number,
//     month: number
//   ): Promise<number> {
//     // 📅 rango del mes
//     const from = new Date(year, month - 1, 1).toISOString();
//     const to = new Date(year, month, 1).toISOString();

//     // 🔎 1. obtener contratos del usuario
//     const { data: contracts, error: errorContracts } =
//       await this.database.client
//         .from('contracts')
//         .select('id')
//         .eq('owner_id', userId)
//         .eq('status', true);

//     if (errorContracts) {
//       console.error('Error al obtener contratos:', errorContracts.message);
//       return 0;
//     }

//     if (!contracts?.length) return 0;

//     const contractIds = contracts.map(c => c.id);

//     // 💰 2. obtener pagos del mes
//     const { data: payments, error: errorPayments } =
//       await this.database.client
//         .from('payments')
//         .select('electricy_amount')
//         .in('contract_id', contractIds)
//         .gte('rent_month', from)
//         .lt('rent_month', to)
//         .eq('electricy', true);

//     if (errorPayments) {
//       console.error('Error al obtener pagos:', errorPayments.message);
//       return 0;
//     }

//     // ➕ 3. suma total
//     const total = payments.reduce(
//       (acc, p) => acc + (p.electricy_amount ?? 0),
//       0
//     );

//     return total;
//   }

//   async getMonthlyGasIncomeByUser(
//     userId: string,
//     year: number,
//     month: number
//   ): Promise<number> {
//     // 📅 rango del mes
//     const from = new Date(year, month - 1, 1).toISOString();
//     const to = new Date(year, month, 1).toISOString();

//     // 🔎 1. obtener contratos del usuario
//     const { data: contracts, error: errorContracts } =
//       await this.database.client
//         .from('contracts')
//         .select('id')
//         .eq('owner_id', userId)
//         .eq('status', true);

//     if (errorContracts) {
//       console.error('Error al obtener contratos:', errorContracts.message);
//       return 0;
//     }

//     if (!contracts?.length) return 0;

//     const contractIds = contracts.map(c => c.id);

//     // 💰 2. obtener pagos del mes
//     const { data: payments, error: errorPayments } =
//       await this.database.client
//         .from('payments')
//         .select('gas_amount')
//         .in('contract_id', contractIds)
//         .gte('rent_month', from)
//         .lt('rent_month', to)
//         .eq('gas', true);

//     if (errorPayments) {
//       console.error('Error al obtener pagos:', errorPayments.message);
//       return 0;
//     }

//     // ➕ 3. suma total
//     const total = payments.reduce(
//       (acc, p) => acc + (p.gas_amount ?? 0),
//       0
//     );

//     return total;
//   }

//   async getMonthlyHoaIncomeByUser(
//     userId: string,
//     year: number,
//     month: number
//   ): Promise<number> {
//     // 📅 rango del mes
//     const from = new Date(year, month - 1, 1).toISOString();
//     const to = new Date(year, month, 1).toISOString();

//     // 🔎 1. obtener contratos del usuario
//     const { data: contracts, error: errorContracts } =
//       await this.database.client
//         .from('contracts')
//         .select('id')
//         .eq('owner_id', userId)
//         .eq('status', true);

//     if (errorContracts) {
//       console.error('Error al obtener contratos:', errorContracts.message);
//       return 0;
//     }

//     if (!contracts?.length) return 0;

//     const contractIds = contracts.map(c => c.id);

//     // 💰 2. obtener pagos del mes
//     const { data: payments, error: errorPayments } =
//       await this.database.client
//         .from('payments')
//         .select('hoa_fees_amount')
//         .in('contract_id', contractIds)
//         .gte('rent_month', from)
//         .lt('rent_month', to)
//         .eq('hoa_fees', true);

//     if (errorPayments) {
//       console.error('Error al obtener pagos:', errorPayments.message);
//       return 0;
//     }

//     // ➕ 3. suma total
//     const total = payments.reduce(
//       (acc, p) => acc + (p.hoa_fees_amount ?? 0),
//       0
//     );

//     return total;
//   }

//   async getMonthlyWaterIncomeByUser(
//     userId: string,
//     year: number,
//     month: number
//   ): Promise<number> {
//     // 📅 rango del mes
//     const from = new Date(year, month - 1, 1).toISOString();
//     const to = new Date(year, month, 1).toISOString();

//     // 🔎 1. obtener contratos del usuario
//     const { data: contracts, error: errorContracts } =
//       await this.database.client
//         .from('contracts')
//         .select('id')
//         .eq('owner_id', userId)
//         .eq('status', true);

//     if (errorContracts) {
//       console.error('Error al obtener contratos:', errorContracts.message);
//       return 0;
//     }

//     if (!contracts?.length) return 0;

//     const contractIds = contracts.map(c => c.id);

//     // 💰 2. obtener pagos del mes
//     const { data: payments, error: errorPayments } =
//       await this.database.client
//         .from('payments')
//         .select('water_amount')
//         .in('contract_id', contractIds)
//         .gte('rent_month', from)
//         .lt('rent_month', to)
//         .eq('water', true);

//     if (errorPayments) {
//       console.error('Error al obtener pagos:', errorPayments.message);
//       return 0;
//     }

//     // ➕ 3. suma total
//     const total = payments.reduce(
//       (acc, p) => acc + (p.water_amount ?? 0),
//       0
//     );

//     return total;
//   }

//   async getQuantityOfPaymentsByUser(
//     userId: string,
//     year: number,
//     month: number
//   ): Promise<number> {
//     // 📅 rango del mes
//     const from = new Date(year, month - 1, 1).toISOString();
//     const to = new Date(year, month, 1).toISOString();

//     // 🔎 1. obtener contratos del usuario
//     const { data: contracts, error: errorContracts } =
//       await this.database.client
//         .from('contracts')
//         .select('id')
//         .eq('owner_id', userId)
//         .eq('status', true);

//     if (errorContracts) {
//       console.error('Error al obtener contratos:', errorContracts.message);
//       return 0;
//     }

//     if (!contracts?.length) return 0;

//     const contractIds = contracts.map(c => c.id);

//     // 💰 2. obtener pagos del mes
//     const { data: payments, error: errorPayments } =
//       await this.database.client
//         .from('payments')
//         .select('id')
//         .in('contract_id', contractIds)
//         .gte('rent_month', from)
//         .lt('rent_month', to);

//     if (errorPayments) {
//       console.error('Error al obtener pagos:', errorPayments.message);
//       return 0;
//     }

//     // ➕ 3. suma total
//     const total = payments.length;

//     return total;
//   }


// }

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
