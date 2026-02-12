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

  async getHighestRentByUser(user_id: string): Promise<number> {
    const today = new Date().toISOString();
    const now = new Date();

    // 1️⃣ Obtener contratos activos hoy
    const { data: contracts, error } = await this.db.client
      .from('contracts')
      .select('*')
      .eq('owner_id', user_id)
      .or(
        `and(valid_from.lte.${today},valid_to.gte.${today}),and(valid_from.lte.${today},valid_to.is.null)`
      );

    if (error) {
      console.error('Error al obtener contratos:', error.message);
      return 0;
    }

    if (!contracts?.length) return 0;

    // 2️⃣ Calcular alquiler actualizado por contrato
    let highestRent = 0;

    for (const contract of contracts) {
      const base = contract.rent_amount ?? 0;
      const percent = (contract.increase_percentage ?? 0) / 100;
      const frequency = contract.increase_frequency; // 'monthly' | 'quarterly' | 'yearly'

      const start = new Date(contract.valid_from);

      const end = contract.valid_to ? new Date(contract.valid_to) : now;
      const effectiveDate = now > end ? end : now;

      // Diferencia de meses
      const monthsDiff =
        (effectiveDate.getFullYear() - start.getFullYear()) * 12 +
        (effectiveDate.getMonth() - start.getMonth());

      let periods = 0;

      if (frequency === 'monthly') {
        periods = monthsDiff;
      }

      if (frequency === 'quarterly') {
        periods = Math.floor(monthsDiff / 3);
      }

      if (frequency === 'yearly') {
        periods = Math.floor(monthsDiff / 12);
      }

      // Cálculo del valor actualizado
      const updatedRent = base * Math.pow(1 + percent, Math.max(periods, 0));

      // Comparar con el máximo actual
      if (updatedRent > highestRent) {
        highestRent = updatedRent;
      }
    }

    return Math.round(highestRent);
  }

  async getLowestRentByUser(user_id: string): Promise<number> {
    const today = new Date().toISOString();
    const now = new Date();

    // 1️⃣ Obtener contratos activos hoy
    const { data: contracts, error } = await this.db.client
      .from('contracts')
      .select('*')
      .eq('owner_id', user_id)
      .or(
        `and(valid_from.lte.${today},valid_to.gte.${today}),and(valid_from.lte.${today},valid_to.is.null)`
      );

    if (error) {
      console.error('Error al obtener contratos:', error.message);
      return 0;
    }

    console.log('contracts:', contracts);

    if (!contracts?.length) return 0;

    let lowestRent = Infinity;

    // 2️⃣ Calcular alquiler actualizado por contrato
    for (const contract of contracts) {
      const base = contract.rent_amount ?? 0;
      const percent = (contract.increase_percentage ?? 0) / 100;
      const frequency = contract.increase_frequency;

      const start = new Date(contract.valid_from);

      const end = contract.valid_to ? new Date(contract.valid_to) : now;
      const effectiveDate = now > end ? end : now;

      const monthsDiff =
        (effectiveDate.getFullYear() - start.getFullYear()) * 12 +
        (effectiveDate.getMonth() - start.getMonth());

      let periods = 0;

      if (frequency === 'monthly') {
        periods = monthsDiff;
      }

      if (frequency === 'quarterly') {
        periods = Math.floor(monthsDiff / 3);
      }

      if (frequency === 'yearly') {
        periods = Math.floor(monthsDiff / 12);
      }

      const updatedRent = base * Math.pow(1 + percent, Math.max(periods, 0));

      // Comparar menor valor
      if (updatedRent < lowestRent) {
        lowestRent = updatedRent;
      }
    }

    return lowestRent === Infinity ? 0 : Math.round(lowestRent);
  }

  async getQuantityOfActiveContractsByUser(user_id: string): Promise<number> {
    const today = new Date().toISOString();

    const { count, error } = await this.db.client
      .from('contracts')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user_id)
      .or(
        `and(valid_from.lte.${today},valid_to.gte.${today}),and(valid_from.lte.${today},valid_to.is.null)`
      );

    if (error) {
      console.error('Error al contar contratos activos:', error.message);
      return 0;
    }

    return count ?? 0;
  }

  async getQuantityOfContractsToVenceByUser(user_id: string): Promise<number> {
    const today = new Date();
    const todayISO = today.toISOString();

    const ninetyDaysLater = new Date();
    ninetyDaysLater.setDate(today.getDate() + 90);
    const ninetyDaysLaterISO = ninetyDaysLater.toISOString();

    const { count, error } = await this.db.client
      .from('contracts')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user_id)
      // Debe haber empezado
      .lte('valid_from', todayISO)
      // Debe tener fecha de fin
      .not('valid_to', 'is', null)
      // No vencido aún
      .gte('valid_to', todayISO)
      // Vence dentro de 90 días
      .lte('valid_to', ninetyDaysLaterISO);

    if (error) {
      console.error('Error al contar contratos por vencer:', error.message);
      return 0;
    }

    return count ?? 0;
  }


  async getQuantityOfContractsVencedByUser(user_id: string): Promise<number> {
    const today = new Date().toISOString();

    const { count, error } = await this.db.client
      .from('contracts')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user_id)
      // Debe tener fecha de fin
      .not('valid_to', 'is', null)
      // Hoy superó la fecha de vencimiento
      .lt('valid_to', today);

    if (error) {
      console.error('Error al contar contratos vencidos:', error.message);
      return 0;
    }

    return count ?? 0;
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
