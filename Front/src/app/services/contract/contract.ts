import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Database } from '../database/database';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class ContractService {

  constructor(private db: Database, private router: Router) { }

  async createContract(contract: {
    property_id: string,
    tenant_id: string,
    rent_amount: number,
    currency: string,
    increase_percentage: number,
    increase_frequency: string,
    valid_from: string,
    valid_to: string,
    owner_id: string
  }): Promise<{ error?: PostgrestError | { message: string } }> {

    // 1️⃣ Buscar contratos existentes que se crucen
    const { data: conflicts, error: conflictError } = await this.db.client
      .from('contracts')
      .select('id, valid_from, valid_to')
      .eq('property_id', contract.property_id)
      .or(
        `and(valid_from.lte.${contract.valid_to},valid_to.gte.${contract.valid_from}),and(valid_from.lte.${contract.valid_to},valid_to.is.null)`
      );

    if (conflictError) {
      console.error('Error verificando conflictos:', conflictError.message);
      return { error: conflictError };
    }

    // 2️⃣ Si hay contratos cruzados → BLOQUEAR
    if (conflicts && conflicts.length > 0) {
      console.log('contrato', conflicts);
      return {
        error: {
          message: 'Ya existe un contrato para esta propiedad dentro de ese rango de fechas'
        } as any
      };
    }

    // 3️⃣ Insertar contrato si no hay conflicto
    const { error } = await this.db.client
      .from('contracts')
      .insert([contract]);

    if (error) {
      console.error('Error al crear contrato:', error.message);
      return { error };
    }

    console.log('Contrato creado correctamente');
    return {};
  }

  async getContractsByUser(user_id: string): Promise<any[]> {
    const { data, error } = await this.db.client
      .from('contracts')
      .select('*')
      .eq('owner_id', user_id);

    if (error) {
      console.error('Error al obtener contratos:', error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    // 📌 IDs únicos de propiedades
    const propertyIds = [...new Set(data.map(c => c.property_id))];

    // 📌 Obtener propiedades
    const { data: properties } = await this.db.client
      .from('properties')
      .select('id, name')
      .in('id', propertyIds);

    // 📌 IDs únicos de inquilinos
    const tenantIds = [...new Set(data.map(c => c.tenant_id))];

    // 📌 Obtener tenants
    const { data: tenants } = await this.db.client
      .from('users')
      .select('id, username')
      .in('id', tenantIds);

    // 📌 Crear mapas para lookup rápido
    const propertyMap = new Map(properties?.map(p => [p.id, p.name]));
    const tenantMap = new Map(tenants?.map(t => [t.id, t.username]));

    // 📌 Asignar nombres a cada contrato
    data.forEach(contract => {
      contract.property_name = propertyMap.get(contract.property_id) ?? 'Sin información';
      contract.tenant_name = tenantMap.get(contract.tenant_id) ?? 'Sin información';
    });

    console.log('contratos', data);

    return data;
  }




}
