import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Database } from '../database/database';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class ContractService {

  constructor(private db: Database, private router: Router) { }

  /**
   * Crea un nuevo contrato en la tabla "contracts"
   */
  async createContract(contract: { property_id: string, tenant_id: string, rent_amount: number, currency: string, increase_percentage: number, increase_frequency: string, valid_from: string, valid_to: string, owner_id: string }): Promise<{ error?: PostgrestError }> {
    const { error } = await this.db.client
      .from('contracts')
      .insert([contract]);

    if (error) {
      console.error('Error al crear contrato:', error.message);
      return { error };
    }

    console.log('Contrato creado correctamente');
    return {};
  }

  /**
   * Obtiene todos los contratos del usuario logueado
   */
  async getContractsByUser(user_id: string): Promise<any[]> {
    console.log('Obteniendo contratos del usuario:', user_id);

    const { data, error } = await this.db.client
      .from('contracts')
      .select('*')
      .eq('owner_id', user_id);

    if (error) {
      console.error('Error al obtener contratos:', error.message);
      return [];
    }

    return data || [];
  }


}
