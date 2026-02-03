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


}
