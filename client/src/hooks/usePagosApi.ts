import { useState, useCallback } from 'react';
import type { Pago, ReporteFinancieroDiario, ReporteFinancieroSemanal, ReporteFinancieroMensual } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '';

export function usePagosApi() {
  const [isLoading, setIsLoading] = useState(false);

  // Obtener todos los pagos
  const getPagos = useCallback(async (): Promise<Pago[]> => {
    try {
      const response = await fetch(`${API_URL}/api/pagos`);
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching pagos:', error);
    }
    return [];
  }, []);

  // Obtener pagos por fecha
  const getPagosByFecha = useCallback(async (fecha: string): Promise<Pago[]> => {
    try {
      const response = await fetch(`${API_URL}/api/pagos/fecha/${fecha}`);
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching pagos by fecha:', error);
    }
    return [];
  }, []);

  // Obtener pagos por rango de fechas
  const getPagosByRango = useCallback(async (fechaInicio: string, fechaFin: string): Promise<Pago[]> => {
    try {
      const response = await fetch(`${API_URL}/api/pagos/rango/${fechaInicio}/${fechaFin}`);
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching pagos by rango:', error);
    }
    return [];
  }, []);

  // Crear pago
  const createPago = useCallback(async (data: Omit<Pago, 'id' | 'fechaPago'>): Promise<Pago | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error creating pago:', error);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, []);

  // Actualizar pago
  const updatePago = useCallback(async (id: string, data: Partial<Pago>): Promise<Pago | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/pagos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error updating pago:', error);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, []);

  // Eliminar pago
  const deletePago = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/pagos/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting pago:', error);
    }
    return false;
  }, []);

  // Reporte financiero diario
  const getReporteDiario = useCallback(async (fecha: string): Promise<ReporteFinancieroDiario | null> => {
    try {
      const response = await fetch(`${API_URL}/api/reportes/financiero/diario/${fecha}`);
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching reporte diario:', error);
    }
    return null;
  }, []);

  // Reporte financiero semanal
  const getReporteSemanal = useCallback(async (fechaInicio: string): Promise<ReporteFinancieroSemanal | null> => {
    try {
      const response = await fetch(`${API_URL}/api/reportes/financiero/semanal/${fechaInicio}`);
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching reporte semanal:', error);
    }
    return null;
  }, []);

  // Reporte financiero mensual
  const getReporteMensual = useCallback(async (anio: string, mes: string): Promise<ReporteFinancieroMensual | null> => {
    try {
      const response = await fetch(`${API_URL}/api/reportes/financiero/mensual/${anio}/${mes}`);
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching reporte mensual:', error);
    }
    return null;
  }, []);

  return {
    isLoading,
    getPagos,
    getPagosByFecha,
    getPagosByRango,
    createPago,
    updatePago,
    deletePago,
    getReporteDiario,
    getReporteSemanal,
    getReporteMensual,
  };
}
