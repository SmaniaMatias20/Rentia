import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Database } from '../database/database';
import { AuthError, Session, User, PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private db: Database, private router: Router) { }

  /**
   * Registro de usuario con username, email y password
   */
  async signUp(
    username: string,
    email: string,
    password: string
  ): Promise<{ user?: User; error?: AuthError | PostgrestError }> {
    // 1️⃣ Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await this.db.client.auth.signUp({
      email,
      password,
    });

    if (authError) return { error: authError };

    // 2️⃣ Crear perfil en tabla "users"
    const { error: profileError } = await this.db.client
      .from('users')
      .insert([{ id: authData.user?.id, username, email }]);

    if (profileError) return { error: profileError };

    this.router.navigate(['/home']);
    return { user: authData.user ?? undefined };

  }


  /**
   * Inicio de sesión con username y password
   */
  async signIn(username: string, password: string): Promise<{ session?: Session; error?: AuthError | PostgrestError }> {
    // 1️⃣ Buscar email asociado al username en tabla "users"
    const { data: users, error: fetchError } = await this.db.client
      .from('users')
      .select('id, username, email')
      .eq('username', username)
      .single();

    if (fetchError || !users) {
      console.error('Username no encontrado:', fetchError?.message);
      return { error: fetchError };
    }

    const email = users.email;

    // 2️⃣ Login con email y password
    const { data: sessionData, error: loginError } = await this.db.client.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.error('Error al iniciar sesión:', loginError.message);
      return { error: loginError };
    }

    this.router.navigate(['/home']);
    return { session: sessionData.session };
  }

  /**
   * Logout
   */
  async signOut(): Promise<void> {
    const { error } = await this.db.client.auth.signOut();
    if (error) console.error('Error al cerrar sesión:', error.message);
    this.router.navigate(['/']);
  }

  /**
   * Obtiene el usuario actual logueado (async)
   */
  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.db.client.auth.getUser();
    return data.user;
  }

}
