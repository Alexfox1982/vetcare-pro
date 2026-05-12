import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  User as UserIcon,
  Calendar,
  Sun,
  Sunset,
  Moon,
  CalendarDays
} from 'lucide-react';
import { format, addDays, startOfWeek, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Turno, User as UserType, TipoTurno } from '@/types';

interface TurnosManagerProps {
  turnos: Turno[];
  users: UserType[];
  onAdd: (turno: Omit<Turno, 'id'>) => void;
  onUpdate: (id: string, turno: Partial<Turno>) => void;
  onDelete: (id: string) => void;
}

const tiposTurno: { value: TipoTurno; label: string; icon: React.ElementType; color: string; horario: string }[] = [
  { value: 'mañana', label: 'Mañana', icon: Sun, color: 'bg-yellow-100 text-yellow-800 border-yellow-300', horario: '08:00 - 14:00' },
  { value: 'tarde', label: 'Tarde', icon: Sunset, color: 'bg-orange-100 text-orange-800 border-orange-300', horario: '14:00 - 20:00' },
  { value: 'noche', label: 'Noche', icon: Moon, color: 'bg-indigo-100 text-indigo-800 border-indigo-300', horario: '20:00 - 08:00' },
  { value: 'completo', label: 'Jornada Completa', icon: CalendarDays, color: 'bg-green-100 text-green-800 border-green-300', horario: '08:00 - 20:00' },
];

