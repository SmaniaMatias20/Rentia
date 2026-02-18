import { Injectable } from '@angular/core';
import { Database } from '../database/database';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  constructor(private database: Database) { }

  async getPaymentsByContract(contractId: string): Promise<any[]> {
    const { data, error } = await this.database.client
      .from('payments')
      .select('*')
      .eq('contract_id', contractId);

    if (error) {
      console.error('Error al obtener pagos:', error.message);
      return [];
    }

    return data || [];
  }

  async createPayment(payment: any): Promise<{ error?: PostgrestError; data?: any }> {

    if (payment.water && payment.electricy && payment.gas && payment.hoa_fees && payment.rent_amount >= payment.total_rent_amount) {
      payment.status = true;
    } else {
      payment.status = false;
    }

    const { data, error } = await this.database.client
      .from('payments')
      .insert(payment)
      .select('*'); // pedimos que devuelva filas

    if (error) {
      console.error('Error al crear pago:', error.message);
      return { error };
    }

    // Supabase devuelve array si no usás .single()
    const inserted = Array.isArray(data) ? data[0] : data;

    if (!inserted) {
      return {
        error: {
          message: 'No se pudo recuperar el pago creado',
        } as PostgrestError,
      };
    }

    return { data: inserted };
  }

  async updatePayment(payment: any): Promise<{ error?: PostgrestError }> {

    if (payment.water && payment.electricy && payment.gas && payment.hoa_fees && payment.rent_amount >= payment.total_rent_amount) {
      payment.status = true;
    } else {
      payment.status = false;
    }

    const { error } = await this.database.client
      .from('payments')
      .update(payment)
      .eq('id', payment.id);

    if (error) {
      console.error('Error al actualizar pago:', error.message);
      return { error };
    }

    return {};
  }

  async getMonthlyRentIncomeByUser(
    userId: string,
    year: number,
    month: number
  ): Promise<number> {

    // 📅 rango del mes
    const from = new Date(year, month - 1, 1).toISOString();
    const to = new Date(year, month, 1).toISOString();

    // 🔎 1. obtener contratos del usuario
    const { data: contracts, error: errorContracts } =
      await this.database.client
        .from('contracts')
        .select('id')
        .eq('owner_id', userId);

    if (errorContracts) {
      console.error('Error al obtener contratos:', errorContracts.message);
      return 0;
    }

    if (!contracts?.length) return 0;

    const contractIds = contracts.map(c => c.id);

    // 💰 2. obtener pagos del mes
    const { data: payments, error: errorPayments } =
      await this.database.client
        .from('payments')
        .select('rent_amount')
        .in('contract_id', contractIds)
        .gte('rent_month', from)
        .lt('rent_month', to);

    if (errorPayments) {
      console.error('Error al obtener pagos:', errorPayments.message);
      return 0;
    }

    // ➕ 3. suma total
    const total = payments.reduce(
      (acc, p) => acc + (p.rent_amount ?? 0),
      0
    );

    return total;
  }

  async getMonthlyElectricityIncomeByUser(
    userId: string,
    year: number,
    month: number
  ): Promise<number> {
    // 📅 rango del mes
    const from = new Date(year, month - 1, 1).toISOString();
    const to = new Date(year, month, 1).toISOString();

    // 🔎 1. obtener contratos del usuario
    const { data: contracts, error: errorContracts } =
      await this.database.client
        .from('contracts')
        .select('id')
        .eq('owner_id', userId);

    if (errorContracts) {
      console.error('Error al obtener contratos:', errorContracts.message);
      return 0;
    }

    if (!contracts?.length) return 0;

    const contractIds = contracts.map(c => c.id);

    // 💰 2. obtener pagos del mes
    const { data: payments, error: errorPayments } =
      await this.database.client
        .from('payments')
        .select('electricy_amount')
        .in('contract_id', contractIds)
        .gte('rent_month', from)
        .lt('rent_month', to)
        .eq('electricy', true);

    if (errorPayments) {
      console.error('Error al obtener pagos:', errorPayments.message);
      return 0;
    }

    // ➕ 3. suma total
    const total = payments.reduce(
      (acc, p) => acc + (p.electricy_amount ?? 0),
      0
    );

    return total;
  }

  async getMonthlyGasIncomeByUser(
    userId: string,
    year: number,
    month: number
  ): Promise<number> {
    // 📅 rango del mes
    const from = new Date(year, month - 1, 1).toISOString();
    const to = new Date(year, month, 1).toISOString();

    // 🔎 1. obtener contratos del usuario
    const { data: contracts, error: errorContracts } =
      await this.database.client
        .from('contracts')
        .select('id')
        .eq('owner_id', userId);

    if (errorContracts) {
      console.error('Error al obtener contratos:', errorContracts.message);
      return 0;
    }

    if (!contracts?.length) return 0;

    const contractIds = contracts.map(c => c.id);

    // 💰 2. obtener pagos del mes
    const { data: payments, error: errorPayments } =
      await this.database.client
        .from('payments')
        .select('gas_amount')
        .in('contract_id', contractIds)
        .gte('rent_month', from)
        .lt('rent_month', to)
        .eq('gas', true);

    if (errorPayments) {
      console.error('Error al obtener pagos:', errorPayments.message);
      return 0;
    }

    // ➕ 3. suma total
    const total = payments.reduce(
      (acc, p) => acc + (p.gas_amount ?? 0),
      0
    );

    return total;
  }

  async getMonthlyHoaIncomeByUser(
    userId: string,
    year: number,
    month: number
  ): Promise<number> {
    // 📅 rango del mes
    const from = new Date(year, month - 1, 1).toISOString();
    const to = new Date(year, month, 1).toISOString();

    // 🔎 1. obtener contratos del usuario
    const { data: contracts, error: errorContracts } =
      await this.database.client
        .from('contracts')
        .select('id')
        .eq('owner_id', userId);

    if (errorContracts) {
      console.error('Error al obtener contratos:', errorContracts.message);
      return 0;
    }

    if (!contracts?.length) return 0;

    const contractIds = contracts.map(c => c.id);

    // 💰 2. obtener pagos del mes
    const { data: payments, error: errorPayments } =
      await this.database.client
        .from('payments')
        .select('hoa_fees_amount')
        .in('contract_id', contractIds)
        .gte('rent_month', from)
        .lt('rent_month', to)
        .eq('hoa_fees', true);

    if (errorPayments) {
      console.error('Error al obtener pagos:', errorPayments.message);
      return 0;
    }

    // ➕ 3. suma total
    const total = payments.reduce(
      (acc, p) => acc + (p.hoa_fees_amount ?? 0),
      0
    );

    return total;
  }

  async getMonthlyWaterIncomeByUser(
    userId: string,
    year: number,
    month: number
  ): Promise<number> {
    // 📅 rango del mes
    const from = new Date(year, month - 1, 1).toISOString();
    const to = new Date(year, month, 1).toISOString();

    // 🔎 1. obtener contratos del usuario
    const { data: contracts, error: errorContracts } =
      await this.database.client
        .from('contracts')
        .select('id')
        .eq('owner_id', userId);

    if (errorContracts) {
      console.error('Error al obtener contratos:', errorContracts.message);
      return 0;
    }

    if (!contracts?.length) return 0;

    const contractIds = contracts.map(c => c.id);

    // 💰 2. obtener pagos del mes
    const { data: payments, error: errorPayments } =
      await this.database.client
        .from('payments')
        .select('water_amount')
        .in('contract_id', contractIds)
        .gte('rent_month', from)
        .lt('rent_month', to)
        .eq('water', true);

    if (errorPayments) {
      console.error('Error al obtener pagos:', errorPayments.message);
      return 0;
    }

    // ➕ 3. suma total
    const total = payments.reduce(
      (acc, p) => acc + (p.water_amount ?? 0),
      0
    );

    return total;
  }


}
