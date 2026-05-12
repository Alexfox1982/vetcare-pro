import { useState, useEffect, useCallback } from 'react';
import type { Dueno, Mascota, Cita, Turno, HistorialClinico } from '@/types';

const DUENOS_KEY = 'vetcare_duenos';
const MASCOTAS_KEY = 'vetcare_mascotas';
const CITAS_KEY = 'vetcare_citas';
const TURNOS_KEY = 'vetcare_turnos';
const HISTORIAL_KEY = 'vetcare_historial';

// Datos de ejemplo
const defaultDuenos: Dueno[] = [
  {
    id: '1',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@email.com',
    telefono: '555-1001',
    direccion: 'Calle Principal 123',
    fechaRegistro: new Date().toISOString(),
  },
  {
    id: '2',
    nombre: 'Laura',
    apellido: 'González',
    email: 'laura@email.com',
    telefono: '555-1002',
    direccion: 'Av. Las Flores 456',
    fechaRegistro: new Date().toISOString(),
  },
];

const defaultMascotas: Mascota[] = [
  {
    id: '1',
    nombre: 'Max',
    especie: 'perro',
    raza: 'Labrador',
    fechaNacimiento: '2020-05-15',
    sexo: 'macho',
    color: 'Dorado',
    peso: 28,
    duenoId: '1',
    alergias: 'Ninguna conocida',
    fechaRegistro: new Date().toISOString(),
  },
  {
    id: '2',
    nombre: 'Luna',
    especie: 'gato',
    raza: 'Siamés',
    fechaNacimiento: '2021-03-10',
    sexo: 'hembra',
    color: 'Gris',
    peso: 4.5,
    duenoId: '2',
    alergias: 'Polen',
    fechaRegistro: new Date().toISOString(),
  },
];

const defaultCitas: Cita[] = [
  {
    id: '1',
    mascotaId: '1',
    duenoId: '1',
    fecha: new Date().toISOString().split('T')[0],
    hora: '09:00',
    duracion: 30,
    motivo: 'Vacunación anual',
    medicoId: '1',
    estado: 'confirmada',
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: '2',
    mascotaId: '2',
    duenoId: '2',
    fecha: new Date().toISOString().split('T')[0],
    hora: '10:30',
    duracion: 45,
    motivo: 'Revisión de piel',
    medicoId: '1',
    estado: 'pendiente',
    fechaCreacion: new Date().toISOString(),
  },
];

