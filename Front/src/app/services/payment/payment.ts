import { Injectable } from '@angular/core';
import { Database } from '../database/database';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  constructor(private database: Database) { }

  async getPaymentsByContract(contractId: string): Promise<any[]> {
    const { data, error } = await this.database.client
      .from('payments')
      .select('*')
      .eq('contract_id', contractId);

    if (error) {
      console.error('Error al obtener pagos:', error.message);
      return [];
    }

    return data || [];
  }

  async createPayment(payment: any): Promise<{ error?: PostgrestError } & { data?: any }> {
    const { error, data } = await this.database.client
      .from('payments')
      .insert(payment)
      .single();

    if (error) {
      console.error('Error al crear pago:', error.message);
      return { error };
    }

    return { data };
  }

  async updatePayment(payment: any): Promise<{ error?: PostgrestError }> {
    const { error } = await this.database.client
      .from('payments')
      .update(payment)
      .eq('id', payment.id);

    if (error) {
      console.error('Error al actualizar pago:', error.message);
      return { error };
    }

    return {};
  }


}
