import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Database } from '../database/database';
import { AuthError, User, PostgrestError } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

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
      owner_id: string;
    }
  ): Promise<{ user?: User; error?: AuthError | PostgrestError | any }> {

    // 1️⃣ Validar si ya existe usuario/email
    const { data: existingUser } = await this.db.client
      .from('users')
      .select('id')
      .or(`username.eq.${tenant.username},email.eq.${tenant.email}`)
      .maybeSingle();

    if (existingUser) {
      return { error: { message: 'Usuario o email ya existe' } };
    }

    // 2️⃣ Hashear password
    const password_hash = await bcrypt.hash("1234", 10);

    // 1️⃣ Crear usuario en tabla users y obtener el id
    const { data: userData, error: profileError } = await this.db.client
      .from('users')
      .insert([
        {
          username: tenant.username,
          email: tenant.email,
          role: tenant.role,
          phone: tenant.phone,
          owner_id: tenant.owner_id,
          password: password_hash
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
  async getTenantsByUser(user_id: string): Promise<any[]> {
    try {
      const { data, error } = await this.db.client
        .from('users')
        .select('*')
        .eq('owner_id', user_id)
        .eq('role', 'tenant'); // opcional pero recomendado

      if (error) {
        console.error('Error al obtener tenants:', error.message);
        return [];
      }

      return data || [];

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

    return data[0] || [];
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

  async getQuantityOfTenantsByUser(user_id: string): Promise<number> {
    const { count, error } = await this.db.client
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user_id)
      .eq('role', 'tenant'); // opcional pero recomendado

    if (error) {
      console.error('Error al obtener la cantidad de tenants:', error.message);
      return 0;
    }

    return count ?? 0;
  }

  async getCommentsByTenant(tenantId: string): Promise<string[]> {
    const { data, error } = await this.db.client
      .from('comments')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Error al obtener comentarios:', error.message);
      return [];
    }

    return data || [];
  }

  async saveComment(tenantId: string, comment: string, ownerId: string): Promise<any> {
    const { error } = await this.db.client
      .from('comments')
      .insert([
        {
          owner_id: ownerId,
          tenant_id: tenantId,
          content: comment
        }
      ])
      .single();

    if (error) {
      console.error('Error al guardar comentario:', error.message);
      return { error };
    }

    return {};
  }


}
