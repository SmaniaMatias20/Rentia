import { Injectable } from '@angular/core';
import { Database } from '../database/database';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  constructor(private database: Database) { }

  async getPayments(propertyId: string, year: string) {
    const { data, error } = await this.database.client
      .from('payments')
      .select('*')
      .eq('property_id', propertyId)
      .eq('rent_year', year);

    if (error) {
      console.error('Error al obtener pagos:', error.message);
      return [];
    }

    return data || [];
  }


}
