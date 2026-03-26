import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API_URL = 'http://localhost:3000/auth';

  constructor(private http: HttpClient, private router: Router) { }

  async signUp(username: string, email: string, password: string) {
    try {
      const response: any = await firstValueFrom(
        this.http.post(`${this.API_URL}/register`, {
          username: username.toLowerCase(),
          email,
          password,
        })
      );

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
      const response: any = await firstValueFrom(
        this.http.post(`${this.API_URL}/login`, {
          username: username.toLowerCase(),
          password,
        })
      );

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

}
