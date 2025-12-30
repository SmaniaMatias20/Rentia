import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Database } from '../database/database';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class Property {

  constructor(private db: Database, private router: Router) { }

  /**
   * Crea una nueva propiedad en la tabla "properties"
   */
  async createProperty(property: { user_id: string; name: string; address: string; value: string }): Promise<{ error?: PostgrestError }> {
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

}