export function TurnosManager({ 
  turnos, 
  users, 
  onAdd, 
  onUpdate, 
  onDelete 
}: TurnosManagerProps) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [vistaSemana, setVistaSemana] = useState(false);
  const [filtroUsuario, setFiltroUsuario] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTurno, setEditingTurno] = useState<Turno | null>(null);

  const [formData, setFormData] = useState({
    usuarioId: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    tipo: 'mañana' as TipoTurno,
    horaInicio: '08:00',
    horaFin: '14:00',
    notas: '',
  });

  const semanaActual = useMemo(() => {
    const inicio = startOfWeek(parseISO(fechaSeleccionada), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(inicio, i));
  }, [fechaSeleccionada]);

  const filteredTurnos = useMemo(() => {
    return turnos.filter(turno => {
      const matchesUsuario = filtroUsuario === 'todos' || turno.usuarioId === filtroUsuario;
      
      if (vistaSemana) {
        const turnoFecha = parseISO(turno.fecha);
        return matchesUsuario && semanaActual.some(d => isSameDay(d, turnoFecha));
      } else {
        return matchesUsuario && turno.fecha === fechaSeleccionada;
      }
    }).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }, [turnos, filtroUsuario, fechaSeleccionada, vistaSemana, semanaActual]);

  const resetForm = () => {
    setFormData({
      usuarioId: '',
      fecha: format(new Date(), 'yyyy-MM-dd'),
      tipo: 'mañana',
      horaInicio: '08:00',
      horaFin: '14:00',
      notas: '',
    });
    setEditingTurno(null);
  };

  const openModal = (turno?: Turno) => {
    if (turno) {
      setEditingTurno(turno);
      setFormData({
        usuarioId: turno.usuarioId,
        fecha: turno.fecha,
        tipo: turno.tipo,
        horaInicio: turno.horaInicio,
        horaFin: turno.horaFin,
        notas: turno.notas || '',
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTurno) {
      onUpdate(editingTurno.id, formData);
    } else {
      onAdd(formData);
    }
    closeModal();
  };

  const handleDelete = (turno: Turno) => {
    if (confirm('¿Está seguro de eliminar este turno?')) {
      onDelete(turno.id);
    }
  };

  const getUsuarioNombre = (id: string) => {
    return users.find(u => u.id === id)?.nombre || 'Desconocido';
  };

  const getTipoTurnoInfo = (tipo: TipoTurno) => {
    return tiposTurno.find(t => t.value === tipo);
  };

  const handleTipoChange = (tipo: TipoTurno) => {
    const info = getTipoTurnoInfo(tipo);
    if (info) {
      const [inicio, fin] = info.horario.split(' - ');
      setFormData(prev => ({
        ...prev,
        tipo,
        horaInicio: inicio,
        horaFin: fin,
      }));
    }
  };

  const getTurnosByDia = (fecha: Date) => {
    const fechaStr = format(fecha, 'yyyy-MM-dd');
    return turnos.filter(t => t.fecha === fechaStr);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Turnos del Personal</h1>
          <p className="text-gray-600">Gestione los horarios de trabajo</p>
        </div>
        <Button onClick={() => openModal()} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Asignar Turno
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <Button
                variant={!vistaSemana ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVistaSemana(false)}
                className={!vistaSemana ? 'bg-teal-600' : ''}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Día
              </Button>
              <Button
                variant={vistaSemana ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVistaSemana(true)}
                className={vistaSemana ? 'bg-teal-600' : ''}
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Semana
              </Button>
            </div>
            
            {!vistaSemana && (
              <Input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="w-[180px]"
              />
            )}
            
            <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
              <SelectTrigger className="w-[200px]">
                <UserIcon className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Todos los empleados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los empleados</SelectItem>
                {users.filter(u => u.activo).map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vista de Turnos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {vistaSemana 
              ? `Semana del ${format(semanaActual[0], 'd')} al ${format(semanaActual[6], 'd MMM', { locale: es })}`
              : format(parseISO(fechaSeleccionada), "EEEE, d 'de' MMMM", { locale: es })
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vistaSemana ? (
            // Vista de Semana
            <div className="grid grid-cols-7 gap-2">
              {semanaActual.map((dia, index) => {
                const turnosDia = getTurnosByDia(dia);
                const esHoy = isSameDay(dia, new Date());
                
                return (
                  <div 
                    key={index}
                    className={`min-h-[150px] p-2 rounded-lg border ${
                      esHoy ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                    }`}
                  >
                    <p className={`text-center text-sm font-medium mb-2 ${
                      esHoy ? 'text-teal-700' : 'text-gray-600'
                    }`}>
                      {format(dia, 'EEE', { locale: es })}
                    </p>
                    <p className={`text-center text-lg font-bold mb-2 ${
                      esHoy ? 'text-teal-700' : 'text-gray-800'
                    }`}>
                      {format(dia, 'd')}
                    </p>
                    <div className="space-y-1">
                      {turnosDia.map((turno, idx) => {
                        const tipoInfo = getTipoTurnoInfo(turno.tipo);
                        return (
                          <div 
                            key={idx}
                            onClick={() => openModal(turno)}
                            className="text-xs p-1 rounded cursor-pointer hover:opacity-80 truncate"
                            style={{ backgroundColor: tipoInfo?.color.split(' ')[0].replace('bg-', '').replace('100', '200') }}
                          >
                            {getUsuarioNombre(turno.usuarioId).split(' ')[0]}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Vista de Día
            <div className="space-y-3">
              {filteredTurnos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay turnos asignados para este día</p>
                </div>
              ) : (
                filteredTurnos.map((turno) => {
                  const tipoInfo = getTipoTurnoInfo(turno.tipo);
                  const Icon = tipoInfo?.icon || Sun;
                  
                  return (
                    <div
                      key={turno.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tipoInfo?.color.split(' ')[0]}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium">{getUsuarioNombre(turno.usuarioId)}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{turno.horaInicio} - {turno.horaFin}</span>
                        </div>
                        {turno.notas && (
                          <p className="text-sm text-gray-500 mt-1">{turno.notas}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={tipoInfo?.color}>
                          {tipoInfo?.label}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openModal(turno)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(turno)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Turno */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTurno ? 'Editar Turno' : 'Asignar Turno'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Empleado *</Label>
              <Select 
                value={formData.usuarioId} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, usuarioId: v }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un empleado" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.activo).map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de turno *</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(v) => handleTipoChange(v as TipoTurno)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposTurno.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <t.icon className="w-4 h-4" />
                        {t.label} ({t.horario})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horaInicio">Hora de inicio *</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, horaInicio: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaFin">Hora de fin *</Label>
                <Input
                  id="horaFin"
                  type="time"
                  value={formData.horaFin}
                  onChange={(e) => setFormData(prev => ({ ...prev, horaFin: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm"
                placeholder="Información adicional sobre el turno..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                {editingTurno ? 'Guardar Cambios' : 'Asignar Turno'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
