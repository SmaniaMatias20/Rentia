import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Database } from '../database/database';
import { AuthError, Session, User, PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class TenantService {

  constructor(private db: Database, private router: Router) { }

  /**
   * Crea un nuevo inquilino en la tabla "tenants"
   */
  async createTenant(
    tenant: {
      username: string;
      phone: string;
      email: string;
      role: string;
      property_id: string;
    }
  ): Promise<{ user?: User; error?: AuthError | PostgrestError }> {

    // 1️⃣ Crear usuario en tabla users y obtener el id
    const { data: userData, error: profileError } = await this.db.client
      .from('users')
      .insert([
        {
          username: tenant.username,
          email: tenant.email,
          role: tenant.role,
          phone: tenant.phone,
        }
      ])
      .select()
      .single(); // 👈 importante para obtener un solo objeto

    if (profileError) return { error: profileError };

    // 2️⃣ Usar el id del nuevo inquilino
    const tenantId = userData.id;

    // 3️⃣ Actualizar la propiedad
    const { error: propertyError } = await this.db.client
      .from('properties')
      .update({ tenant_id: tenantId })
      .eq('id', tenant.property_id);

    if (propertyError) return { error: propertyError };

    return { user: userData };
  }


  /**
   * Obtiene todos los inquilinos del usuario logueado
   */
  async getTenants(user_id: string): Promise<any[]> {
    try {
      // 1️⃣ Obtener tenant_id desde properties del usuario
      const { data: properties, error: propertiesError } = await this.db.client
        .from('properties')
        .select('tenant_id')
        .eq('user_id', user_id)
        .not('tenant_id', 'is', null); // solo propiedades con inquilino

      if (propertiesError) {
        console.error('Error al obtener propiedades:', propertiesError.message);
        return [];
      }

      if (!properties || properties.length === 0) {
        return [];
      }

      // 2️⃣ Extraer tenant_ids únicos
      const tenantIds = [...new Set(
        properties.map(p => p.tenant_id)
      )];

      // 3️⃣ Buscar tenants en users
      const { data: tenants, error: tenantsError } = await this.db.client
        .from('users')
        .select('*')
        .in('id', tenantIds)
        .eq('role', 'tenant');

      if (tenantsError) {
        console.error('Error al obtener tenants:', tenantsError.message);
        return [];
      }

      return tenants || [];

    } catch (err) {
      console.error('Error inesperado:', err);
      return [];
    }
  }


  async getTenant(id: string): Promise<any> {
    const { data, error } = await this.db.client
      .from('users')
      .select('*')
      .eq('id', id);

    if (error) {
      console.error('Error al obtener tenant:', error.message);
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

      // Eliminar el tenant
      const { error: errorDelete } = await this.db.client
        .from('users')
        .delete()
        .eq('id', id);

      if (errorDelete) {
        console.error('Error al eliminar tenant:', errorDelete.message);
        return { error: errorDelete };
      }

      return {};
    } catch (err: any) {
      console.error('Error inesperado al eliminar tenant:', err.message);
      return { error: { message: err.message } as PostgrestError };
    }
  }


}
