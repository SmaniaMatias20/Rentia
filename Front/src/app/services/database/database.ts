import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Database {
  supabase: SupabaseClient<any, "public", any>;

  /**
   * Constructor de la clase DatabaseService.
   * 
   * Este constructor inicializa la conexión a Supabase utilizando las credenciales definidas en el archivo de configuración del entorno.
   */
  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  /**
   * Getter para acceder al cliente de Supabase.
   * 
   * @returns {SupabaseClient} El cliente de Supabase.
   */
  get client(): SupabaseClient {
    return this.supabase;
  }

}