export function useAppData() {
  const [duenos, setDuenos] = useState<Dueno[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [historial, setHistorial] = useState<HistorialClinico[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Cargar datos del localStorage o usar defaults
    const storedDuenos = localStorage.getItem(DUENOS_KEY);
    const storedMascotas = localStorage.getItem(MASCOTAS_KEY);
    const storedCitas = localStorage.getItem(CITAS_KEY);
    const storedTurnos = localStorage.getItem(TURNOS_KEY);
    const storedHistorial = localStorage.getItem(HISTORIAL_KEY);

    setDuenos(storedDuenos ? JSON.parse(storedDuenos) : defaultDuenos);
    setMascotas(storedMascotas ? JSON.parse(storedMascotas) : defaultMascotas);
    setCitas(storedCitas ? JSON.parse(storedCitas) : defaultCitas);
    setTurnos(storedTurnos ? JSON.parse(storedTurnos) : []);
    setHistorial(storedHistorial ? JSON.parse(storedHistorial) : []);
    setIsLoaded(true);
  }, []);

  // Persistir cambios
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(DUENOS_KEY, JSON.stringify(duenos));
    }
  }, [duenos, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(MASCOTAS_KEY, JSON.stringify(mascotas));
    }
  }, [mascotas, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CITAS_KEY, JSON.stringify(citas));
    }
  }, [citas, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(TURNOS_KEY, JSON.stringify(turnos));
    }
  }, [turnos, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
    }
  }, [historial, isLoaded]);

  // CRUD Dueños
  const addDueno = useCallback((dueno: Omit<Dueno, 'id' | 'fechaRegistro'>): Dueno => {
    const newDueno: Dueno = {
      ...dueno,
      id: Date.now().toString(),
      fechaRegistro: new Date().toISOString(),
    };
    setDuenos((prev) => [...prev, newDueno]);
    return newDueno;
  }, []);

  const updateDueno = useCallback((id: string, updates: Partial<Dueno>): boolean => {
    setDuenos((prev) => {
      const index = prev.findIndex((d) => d.id === id);
      if (index === -1) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
    return true;
  }, []);

  const deleteDueno = useCallback((id: string): boolean => {
    setDuenos((prev) => prev.filter((d) => d.id !== id));
    // También eliminar mascotas asociadas
    setMascotas((prev) => prev.filter((m) => m.duenoId !== id));
    return true;
  }, []);

  const getDuenoById = useCallback((id: string): Dueno | undefined => {
    return duenos.find((d) => d.id === id);
  }, [duenos]);

  // CRUD Mascotas
  const addMascota = useCallback((mascota: Omit<Mascota, 'id' | 'fechaRegistro'>): Mascota => {
    const newMascota: Mascota = {
      ...mascota,
      id: Date.now().toString(),
      fechaRegistro: new Date().toISOString(),
    };
    setMascotas((prev) => [...prev, newMascota]);
    return newMascota;
  }, []);

  const updateMascota = useCallback((id: string, updates: Partial<Mascota>): boolean => {
    setMascotas((prev) => {
      const index = prev.findIndex((m) => m.id === id);
      if (index === -1) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
    return true;
  }, []);

  const deleteMascota = useCallback((id: string): boolean => {
    setMascotas((prev) => prev.filter((m) => m.id !== id));
    return true;
  }, []);

  const getMascotaById = useCallback((id: string): Mascota | undefined => {
    return mascotas.find((m) => m.id === id);
  }, [mascotas]);

  const getMascotasByDueno = useCallback((duenoId: string): Mascota[] => {
    return mascotas.filter((m) => m.duenoId === duenoId);
  }, [mascotas]);

  // CRUD Citas
  const addCita = useCallback((cita: Omit<Cita, 'id' | 'fechaCreacion'>): Cita => {
    const newCita: Cita = {
      ...cita,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString(),
    };
    setCitas((prev) => [...prev, newCita]);
    return newCita;
  }, []);

  const updateCita = useCallback((id: string, updates: Partial<Cita>): boolean => {
    setCitas((prev) => {
      const index = prev.findIndex((c) => c.id === id);
      if (index === -1) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
    return true;
  }, []);

  const deleteCita = useCallback((id: string): boolean => {
    setCitas((prev) => prev.filter((c) => c.id !== id));
    return true;
  }, []);

  const getCitasByFecha = useCallback((fecha: string): Cita[] => {
    return citas.filter((c) => c.fecha === fecha);
  }, [citas]);

  const getCitasByMedico = useCallback((medicoId: string): Cita[] => {
    return citas.filter((c) => c.medicoId === medicoId);
  }, [citas]);

  // CRUD Turnos
  const addTurno = useCallback((turno: Omit<Turno, 'id'>): Turno => {
    const newTurno: Turno = {
      ...turno,
      id: Date.now().toString(),
    };
    setTurnos((prev) => [...prev, newTurno]);
    return newTurno;
  }, []);

  const updateTurno = useCallback((id: string, updates: Partial<Turno>): boolean => {
    setTurnos((prev) => {
      const index = prev.findIndex((t) => t.id === id);
      if (index === -1) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
    return true;
  }, []);

  const deleteTurno = useCallback((id: string): boolean => {
    setTurnos((prev) => prev.filter((t) => t.id !== id));
    return true;
  }, []);

  const getTurnosByFecha = useCallback((fecha: string): Turno[] => {
    return turnos.filter((t) => t.fecha === fecha);
  }, [turnos]);

  const getTurnosByUsuario = useCallback((usuarioId: string): Turno[] => {
    return turnos.filter((t) => t.usuarioId === usuarioId);
  }, [turnos]);

  // CRUD Historial Clínico
  const addHistorial = useCallback((registro: Omit<HistorialClinico, 'id'>): HistorialClinico => {
    const newRegistro: HistorialClinico = {
      ...registro,
      id: Date.now().toString(),
    };
    setHistorial((prev) => [...prev, newRegistro]);
    return newRegistro;
  }, []);

  const updateHistorial = useCallback((id: string, updates: Partial<HistorialClinico>): boolean => {
    setHistorial((prev) => {
      const index = prev.findIndex((h) => h.id === id);
      if (index === -1) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
    return true;
  }, []);

  const deleteHistorial = useCallback((id: string): boolean => {
    setHistorial((prev) => prev.filter((h) => h.id !== id));
    return true;
  }, []);

  const getHistorialByMascota = useCallback((mascotaId: string): HistorialClinico[] => {
    return historial.filter((h) => h.mascotaId === mascotaId).sort((a, b) => 
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
