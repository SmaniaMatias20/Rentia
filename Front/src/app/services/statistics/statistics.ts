import { Injectable } from '@angular/core';
import { Database } from '../database/database';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {

  constructor(private db: Database) { }

  async getStatisticsByUser(user_id: string): Promise<any> {
    try {
      // 🚀 Ejecutar todo en paralelo
      const [
        quantityOfPropertiesByUser,
        quantityOfPropertiesWithTenantByUser,
        quantityOfTenantsByUser,
        highestRent,
        lowestRent,
        quantityOfActiveContractsByUser,
        quantityOfContractsToVenceByUser,
        quantityOfContractsVencedByUser,
        quantityOfContractsPendingByUser,
      ] = await Promise.all([
        this.getQuantityOfPropertiesByUser(user_id),
        this.getQuantityOfPropertiesWithActiveTenantByUser(user_id),
        this.getQuantityOfTenantsByUser(user_id),
        this.getHighestRentByUser(user_id),
        this.getLowestRentByUser(user_id),
        this.getQuantityOfActiveContractsByUser(user_id),
        this.getQuantityOfContractsToVenceByUser(user_id),
        this.getQuantityOfContractsVencedByUser(user_id),
        this.getQuantityOfContractsPendingByUser(user_id),
      ]);

      // 🧮 Derivados
      const quantityOfPropertiesWithoutTenantByUser =
        quantityOfPropertiesByUser -
        quantityOfPropertiesWithTenantByUser;

      const percentageOfPropertiesWithTenantByUser =
        quantityOfPropertiesByUser > 0
          ? Math.round(
            (quantityOfPropertiesWithTenantByUser /
              quantityOfPropertiesByUser) *
            100
          )
          : 0;

      const percentageOfPropertiesWithoutTenantByUser =
        quantityOfPropertiesByUser > 0
          ? Math.round(
            (quantityOfPropertiesWithoutTenantByUser /
              quantityOfPropertiesByUser) *
            100
          )
          : 0;

      // 📦 Respuesta unificada
      return {
        properties: {
          total: quantityOfPropertiesByUser,
          withTenant: quantityOfPropertiesWithTenantByUser,
          withoutTenant: quantityOfPropertiesWithoutTenantByUser,
          percentageWithTenant: percentageOfPropertiesWithTenantByUser,
          percentageWithoutTenant: percentageOfPropertiesWithoutTenantByUser,
        },
        tenants: quantityOfTenantsByUser,
        rents: {
          highest: highestRent,
          lowest: lowestRent,
        },
        contracts: {
          active: quantityOfActiveContractsByUser,
          toExpire: quantityOfContractsToVenceByUser,
          expired: quantityOfContractsVencedByUser,
          pending: quantityOfContractsPendingByUser,
        },
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }


  async getQuantityOfPropertiesByUser(user_id: string): Promise<number> {
    const { count, error } = await this.db.client
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id);

    if (error) {
      console.error('Error al obtener la cantidad de propiedades:', error.message);
      return 0;
    }

    return count ?? 0;
  }


  async getQuantityOfPropertiesWithActiveTenantByUser(
    user_id: string
  ): Promise<number> {
    const today = new Date().toISOString();

    // 1️⃣ Obtener IDs de propiedades del usuario
    const { data: properties, error: propertiesError } = await this.db.client
      .from('properties')
      .select('id')
      .eq('user_id', user_id);

    if (propertiesError || !properties?.length) {
      console.error('Error al obtener propiedades:', propertiesError?.message);
      return 0;
    }

    const propertyIds = properties.map(p => p.id);

    // 2️⃣ Obtener contratos activos HOY
    const { data: contracts, error: contractsError } = await this.db.client
      .from('contracts')
      .select('property_id')
      .in('property_id', propertyIds)
      .or(
        `and(valid_from.lte.${today},valid_to.gte.${today}),and(valid_from.lte.${today},valid_to.is.null)`
      );

    if (contractsError) {
      console.error('Error al obtener contratos:', contractsError.message);
      return 0;
    }

    if (!contracts?.length) return 0;

    const activePropertyIds = [...new Set(contracts.map(c => c.property_id))];

    // 3️⃣ Contar propiedades con contrato activo
    const { count, error: countError } = await this.db.client
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .in('id', activePropertyIds);

    if (countError) {
      console.error('Error al contar propiedades activas:', countError.message);
      return 0;
    }

    return count ?? 0;
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

  async getQuantityOfContractsPendingByUser(userId: string): Promise<number> {
    // cantidad de contratos donde valid_from es mayor que la fecha actual
    const { count, error } = await this.db.client
      .from('contracts')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .gt('valid_from', new Date().toISOString());

    if (error) {
      console.error('Error al contar contratos pendientes:', error.message);
      return 0;
    }

    return count ?? 0;
  }


}
