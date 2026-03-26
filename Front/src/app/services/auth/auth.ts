import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Database } from '../database/database';
import bcrypt from 'bcryptjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Registro de usuario
   */
  async signUp(username: string, email: string, password: string) {
    try {
      const response: any = await this.http
        .post(`${this.API_URL}/register`, {
          username: username.toLowerCase(),
          password,
        })
        .toPromise();

      // Guardar usuario (opcional)
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      this.router.navigate(['/home']);

      return { user: response.user };

    } catch (error: any) {
      return { error: error.error };
    }
  }

  /**
   * Login
   */
  async signIn(username: string, password: string) {
    try {
      const response: any = await this.http
        .post(`${this.API_URL}/auth/login`, {
          username: username.toLowerCase(),
          password,
        })
        .toPromise();

      // 🔐 Guardar token
      localStorage.setItem('token', response.token);

      // 👤 Guardar usuario (clave para getCurrentUser)
      localStorage.setItem('user', JSON.stringify(response.user));

      this.router.navigate(['/home']);

      return { user: response.user };

    } catch (error: any) {
      return { error: error.error };
    }
  }

  /**
   * Logout
   */
  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  /**
   * Obtener token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Saber si está logueado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }


  // constructor(private db: Database, private router: Router) { }

  // /**
  //  * Registro de usuario con username, email y password
  //  */
  // async signUp(
  //   username: string,
  //   email: string,
  //   password: string,
  // ): Promise<{ user?: any; error?: any }> {

  //   // 1️⃣ Validar si ya existe usuario/email
  //   const { data: existingUser } = await this.db.client
  //     .from('users')
  //     .select('id')
  //     .or(`username.eq.${username}`)
  //     .maybeSingle();

  //   if (existingUser) {
  //     return { error: { message: 'Ya existe ese nombre de usuario en el sistema' } };
  //   }

  //   // 2️⃣ Hashear password
  //   const password_hash = await bcrypt.hash(password, 10);

  //   // Pasar el username a lowercase
  //   username = username.toLowerCase();

  //   // 3️⃣ Insertar usuario en public.users
  //   const { data, error } = await this.db.client
  //     .from('users')
  //     .insert([{
  //       username,
  //       email,
  //       password: password_hash,
  //       role: 'owner',
  //     }])
  //     .select()
  //     .single();

  //   if (error) return { error };

  //   // 4️⃣ Guardar sesión local (IMPORTANTE)
  //   localStorage.setItem('user', JSON.stringify(data));

  //   this.router.navigate(['/home']);
  //   return { user: data };
  // }


  // /**
  //  * Inicio de sesión con username y password
  //  */
  // async signIn(
  //   username: string,
  //   password: string
  // ): Promise<{ user?: any; error?: any }> {

  //   // Pasar el username a lowercase
  //   username = username.toLowerCase();

  //   // 1️⃣ Buscar usuario en public.users
  //   const { data: user, error } = await this.db.client
  //     .from('users')
  //     .select('*')
  //     .eq('username', username)
  //     .single();

  //   if (error || !user) {
  //     return { error: { message: 'Usuario no encontrado' } };
  //   }

  //   // 3️⃣ Comparar password
  //   const validPassword = await bcrypt.compare(password, user.password);

  //   if (!validPassword) {
  //     return { error: { message: 'Contraseña incorrecta' } };
  //   }

  //   // 4️⃣ Guardar sesión local
  //   localStorage.setItem('user', JSON.stringify(user));

  //   this.router.navigate(['/home']);
  //   return { user };
  // }


  // /**
  //  * Logout
  //  */
  // async signOut() {
  //   localStorage.removeItem('user');
  //   this.router.navigate(['/']);
  // }

  // /**
  //  * Obtiene el usuario actual logueado con todos los datos de la tabla "users"
  //  */
  // getCurrentUser() {
  //   const user = localStorage.getItem('user');
  //   return user ? JSON.parse(user) : null;
  // }

}
