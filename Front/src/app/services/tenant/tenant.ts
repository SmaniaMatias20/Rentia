import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Database } from '../database/database';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class Tenant {

  constructor(private db: Database, private router: Router) { }

  /**
   * Crea un nuevo inquilino en la tabla "tenants"
   */
  async createTenant(tenant: { user_id: string; name: string; phone: string; email: string }): Promise<{ error?: PostgrestError }> {
    const { error } = await this.db.client
      .from('tenants')
      .insert([tenant]);

    if (error) {
      console.error('Error al crear tenant:', error.message);
      return { error };
    }

    console.log('Tenant creado correctamente');
    return {};
  }

  /**
   * Obtiene todos los inquilinos del usuario logueado
   */
  async getTenants(user_id: string): Promise<any[]> {
    const { data, error } = await this.db.client
      .from('tenants')
      .select('*')
      .eq('user_id', user_id);

    if (error) {
      console.error('Error al obtener tenants:', error.message);
      return [];
    }

    return data || [];
  }

}
