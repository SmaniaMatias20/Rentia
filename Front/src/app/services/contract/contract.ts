import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Database } from '../database/database';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class ContractService {

  constructor(private db: Database, private router: Router) { }

  async getAll(): Promise<any[]> {
    // 1️⃣ Traemos todos los contratos
    const { data: contracts, error: contractError } = await this.db.client
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (contractError) {
      console.error('Error al obtener contratos:', contractError.message);
      return [];
    }
    if (!contracts || contracts.length === 0) return [];

    // 2️⃣ Extraemos IDs únicos de owner_id, tenant_id y property_id
    const ownerIds = Array.from(new Set(contracts.map(c => c.owner_id).filter(Boolean)));
    const tenantIds = Array.from(new Set(contracts.map(c => c.tenant_id).filter(Boolean)));
    const propertyIds = Array.from(new Set(contracts.map(c => c.property_id).filter(Boolean)));

    // 3️⃣ Traemos usuarios que coincidan con owner_id o tenant_id
    const { data: users, error: userError } = await this.db.client
      .from('users')
      .select('id, username')
      .in('id', [...ownerIds, ...tenantIds]);

    if (userError) {
      console.error('Error al obtener usuarios:', userError.message);
    }

    // 4️⃣ Creamos un mapa id -> username
    const idToUsernameMap: Record<string, string> = {};
    users?.forEach(user => {
      idToUsernameMap[user.id] = user.username;
    });

    // 5️⃣ Traemos propiedades que coincidan con property_id
    const { data: properties, error: propertyError } = await this.db.client
      .from('properties')
      .select('id, name')
      .in('id', propertyIds);

    if (propertyError) {
      console.error('Error al obtener propiedades:', propertyError.message);
    }

    // 6️⃣ Creamos un mapa id -> property name
    const idToPropertyNameMap: Record<string, string> = {};
    properties?.forEach(prop => {
      idToPropertyNameMap[prop.id] = prop.name;
    });

    // 7️⃣ Reemplazamos owner_id, tenant_id y property_id por nombres
    const result = contracts.map(contract => ({
      ...contract,
      owner_id: contract.owner_id ? idToUsernameMap[contract.owner_id] || contract.owner_id : null,
      tenant_id: contract.tenant_id ? idToUsernameMap[contract.tenant_id] || contract.tenant_id : null,
      property_id: contract.property_id ? idToPropertyNameMap[contract.property_id] || contract.property_id : null
    }));

    return result;
  }

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

    return {};
  }

  async getContractsByUser(user_id: string, filter = 'all'): Promise<any[]> {

    // Filtrar contratos
    let query = this.db.client
      .from('contracts')
      .select('*')
      .eq('owner_id', user_id)

    if (filter === 'active') {
      query = query.eq('status', true);
    } else if (filter === 'inactive') {
      query = query.eq('status', false);
    }

    const { data, error } = await query;

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

    return data;
  }

  async deleteContract(id: string): Promise<{ error?: PostgrestError | { message: string } }> {
    const { error } = await this.db.client
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar contrato:', error.message);
      return { error };
    }

    return {};
  }

  async updateContractStatus(contractId: any, status: boolean): Promise<{ error?: PostgrestError }> {

    const { error } = await this.db.client
      .from('contracts')
      .update({ status })
      .eq('id', contractId);

    if (error) {
      console.error('Error al actualizar estado:', error.message);
      return { error };
    }

    return {};
  }
}
