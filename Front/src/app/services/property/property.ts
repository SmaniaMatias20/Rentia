import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Database } from '../database/database';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {

  constructor(private db: Database, private router: Router) { }

  /** Obtiene todos los inquilinos del usuario logueado */
  async getAll(): Promise<any[]> {
    // 1️⃣ Traemos todas las propiedades
    const { data: properties, error: propError } = await this.db.client
      .from('properties')
      .select('*')
      .order('name');

    if (propError) {
      console.error('Error al obtener propiedades:', propError.message);
      return [];
    }
    if (!properties || properties.length === 0) return [];

    // 2️⃣ Extraemos los user_id únicos de las propiedades
    const userIds = Array.from(new Set(properties.map(p => p.user_id).filter(Boolean)));

    // 3️⃣ Traemos los usuarios que coincidan con esos IDs
    const { data: users, error: userError } = await this.db.client
      .from('users')
      .select('id, username')
      .in('id', userIds);

    if (userError) {
      console.error('Error al obtener usuarios:', userError.message);
      return properties; // devolvemos propiedades sin reemplazar
    }

    // 4️⃣ Creamos un mapa id -> username
    const idToUsernameMap: Record<string, string> = {};
    users?.forEach(user => {
      idToUsernameMap[user.id] = user.username;
    });

    // 5️⃣ Reemplazamos user_id por username
    const result = properties.map(prop => ({
      ...prop,
      user_id: prop.user_id ? idToUsernameMap[prop.user_id] || prop.user_id : null
    }));

    return result;
  }

  /**
   * Crea una nueva propiedad en la tabla "properties"
   */
  async createProperty(property: { user_id: string; name: string; address: string; }): Promise<{ error?: PostgrestError }> {

    if (property.name) property.name = property.name.toLowerCase();

    const { error } = await this.db.client
      .from('properties')
      .insert([property]);

    if (error) {
      console.error('Error al crear la propiedad:', error.message);
      return { error };
    }

    return {};
  }

  /**
   * Obtiene todas las propiedades del usuario logueado
   */
  async getProperties(user_id: string, filter = 'all'): Promise<any[]> {

    // Filtrar propiedades
    let query = this.db.client
      .from('properties')
      .select('*')
      .eq('user_id', user_id);

    if (filter === 'active') {
      query = query.eq('is_enabled', true);
    } else if (filter === 'inactive') {
      query = query.eq('is_enabled', false);
    }

    const { data, error } = await query;

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

  async deleteProperty(id: number): Promise<{ error?: PostgrestError }> {
    const { error: contractsError } = await this.db.client
      .from('contracts')
      .delete()
      .eq('property_id', id);

    if (contractsError) {
      console.error('Error al eliminar contratos:', contractsError.message);
      return { error: contractsError };
    }

    const { error: propertyError } = await this.db.client
      .from('properties')
      .delete()
      .eq('id', id);

    if (propertyError) {
      console.error('Error al eliminar propiedad:', propertyError.message);
      return { error: propertyError };
    }

    return {};
  }

  async toggleProperty(property: any): Promise<any> {
    const { data, error } = await this.db.client
      .from('properties')
      .update({ is_enabled: property.is_enabled })
      .eq('id', property.id);

    if (error) {
      console.error('Error al cambiar propiedad:', error.message);
      return { error: error };
    }

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

    if (data.name) data.name = data.name.toLowerCase();

    const { error } = await this.db.client
      .from('properties')
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar propiedad:', error.message);
      return { error };
    }

    return {};
  }
}
