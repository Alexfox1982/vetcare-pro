import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  PawPrint,
  Users,
  Filter
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Cita, Mascota, Dueno, User, EstadoCita } from '@/types';

interface CitasManagerProps {
  citas: Cita[];
  mascotas: Mascota[];
  duenos: Dueno[];
  medicos: User[];
  onAdd: (cita: Omit<Cita, 'id' | 'fechaCreacion'>) => void;
  onUpdate: (id: string, cita: Partial<Cita>) => void;
  onDelete: (id: string) => void;
}

export function CitasManager({ 
  citas, 
  mascotas, 
  duenos, 
  medicos,
  onAdd, 
  onUpdate, 
  onDelete 
}: CitasManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoCita | 'todos'>('todos');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  const [_selectedMascota, setSelectedMascota] = useState('');

  const [formData, setFormData] = useState({
    mascotaId: '',
    duenoId: '',
    fecha: '',
    hora: '',
    duracion: 30,
    motivo: '',
    medicoId: '',
    estado: 'pendiente' as EstadoCita,
    notas: '',
  });

  const filteredCitas = useMemo(() => {
    return citas.filter(cita => {
      const mascota = mascotas.find(m => m.id === cita.mascotaId);
      const dueno = duenos.find(d => d.id === cita.duenoId);
      
      const matchesSearch = 
        (mascota?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (dueno?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (dueno?.apellido.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        cita.motivo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEstado = filtroEstado === 'todos' || cita.estado === filtroEstado;
      const matchesFecha = !filtroFecha || cita.fecha === filtroFecha;
      
      return matchesSearch && matchesEstado && matchesFecha;
    }).sort((a, b) => {
      // Ordenar por fecha y hora
      const fechaCompare = b.fecha.localeCompare(a.fecha);
      if (fechaCompare !== 0) return fechaCompare;
      return a.hora.localeCompare(b.hora);
    });
  }, [citas, mascotas, duenos, searchTerm, filtroEstado, filtroFecha]);

  const resetForm = () => {
    setFormData({
      mascotaId: '',
      duenoId: '',
      fecha: '',
      hora: '',
      duracion: 30,
      motivo: '',
      medicoId: '',
      estado: 'pendiente',
      notas: '',
    });
    setSelectedMascota('');
    setEditingCita(null);
  };

  const openModal = (cita?: Cita) => {
    if (cita) {
      setEditingCita(cita);
      setFormData({
        mascotaId: cita.mascotaId,
        duenoId: cita.duenoId,
        fecha: cita.fecha,
        hora: cita.hora,
        duracion: cita.duracion,
        motivo: cita.motivo,
        medicoId: cita.medicoId || '',
        estado: cita.estado,
        notas: cita.notas || '',
      });
      setSelectedMascota(cita.mascotaId);
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
    
    if (editingCita) {
      onUpdate(editingCita.id, formData);
    } else {
      onAdd(formData);
    }
    closeModal();
  };

  const handleMascotaChange = (mascotaId: string) => {
    const mascota = mascotas.find(m => m.id === mascotaId);
    setSelectedMascota(mascotaId);
    setFormData(prev => ({
      ...prev,
      mascotaId,
      duenoId: mascota?.duenoId || '',
    }));
  };

  const handleDelete = (cita: Cita) => {
    if (confirm(`¿Está seguro de eliminar la cita de ${getMascotaNombre(cita.mascotaId)}?`)) {
      onDelete(cita.id);
    }
  };

  const getMascotaNombre = (id: string) => {
    return mascotas.find(m => m.id === id)?.nombre || 'Desconocido';
  };

  const getDuenoNombre = (id: string) => {
    const d = duenos.find(d => d.id === id);
    return d ? `${d.nombre} ${d.apellido}` : 'Desconocido';
  };

  const getMedicoNombre = (id?: string) => {
    if (!id) return 'Sin asignar';
    return medicos.find(m => m.id === id)?.nombre || 'Desconocido';
  };

  const getEstadoBadge = (estado: EstadoCita) => {
    const styles: Record<EstadoCita, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmada: 'bg-green-100 text-green-800 border-green-300',
      en_curso: 'bg-blue-100 text-blue-800 border-blue-300',
      completada: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelada: 'bg-red-100 text-red-800 border-red-300',
    };
    const labels: Record<EstadoCita, string> = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      en_curso: 'En curso',
      completada: 'Completada',
      cancelada: 'Cancelada',
    };
    return (
      <Badge variant="outline" className={styles[estado]}>
        {labels[estado]}
      </Badge>
    );
  };

  const getMascotasByDueno = (duenoId: string) => {
    return mascotas.filter(m => m.duenoId === duenoId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Citas</h1>
          <p className="text-gray-600">Administre las citas programadas</p>
        </div>
        <Button onClick={() => openModal()} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por mascota, dueño o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as EstadoCita | 'todos')}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="en_curso">En curso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="w-[150px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Citas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Citas ({filteredCitas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCitas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron citas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCitas.map((cita) => (
                <div
                  key={cita.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-20">
                    <p className="font-bold">{cita.hora}</p>
                    <p className="text-xs text-gray-500">{cita.duracion} min</p>
                    <p className="text-xs text-gray-400">
                      {format(parseISO(cita.fecha), 'dd/MM/yy')}
                    </p>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <PawPrint className="w-4 h-4 text-teal-600" />
                      <span className="font-medium">{getMascotaNombre(cita.mascotaId)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{getDuenoNombre(cita.duenoId)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{cita.motivo}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {getEstadoBadge(cita.estado)}
                      <p className="text-xs text-gray-500 mt-1">
                        {getMedicoNombre(cita.medicoId)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openModal(cita)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(cita)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Cita */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCita ? 'Editar Cita' : 'Nueva Cita'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mascota">Mascota *</Label>
              <Select 
                value={formData.mascotaId} 
                onValueChange={handleMascotaChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una mascota" />
                </SelectTrigger>
                <SelectContent>
                  {duenos.map(dueno => (
                    <div key={dueno.id}>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                        {dueno.nombre} {dueno.apellido}
                      </div>
                      {getMascotasByDueno(dueno.id).map(mascota => (
                        <SelectItem key={mascota.id} value={mascota.id}>
                          <span className="flex items-center gap-2">
                            <PawPrint className="w-3 h-3" />
                            {mascota.nombre} ({mascota.especie})
                          </span>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="hora">Hora *</Label>
                <Input
                  id="hora"
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duracion">Duración (min)</Label>
                <Select 
                  value={formData.duracion.toString()} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, duracion: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1.5 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select 
                  value={formData.estado} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, estado: v as EstadoCita }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="confirmada">Confirmada</SelectItem>
                    <SelectItem value="en_curso">En curso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medico">Médico</Label>
              <Select 
                value={formData.medicoId} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, medicoId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un médico" />
                </SelectTrigger>
                <SelectContent>
                  {medicos.map(medico => (
                    <SelectItem key={medico.id} value={medico.id}>
                      {medico.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de la consulta *</Label>
              <Input
                id="motivo"
                value={formData.motivo}
                onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                placeholder="Ej: Vacunación, revisión, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas adicionales</Label>
              <textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm"
                placeholder="Información adicional relevante..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                {editingCita ? 'Guardar Cambios' : 'Crear Cita'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
