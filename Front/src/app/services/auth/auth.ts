import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Database } from '../database/database';
import { AuthError, Session, User, PostgrestError } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private db: Database, private router: Router) { }

  /**
   * Registro de usuario con username, email y password
   */
  async signUp(
    username: string,
    email: string,
    password: string,
    role: string
  ): Promise<{ user?: any; error?: any }> {

    // 1️⃣ Validar si ya existe usuario/email
    const { data: existingUser } = await this.db.client
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .maybeSingle();

    if (existingUser) {
      return { error: { message: 'Usuario o email ya existe' } };
    }

    // 2️⃣ Hashear password
    const password_hash = await bcrypt.hash(password, 10);

    // 3️⃣ Insertar usuario en public.users
    const { data, error } = await this.db.client
      .from('users')
      .insert([{
        username,
        email,
        password: password_hash,
        role,
      }])
      .select()
      .single();

    if (error) return { error };

    // 4️⃣ Guardar sesión local (IMPORTANTE)
    localStorage.setItem('user', JSON.stringify(data));

    this.router.navigate(['/home']);
    return { user: data };
  }


  /**
   * Inicio de sesión con username y password
   */
  async signIn(
    username: string,
    password: string
  ): Promise<{ user?: any; error?: any }> {

    console.log(username, password);

    // 1️⃣ Buscar usuario en public.users
    const { data: user, error } = await this.db.client
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return { error: { message: 'Usuario no encontrado' } };
    }

    // 3️⃣ Comparar password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return { error: { message: 'Contraseña incorrecta' } };
    }

    // 4️⃣ Guardar sesión local
    localStorage.setItem('user', JSON.stringify(user));

    this.router.navigate(['/home']);
    return { user };
  }


  /**
   * Logout
   */
  async signOut() {
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  /**
   * Obtiene el usuario actual logueado con todos los datos de la tabla "users"
   */
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }



}
