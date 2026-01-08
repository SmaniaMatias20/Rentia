import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Database } from '../database/database';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {

  constructor(private db: Database, private router: Router) { }

  /**
   * Crea una nueva propiedad en la tabla "properties"
   */
  async createProperty(property: { user_id: string; name: string; address: string; value: string, additional_costs: number }): Promise<{ error?: PostgrestError }> {
    const { error } = await this.db.client
      .from('properties')
      .insert([property]);

    if (error) {
      console.error('Error al crear la propiedad:', error.message);
      return { error };
    }

    console.log('Propiedad creada correctamente');
    return {};
  }

  /**
   * Obtiene todas las propiedades del usuario logueado
   */
  async getProperties(user_id: string): Promise<any[]> {
    console.log('Obteniendo propiedades del usuario:', user_id);

    const { data, error } = await this.db.client
      .from('properties')
      .select('*')
      .eq('user_id', user_id);

    if (error) {
      console.error('Error al obtener propiedades:', error.message);
      return [];
    }

    return data || [];
  }

  async getPropertiesWithoutTenant(user_id: string): Promise<any[]> {
    const { data, error } = await this.db.client
      .from('properties')
      .select('*')
      .eq('user_id', user_id)
      .is('tenant_id', null); // ✅ solo propiedades sin inquilino

    if (error) {
      console.error('Error al obtener propiedades:', error.message);
      return [];
    }

    return data || [];
  }


  /**
   * Elimina una propiedad en la tabla "properties"
   */
  async deleteProperty(id: number): Promise<{ error?: PostgrestError }> {
    const { error } = await this.db.client
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar propiedad:', error.message);
      return { error };
    }

    console.log('Propiedad eliminada correctamente');
    return {};
  }

  async getProperty(id: string | null): Promise<any> {
    const { data, error } = await this.db.client
      .from('properties')
      .select('*')
      .eq('id', id);

    if (error) {
      console.error('Error al obtener propiedad:', error.message);
      return {};
    }

    return data[0] || {};
  }

  async updateProperty(id: string, data: any): Promise<{ error?: PostgrestError }> {
    const { error } = await this.db.client
      .from('properties')
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar propiedad:', error.message);
      return { error };
    }

    console.log('Propiedad actualizada correctamente');
    return {};
  }

}
