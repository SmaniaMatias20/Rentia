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
  async createProperty(property: { user_id: string; name: string; address: string; }): Promise<{ error?: PostgrestError }> {
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

  async getQuantityOfPropertiesByUser(user_id: string): Promise<number> {
    const { count, error } = await this.db.client
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id);

    if (error) {
      console.error('Error al obtener la cantidad de propiedades:', error.message);
      return 0;
    }

    return count ?? 0;
  }

  async getQuantityOfPropertiesWithoutTenantByUser(
    user_id: string
  ): Promise<number> {
    const { count, error } = await this.db.client
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .is('tenant_id', null); // ✅ sin inquilino

    if (error) {
      console.error(
        'Error al obtener la cantidad de propiedades sin inquilino:',
        error.message
      );
      return 0;
    }

    return count ?? 0;
  }

  async getQuantityOfPropertiesWithTenantByUser(
    user_id: string
  ): Promise<number> {
    const { count, error } = await this.db.client
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .not('tenant_id', 'is', null); // ✅ con inquilino

    if (error) {
      console.error(
        'Error al obtener la cantidad de propiedades con inquilino:',
        error.message
      );
      return 0;
    }

    return count ?? 0;
  }

  async getTotalRentByUser(user_id: string): Promise<number> {
    const { data, error } = await this.db.client
      .from('properties')
      .select('value')
      .eq('user_id', user_id);

    if (error) {
      console.error('Error al obtener el total de alquileres:', error.message);
      return 0;
    }

    return (
      data?.reduce((total, property) => total + (property.value ?? 0), 0) ?? 0
    );
  }

  async getHighestRentByUser(user_id: string): Promise<number> {
    const { data, error } = await this.db.client
      .from('properties')
      .select('value')
      .eq('user_id', user_id)
      .order('value', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error al obtener el mayor alquiler:', error.message);
      return 0;
    }

    return data?.[0]?.value ?? 0;
  }

  async getLowestRentByUser(user_id: string): Promise<number> {
    const { data, error } = await this.db.client
      .from('properties')
      .select('value')
      .eq('user_id', user_id)
      .order('value', { ascending: true })
      .limit(1);

    if (error) {
      console.error('Error al obtener el menor alquiler:', error.message);
      return 0;
    }

    return data?.[0]?.value ?? 0;
  }


}
