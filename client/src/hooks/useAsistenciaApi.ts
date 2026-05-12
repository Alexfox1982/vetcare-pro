import { useState, useCallback } from 'react';
import type { Asistencia, HorarioConfig } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '';

export function useAsistenciaApi() {
  const [isLoading, setIsLoading] = useState(false);

  // Obtener todos los registros de asistencia
  const getAsistencia = useCallback(async (): Promise<Asistencia[]> => {
    try {
      const response = await fetch(`${API_URL}/api/asistencia`);
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching asistencia:', error);
    }
    return [];
  }, []);

  // Obtener asistencia por usuario
  const getAsistenciaByUsuario = useCallback(async (usuarioId: string): Promise<Asistencia[]> => {
    try {
      const response = await fetch(`${API_URL}/api/asistencia/usuario/${usuarioId}`);
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching asistencia by usuario:', error);
    }
    return [];
  }, []);

  // Obtener asistencia por fecha
  const getAsistenciaByFecha = useCallback(async (fecha: string): Promise<Asistencia[]> => {
    try {
      const response = await fetch(`${API_URL}/api/asistencia/fecha/${fecha}`);
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching asistencia by fecha:', error);
    }
    return [];
  }, []);

  // Obtener asistencia actual (entrada sin salida)
  const getAsistenciaActual = useCallback(async (usuarioId: string): Promise<Asistencia | null> => {
    try {
      const response = await fetch(`${API_URL}/api/asistencia/actual/${usuarioId}`);
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching asistencia actual:', error);
    }
    return null;
  }, []);

  // Registrar entrada
  const registrarEntrada = useCallback(async (data: {
    usuario_id: string;
    fecha: string;
    hora_entrada: string;
    tipo_registro?: 'manual' | 'automatico';
    notas?: string;
  }): Promise<Asistencia | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/asistencia/entrada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error registrando entrada:', error);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, []);

  // Registrar salida
  const registrarSalida = useCallback(async (
    id: string,
    data: { hora_salida: string; notas?: string }
  ): Promise<Asistencia | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/asistencia/${id}/salida`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error registrando salida:', error);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, []);

  // Eliminar registro de asistencia
  const deleteAsistencia = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/asistencia/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting asistencia:', error);
    }
    return false;
  }, []);

  // Obtener reporte de asistencia por período
  const getReporteAsistencia = useCallback(async (
    fechaInicio: string,
    fechaFin: string
  ): Promise<Asistencia[]> => {
    try {
      const response = await fetch(`${API_URL}/api/reportes/asistencia/${fechaInicio}/${fechaFin}`);
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching reporte asistencia:', error);
    }
    return [];
  }, []);

  // Obtener reporte de retrasos
  const getReporteRetrasos = useCallback(async (
    fechaInicio: string,
    fechaFin: string
  ): Promise<any[]> => {
    try {
      const response = await fetch(`${API_URL}/api/reportes/retrasos/${fechaInicio}/${fechaFin}`);
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching reporte retrasos:', error);
    }
    return [];
  }, []);

  // Obtener resumen de asistencia por usuario
  const getResumenAsistencia = useCallback(async (
    usuarioId: string,
    fechaInicio: string,
    fechaFin: string
  ): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/api/reportes/asistencia/resumen/${usuarioId}/${fechaInicio}/${fechaFin}`);
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching resumen asistencia:', error);
    }
    return null;
  }, []);

  // Configuración de horarios
  const getHorariosConfig = useCallback(async (usuarioId: string): Promise<HorarioConfig[]> => {
    try {
      const response = await fetch(`${API_URL}/api/horarios-config/${usuarioId}`);
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching horarios config:', error);
    }
    return [];
  }, []);

  const saveHorarioConfig = useCallback(async (data: Omit<HorarioConfig, 'id' | 'activo'>): Promise<HorarioConfig | null> => {
    try {
      const response = await fetch(`${API_URL}/api/horarios-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error saving horario config:', error);
    }
    return null;
  }, []);

  const deleteHorarioConfig = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/horarios-config/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting horario config:', error);
    }
    return false;
  }, []);

  return {
    isLoading,
    getAsistencia,
    getAsistenciaByUsuario,
    getAsistenciaByFecha,
    getAsistenciaActual,
    registrarEntrada,
    registrarSalida,
    deleteAsistencia,
    getReporteAsistencia,
    getReporteRetrasos,
    getResumenAsistencia,
    getHorariosConfig,
    saveHorarioConfig,
    deleteHorarioConfig,
  };
}
