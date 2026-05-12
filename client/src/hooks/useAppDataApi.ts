import { useState, useEffect, useCallback } from 'react';
import type { Dueno, Mascota, Cita, Turno, HistorialClinico } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '';

export function useAppDataApi() {
  const [duenos, setDuenos] = useState<Dueno[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [historial, setHistorial] = useState<HistorialClinico[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      const [duenosRes, mascotasRes, citasRes, turnosRes, historialRes] = await Promise.all([
        fetch(`${API_URL}/api/duenos`),
        fetch(`${API_URL}/api/mascotas`),
        fetch(`${API_URL}/api/citas`),
        fetch(`${API_URL}/api/turnos`),
        fetch(`${API_URL}/api/historial`),
      ]);

      if (duenosRes.ok) setDuenos(await duenosRes.json());
      if (mascotasRes.ok) setMascotas(await mascotasRes.json());
      if (citasRes.ok) setCitas(await citasRes.json());
      if (turnosRes.ok) setTurnos(await turnosRes.json());
      if (historialRes.ok) setHistorial(await historialRes.json());

      setIsLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // CRUD Dueños
  const addDueno = useCallback(async (dueno: Omit<Dueno, 'id' | 'fechaRegistro'>): Promise<Dueno | null> => {
    try {
      const response = await fetch(`${API_URL}/api/duenos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dueno),
      });
      if (response.ok) {
        const newDueno = await response.json();
        setDuenos(prev => [...prev, newDueno]);
        return newDueno;
      }
    } catch (error) {
      console.error('Error adding dueno:', error);
    }
    return null;
  }, []);

  const updateDueno = useCallback(async (id: string, updates: Partial<Dueno>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/duenos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updated = await response.json();
        setDuenos(prev => prev.map(d => d.id === id ? updated : d));
        return true;
      }
    } catch (error) {
      console.error('Error updating dueno:', error);
    }
    return false;
  }, []);

  const deleteDueno = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/duenos/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setDuenos(prev => prev.filter(d => d.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting dueno:', error);
    }
    return false;
  }, []);

  const getDuenoById = useCallback((id: string): Dueno | undefined => {
    return duenos.find(d => d.id === id);
  }, [duenos]);

  // CRUD Mascotas
  const addMascota = useCallback(async (mascota: Omit<Mascota, 'id' | 'fechaRegistro'>): Promise<Mascota | null> => {
    try {
      const response = await fetch(`${API_URL}/api/mascotas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mascota),
      });
      if (response.ok) {
        const newMascota = await response.json();
        setMascotas(prev => [...prev, newMascota]);
        return newMascota;
      }
    } catch (error) {
      console.error('Error adding mascota:', error);
    }
    return null;
  }, []);

  const updateMascota = useCallback(async (id: string, updates: Partial<Mascota>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/mascotas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updated = await response.json();
        setMascotas(prev => prev.map(m => m.id === id ? updated : m));
        return true;
      }
    } catch (error) {
      console.error('Error updating mascota:', error);
    }
    return false;
  }, []);

  const deleteMascota = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/mascotas/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMascotas(prev => prev.filter(m => m.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting mascota:', error);
    }
    return false;
  }, []);

  const getMascotaById = useCallback((id: string): Mascota | undefined => {
    return mascotas.find(m => m.id === id);
  }, [mascotas]);

  const getMascotasByDueno = useCallback((duenoId: string): Mascota[] => {
    return mascotas.filter(m => m.duenoId === duenoId);
  }, [mascotas]);

  // CRUD Citas
  const addCita = useCallback(async (cita: Omit<Cita, 'id' | 'fechaCreacion'>): Promise<Cita | null> => {
    try {
      const response = await fetch(`${API_URL}/api/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cita),
      });
      if (response.ok) {
        const newCita = await response.json();
        setCitas(prev => [...prev, newCita]);
        return newCita;
      }
    } catch (error) {
      console.error('Error adding cita:', error);
    }
    return null;
  }, []);

  const updateCita = useCallback(async (id: string, updates: Partial<Cita>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/citas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updated = await response.json();
        setCitas(prev => prev.map(c => c.id === id ? updated : c));
        return true;
      }
    } catch (error) {
      console.error('Error updating cita:', error);
    }
    return false;
  }, []);

  const deleteCita = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/citas/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCitas(prev => prev.filter(c => c.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting cita:', error);
    }
    return false;
  }, []);

  const getCitasByFecha = useCallback((fecha: string): Cita[] => {
    return citas.filter(c => c.fecha === fecha);
  }, [citas]);

  const getCitasByMedico = useCallback((medicoId: string): Cita[] => {
    return citas.filter(c => c.medicoId === medicoId);
  }, [citas]);

  // CRUD Turnos
  const addTurno = useCallback(async (turno: Omit<Turno, 'id'>): Promise<Turno | null> => {
    try {
      const response = await fetch(`${API_URL}/api/turnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(turno),
      });
      if (response.ok) {
        const newTurno = await response.json();
        setTurnos(prev => [...prev, newTurno]);
        return newTurno;
      }
    } catch (error) {
      console.error('Error adding turno:', error);
    }
    return null;
  }, []);

  const updateTurno = useCallback(async (id: string, updates: Partial<Turno>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/turnos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updated = await response.json();
        setTurnos(prev => prev.map(t => t.id === id ? updated : t));
        return true;
      }
    } catch (error) {
      console.error('Error updating turno:', error);
    }
    return false;
  }, []);

  const deleteTurno = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/turnos/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTurnos(prev => prev.filter(t => t.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting turno:', error);
    }
    return false;
  }, []);

  const getTurnosByFecha = useCallback((fecha: string): Turno[] => {
    return turnos.filter(t => t.fecha === fecha);
  }, [turnos]);

  const getTurnosByUsuario = useCallback((usuarioId: string): Turno[] => {
    return turnos.filter(t => t.usuarioId === usuarioId);
  }, [turnos]);

  // CRUD Historial Clínico
  const addHistorial = useCallback(async (registro: Omit<HistorialClinico, 'id'>): Promise<HistorialClinico | null> => {
    try {
      const response = await fetch(`${API_URL}/api/historial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registro),
      });
      if (response.ok) {
        const newRegistro = await response.json();
        setHistorial(prev => [...prev, newRegistro]);
        return newRegistro;
      }
    } catch (error) {
      console.error('Error adding historial:', error);
    }
    return null;
  }, []);

  const updateHistorial = useCallback(async (id: string, updates: Partial<HistorialClinico>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/historial/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updated = await response.json();
        setHistorial(prev => prev.map(h => h.id === id ? updated : h));
        return true;
      }
    } catch (error) {
      console.error('Error updating historial:', error);
    }
    return false;
  }, []);

  const deleteHistorial = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/historial/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setHistorial(prev => prev.filter(h => h.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting historial:', error);
    }
    return false;
  }, []);

  const getHistorialByMascota = useCallback((mascotaId: string): HistorialClinico[] => {
    return historial.filter(h => h.mascotaId === mascotaId).sort((a, b) =>
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }, [historial]);

  return {
    duenos,
    mascotas,
    citas,
    turnos,
    historial,
    isLoaded,
    fetchAllData,
    // Dueños
    addDueno,
    updateDueno,
    deleteDueno,
    getDuenoById,
    // Mascotas
    addMascota,
    updateMascota,
    deleteMascota,
    getMascotaById,
    getMascotasByDueno,
    // Citas
    addCita,
    updateCita,
    deleteCita,
    getCitasByFecha,
    getCitasByMedico,
    // Turnos
    addTurno,
    updateTurno,
    deleteTurno,
    getTurnosByFecha,
    getTurnosByUsuario,
    // Historial
    addHistorial,
    updateHistorial,
    deleteHistorial,
    getHistorialByMascota,
  };
}
