import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Database } from '../database/database';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class TenantService {

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
    console.log('Obteniendo tenants del usuario:', user_id);

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

  /**
   * Elimina un inquilino en la tabla "tenants" y limpia referencias en properties si existen
   */
  async deleteTenant(id: number): Promise<{ error?: PostgrestError }> {
    try {
      // Limpiar tenant_id en properties (si hay coincidencias, se actualizarán; si no, no pasa nada)
      const { error: errorUpdate } = await this.db.client
        .from('properties')
        .update({ tenant_id: null })
        .eq('tenant_id', id);

      if (errorUpdate) {
        console.error('Error al limpiar tenant_id en properties:', errorUpdate.message);
        return { error: errorUpdate };
      }

      console.log('Se limpiaron tenant_id en properties correctamente (si existían)');

      // Eliminar el tenant
      const { error: errorDelete } = await this.db.client
        .from('tenants')
        .delete()
        .eq('id', id);

      if (errorDelete) {
        console.error('Error al eliminar tenant:', errorDelete.message);
        return { error: errorDelete };
      }

      console.log('Tenant eliminado correctamente');
      return {};

    } catch (err: any) {
      console.error('Error inesperado al eliminar tenant:', err.message);
      return { error: { message: err.message } as PostgrestError };
    }
  }


}
