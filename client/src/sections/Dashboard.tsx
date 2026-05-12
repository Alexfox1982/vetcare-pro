import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  PawPrint, 
  Users, 
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { format, addDays, subDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Cita, Mascota, Dueno, User } from '@/types';

interface DashboardProps {
  citas: Cita[];
  mascotas: Mascota[];
  duenos: Dueno[];
  users: User[];
  onNuevaCita: () => void;
  onVerCita: (cita: Cita) => void;
}

type VistaCalendario = 'dia' | 'semana';

export function Dashboard({ 
  citas, 
  mascotas, 
  duenos, 
  users,
  onNuevaCita, 
  onVerCita 
}: DashboardProps) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [vista, setVista] = useState<VistaCalendario>('dia');

  const citasDelDia = useMemo(() => {
    const fechaStr = format(fechaSeleccionada, 'yyyy-MM-dd');
    return citas
      .filter(c => c.fecha === fechaStr)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [citas, fechaSeleccionada]);

  const semanaActual = useMemo(() => {
    const inicio = startOfWeek(fechaSeleccionada, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(inicio, i));
  }, [fechaSeleccionada]);

  // Citas de la semana (para uso futuro)
  useMemo(() => {
    return citas.filter(c => {
      const citaFecha = parseISO(c.fecha);
      return semanaActual.some(d => isSameDay(d, citaFecha));
    });
  }, [citas, semanaActual]);

  const getMascotaNombre = (id: string) => {
    const m = mascotas.find(m => m.id === id);
    return m?.nombre || 'Desconocido';
  };

  const getDuenoNombre = (id: string) => {
    const d = duenos.find(d => d.id === id);
    return d ? `${d.nombre} ${d.apellido}` : 'Desconocido';
  };

  const getMedicoNombre = (id?: string) => {
    if (!id) return 'Sin asignar';
    const u = users.find(u => u.id === id);
    return u?.nombre || 'Desconocido';
  };

  const getEstadoBadge = (estado: string) => {
    const styles: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmada: 'bg-green-100 text-green-800 border-green-300',
      en_curso: 'bg-blue-100 text-blue-800 border-blue-300',
      completada: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelada: 'bg-red-100 text-red-800 border-red-300',
    };
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      en_curso: 'En curso',
      completada: 'Completada',
      cancelada: 'Cancelada',
    };
    return (
      <Badge variant="outline" className={styles[estado] || styles.pendiente}>
        {labels[estado] || estado}
      </Badge>
    );
  };

  const navegarDia = (direccion: 'anterior' | 'siguiente') => {
    setFechaSeleccionada(prev => 
      direccion === 'anterior' ? subDays(prev, 1) : addDays(prev, 1)
    );
  };

  const navegarSemana = (direccion: 'anterior' | 'siguiente') => {
    setFechaSeleccionada(prev => 
      direccion === 'anterior' ? subDays(prev, 7) : addDays(prev, 7)
    );
  };

  const estadisticas = [
    { 
      label: 'Citas Hoy', 
      value: citasDelDia.length, 
      icon: CalendarIcon, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Pacientes', 
      value: mascotas.length, 
      icon: PawPrint, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Dueños', 
      value: duenos.length, 
      icon: Users, 
      color: 'bg-purple-500' 
    },
    { 
      label: 'Médicos', 
      value: users.filter(u => u.rol === 'medico').length, 
      icon: Stethoscope, 
      color: 'bg-orange-500' 
    },
  ];

  return (
    <div className="space-y-6 px-2 sm:px-4 pb-10">	
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel Principal</h1>
          <p className="text-gray-600">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
	<Button
  onClick={onNuevaCita}
  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl shadow-lg"
>
  <Plus className="w-4 h-4 mr-2" />
  Nueva Cita
</Button>
      </div>

      {/* Estadísticas */}

	<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
  {estadisticas.map((stat, index) => {
    const Icon = stat.icon;

    return (
	<Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                {stat.label}
              </p>

              <h3 className="text-3xl font-bold mt-2 text-gray-800">
                {stat.value}
              </h3>
            </div>

            <div className={`${stat.color} p-4 rounded-2xl shadow-lg`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  })}
</div>

      {/* Calendario / Agenda */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-teal-600" />
              Agenda de Citas
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={vista === 'dia' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setVista('dia')}
                  className={vista === 'dia' ? 'bg-teal-600' : ''}
                >
                  Día
                </Button>
                <Button
                  variant={vista === 'semana' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setVista('semana')}
                  className={vista === 'semana' ? 'bg-teal-600' : ''}
                >
                  Semana
                </Button>
              </div>
            </div>
          </div>

          {/* Navegación de fecha */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => vista === 'dia' ? navegarDia('anterior') : navegarSemana('anterior')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium text-lg">
              {vista === 'dia' 
                ? format(fechaSeleccionada, "EEEE, d 'de' MMMM", { locale: es })
                : `${format(semanaActual[0], 'd MMM')} - ${format(semanaActual[6], 'd MMM', { locale: es })}`
              }
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => vista === 'dia' ? navegarDia('siguiente') : navegarSemana('siguiente')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {vista === 'dia' ? (
            // Vista de Día
            <div className="space-y-2">
              {citasDelDia.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay citas programadas para este día</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={onNuevaCita}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agendar cita
                  </Button>
                </div>
              ) : (
                citasDelDia.map((cita) => (
                  <div
                    key={cita.id}
                    onClick={() => onVerCita(cita)}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex-shrink-0 w-16 text-center">
                      <p className="font-bold text-lg">{cita.hora}</p>
                      <p className="text-xs text-gray-500">{cita.duracion} min</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <PawPrint className="w-4 h-4 text-teal-600" />
                        <span className="font-medium truncate">
                          {getMascotaNombre(cita.mascotaId)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="truncate">
                          {getDuenoNombre(cita.duenoId)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {cita.motivo}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {getEstadoBadge(cita.estado)}
                      <p className="text-xs text-gray-500 mt-1">
                        {getMedicoNombre(cita.medicoId)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Vista de Semana
            <div className="grid grid-cols-7 gap-2">
              {semanaActual.map((dia, index) => {
                const fechaStr = format(dia, 'yyyy-MM-dd');
                const citasDia = citas.filter(c => c.fecha === fechaStr);
                const esHoy = isSameDay(dia, new Date());
                const esSeleccionado = isSameDay(dia, fechaSeleccionada);
                
                return (
                  <div 
                    key={index}
                    onClick={() => {
                      setFechaSeleccionada(dia);
                      setVista('dia');
                    }}
                    className={`min-h-[120px] p-2 rounded-lg border cursor-pointer transition-colors ${
                      esSeleccionado 
                        ? 'border-teal-500 bg-teal-50' 
                        : esHoy 
                          ? 'border-blue-300 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <p className={`text-center text-sm font-medium mb-2 ${
                      esHoy ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {format(dia, 'EEE', { locale: es })}
                    </p>
                    <p className={`text-center text-lg font-bold mb-2 ${
                      esHoy ? 'text-blue-600' : 'text-gray-800'
                    }`}>
                      {format(dia, 'd')}
                    </p>
                    <div className="space-y-1">
                      {citasDia.slice(0, 3).map((cita, idx) => (
                        <div 
                          key={idx}
                          className="text-xs p-1 rounded bg-teal-100 text-teal-800 truncate"
                        >
                          {cita.hora} - {getMascotaNombre(cita.mascotaId)}
                        </div>
                      ))}
                      {citasDia.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{citasDia.length - 3} más
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
