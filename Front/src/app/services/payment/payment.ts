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

  async createPayment(payment: any): Promise<{ error?: PostgrestError; data?: any }> {

    if (payment.water && payment.electricy && payment.gas && payment.hoa_fees && payment.rent_amount >= payment.total_rent_amount) {
      payment.status = true;
    } else {
      payment.status = false;
    }

    const { data, error } = await this.database.client
      .from('payments')
      .insert(payment)
      .select('*'); // pedimos que devuelva filas

    if (error) {
      console.error('Error al crear pago:', error.message);
      return { error };
    }

    // Supabase devuelve array si no usás .single()
    const inserted = Array.isArray(data) ? data[0] : data;

    if (!inserted) {
      return {
        error: {
          message: 'No se pudo recuperar el pago creado',
        } as PostgrestError,
      };
    }

    return { data: inserted };
  }

  async updatePayment(payment: any): Promise<{ error?: PostgrestError }> {

    if (payment.water && payment.electricy && payment.gas && payment.hoa_fees && payment.rent_amount >= payment.total_rent_amount) {
      payment.status = true;
    } else {
      payment.status = false;
    }

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
