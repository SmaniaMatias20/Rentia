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
      owner_id: string;
    }
  ): Promise<{ user?: User; error?: AuthError | PostgrestError | any }> {


    // 1️⃣ Validar si ya existe usuario/email
    const { data: existingUser } = await this.db.client
      .from('users')
      .select('id')
      .or(`username.eq.${tenant.username}`)
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

    return { user: userData };
  }

  async updateTenant(tenantId: string, data: any): Promise<{ error?: PostgrestError }> {
    try {
      const { error } = await this.db.client
        .from('users')
        .update(data) // 👈 actualizar datos
        .eq('id', tenantId);

      if (error) {
        console.error('Error al actualizar tenant:', error.message);
        return { error };
      }

      return {};
    } catch (err: any) {
      console.error('Error inesperado al actualizar tenant:', err.message);
      return { error: { message: err.message } as PostgrestError };
    }
  }

  /**
   * Obtiene todos los inquilinos del usuario logueado
   */
  async getTenantsByUser(user_id: string, filter = 'all'): Promise<any[]> {

    try {
      // Filtrar inquilinos
      let query = this.db.client
        .from('users')
        .select('*')
        .eq('owner_id', user_id)
        .eq('role', 'tenant'); // opcional pero recomendado

      if (filter === 'active') {
        query = query.eq('is_enabled', true);
      } else if (filter === 'inactive') {
        query = query.eq('is_enabled', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error al obtener tenants:', error.message);
        return [];
      }

      return data || [];
    } catch (err: any) {
      console.error('Error inesperado:', err.message);
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


      // Eliminar comentarios del tenant
      const { error: errorDeleteComments } = await this.db.client
        .from('comments')
        .delete()
        .eq('tenant_id', id);

      if (errorDeleteComments) {
        console.error('Error al eliminar comentarios del tenant:', errorDeleteComments.message);
        return { error: errorDeleteComments };
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

  async toggleTenant(tenant: any): Promise<any> {
    const { data, error } = await this.db.client
      .from('users')
      .update({ is_enabled: tenant.is_enabled })
      .eq('id', tenant.id);

    if (error) {
      console.error('Error al cambiar tenant:', error.message);
      return { error: error };
    }

    return {};
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

  async deleteComment(id: string): Promise<{ error?: PostgrestError }> {
    try {
      const { error } = await this.db.client
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error al eliminar comentario:', error.message);
        return { error };
      }

      return {};
    } catch (err: any) {
      console.error('Error inesperado al eliminar comentario:', err.message);
      return { error: { message: err.message } as PostgrestError };
    }
  }

  async showComment(id: string): Promise<{ error?: PostgrestError }> {
    try {
      // 1️⃣ Obtener el valor actual
      const { data, error: selectError } = await this.db.client
        .from('comments')
        .select('show')
        .eq('id', id)
        .single();

      if (selectError) return { error: selectError };

      // 2️⃣ Alternar el valor
      const newShowValue = !data.show;

      // 3️⃣ Actualizar el registro
      const { error: updateError } = await this.db.client
        .from('comments')
        .update({ show: newShowValue })
        .eq('id', id);

      if (updateError) return { error: updateError };

      return {};
    } catch (err: any) {
      console.error('Error inesperado al mostrar comentario:', err.message);
      return { error: { message: err.message } as PostgrestError };
    }
  }


}
