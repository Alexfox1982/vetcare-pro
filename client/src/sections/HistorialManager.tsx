import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { 
  ClipboardList, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  PawPrint,
  Calendar,
  Stethoscope,
  DollarSign,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { HistorialClinico, Mascota, Dueno, User } from '@/types';

interface HistorialManagerProps {
  historial: HistorialClinico[];
  mascotas: Mascota[];
  duenos: Dueno[];
  medicos: User[];
  onAdd: (registro: Omit<HistorialClinico, 'id'>) => void;
  onUpdate: (id: string, registro: Partial<HistorialClinico>) => void;
  onDelete: (id: string) => void;
  selectedMascotaId?: string;
  onBack?: () => void;
}

export function HistorialManager({ 
  historial, 
  mascotas, 
  duenos, 
  medicos,
  onAdd, 
  onUpdate, 
  onDelete,
  selectedMascotaId,
  onBack
}: HistorialManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroMascota, setFiltroMascota] = useState<string>(selectedMascotaId || 'todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<HistorialClinico | null>(null);
  const [viewingRegistro, setViewingRegistro] = useState<HistorialClinico | null>(null);

  const [formData, setFormData] = useState({
    mascotaId: selectedMascotaId || '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    medicoId: '',
    motivoConsulta: '',
    sintomas: '',
    diagnostico: '',
    tratamiento: '',
    medicamentos: '',
    observaciones: '',
    proximaCita: '',
    costo: '',
  });

  const filteredHistorial = useMemo(() => {
    return historial.filter(registro => {
      const mascota = mascotas.find(m => m.id === registro.mascotaId);
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = 
        (mascota?.nombre.toLowerCase().includes(searchLower) || false) ||
        registro.motivoConsulta.toLowerCase().includes(searchLower) ||
        registro.diagnostico.toLowerCase().includes(searchLower) ||
        registro.tratamiento.toLowerCase().includes(searchLower);
      
      const matchesMascota = filtroMascota === 'todos' || registro.mascotaId === filtroMascota;
      
      return matchesSearch && matchesMascota;
    }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [historial, mascotas, searchTerm, filtroMascota]);

  const resetForm = () => {
    setFormData({
      mascotaId: selectedMascotaId || '',
      fecha: format(new Date(), 'yyyy-MM-dd'),
      medicoId: '',
      motivoConsulta: '',
      sintomas: '',
      diagnostico: '',
      tratamiento: '',
      medicamentos: '',
      observaciones: '',
      proximaCita: '',
      costo: '',
    });
    setEditingRegistro(null);
  };

  const openModal = (registro?: HistorialClinico) => {
    if (registro) {
      setEditingRegistro(registro);
      setFormData({
        mascotaId: registro.mascotaId,
        fecha: registro.fecha,
        medicoId: registro.medicoId,
        motivoConsulta: registro.motivoConsulta,
        sintomas: registro.sintomas,
        diagnostico: registro.diagnostico,
        tratamiento: registro.tratamiento,
        medicamentos: registro.medicamentos || '',
        observaciones: registro.observaciones || '',
        proximaCita: registro.proximaCita || '',
        costo: registro.costo?.toString() || '',
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
    
    const data = {
      ...formData,
      costo: formData.costo ? parseFloat(formData.costo) : undefined,
    };
    
    if (editingRegistro) {
      onUpdate(editingRegistro.id, data);
    } else {
      onAdd(data as Omit<HistorialClinico, 'id'>);
    }
    closeModal();
  };

  const handleDelete = (registro: HistorialClinico) => {
    if (confirm('¿Está seguro de eliminar este registro del historial clínico?')) {
      onDelete(registro.id);
    }
  };

  const getMascotaNombre = (id: string) => {
    return mascotas.find(m => m.id === id)?.nombre || 'Desconocido';
  };

  const getDuenoNombre = (mascotaId: string) => {
    const mascota = mascotas.find(m => m.id === mascotaId);
    if (!mascota) return 'Desconocido';
    const dueno = duenos.find(d => d.id === mascota.duenoId);
    return dueno ? `${dueno.nombre} ${dueno.apellido}` : 'Desconocido';
  };

  const getMedicoNombre = (id: string) => {
    return medicos.find(m => m.id === id)?.nombre || 'Desconocido';
  };

  const selectedMascota = selectedMascotaId ? mascotas.find(m => m.id === selectedMascotaId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Historial Clínico</h1>
            <p className="text-gray-600">
              {selectedMascota 
                ? `Registros de ${selectedMascota.nombre}` 
                : 'Consulte y gestione los historiales médicos'}
            </p>
          </div>
        </div>
        <Button onClick={() => openModal()} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Registro
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por mascota, diagnóstico o tratamiento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {!selectedMascotaId && (
              <Select value={filtroMascota} onValueChange={setFiltroMascota}>
                <SelectTrigger className="w-[200px]">
                  <PawPrint className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Todas las mascotas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las mascotas</SelectItem>
                  {mascotas.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Historial */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registros ({filteredHistorial.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredHistorial.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron registros</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistorial.map((registro) => (
                <div
                  key={registro.id}
                  className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <PawPrint className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{getMascotaNombre(registro.mascotaId)}</h3>
                          <p className="text-sm text-gray-500">{getDuenoNombre(registro.mascotaId)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(parseISO(registro.fecha), 'dd/MM/yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-4 h-4" />
                          {getMedicoNombre(registro.medicoId)}
                        </span>
                        {registro.costo && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${registro.costo.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Motivo: </span>
                          <span className="text-sm text-gray-600">{registro.motivoConsulta}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Diagnóstico: </span>
                          <span className="text-sm text-gray-600">{registro.diagnostico}</span>
                        </div>
                        {registro.medicamentos && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Medicamentos: </span>
                            <span className="text-sm text-gray-600">{registro.medicamentos}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingRegistro(registro)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openModal(registro)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(registro)}
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

      {/* Modal de Registro */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRegistro ? 'Editar Registro' : 'Nuevo Registro Médico'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mascota">Mascota *</Label>
                <Select 
                  value={formData.mascotaId} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, mascotaId: v }))}
                  disabled={!!selectedMascotaId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una mascota" />
                  </SelectTrigger>
                  <SelectContent>
                    {mascotas.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nombre}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="medico">Médico *</Label>
              <Select 
                value={formData.medicoId} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, medicoId: v }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un médico" />
                </SelectTrigger>
                <SelectContent>
                  {medicos.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de la consulta *</Label>
              <Input
                id="motivo"
                value={formData.motivoConsulta}
                onChange={(e) => setFormData(prev => ({ ...prev, motivoConsulta: e.target.value }))}
                placeholder="Ej: Vacunación, revisión general..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sintomas">Síntomas observados</Label>
              <textarea
                id="sintomas"
                value={formData.sintomas}
                onChange={(e) => setFormData(prev => ({ ...prev, sintomas: e.target.value }))}
                className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm"
                placeholder="Describa los síntomas observados..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnostico">Diagnóstico *</Label>
              <textarea
                id="diagnostico"
                value={formData.diagnostico}
                onChange={(e) => setFormData(prev => ({ ...prev, diagnostico: e.target.value }))}
                className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm"
                placeholder="Indique el diagnóstico..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tratamiento">Tratamiento *</Label>
              <textarea
                id="tratamiento"
                value={formData.tratamiento}
                onChange={(e) => setFormData(prev => ({ ...prev, tratamiento: e.target.value }))}
                className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm"
                placeholder="Describa el tratamiento indicado..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicamentos">Medicamentos recetados</Label>
              <Input
                id="medicamentos"
                value={formData.medicamentos}
                onChange={(e) => setFormData(prev => ({ ...prev, medicamentos: e.target.value }))}
                placeholder="Ej: Antibiótico 500mg cada 8 horas por 7 días"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proximaCita">Próxima cita</Label>
                <Input
                  id="proximaCita"
                  type="date"
                  value={formData.proximaCita}
                  onChange={(e) => setFormData(prev => ({ ...prev, proximaCita: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costo">Costo de la consulta</Label>
                <Input
                  id="costo"
                  type="number"
                  step="0.01"
                  value={formData.costo}
                  onChange={(e) => setFormData(prev => ({ ...prev, costo: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones adicionales</Label>
              <textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm"
                placeholder="Cualquier información adicional relevante..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                {editingRegistro ? 'Guardar Cambios' : 'Crear Registro'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Ver Detalles */}
      <Dialog open={!!viewingRegistro} onOpenChange={() => setViewingRegistro(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Registro Médico</DialogTitle>
          </DialogHeader>
          
          {viewingRegistro && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <PawPrint className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{getMascotaNombre(viewingRegistro.mascotaId)}</h3>
                  <p className="text-gray-500">{getDuenoNombre(viewingRegistro.mascotaId)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">{format(parseISO(viewingRegistro.fecha), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Médico</p>
                  <p className="font-medium">{getMedicoNombre(viewingRegistro.medicoId)}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Motivo de la consulta</p>
                <p className="font-medium">{viewingRegistro.motivoConsulta}</p>
              </div>

              {viewingRegistro.sintomas && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Síntomas</p>
                  <p>{viewingRegistro.sintomas}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Diagnóstico</p>
                <p>{viewingRegistro.diagnostico}</p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Tratamiento</p>
                <p>{viewingRegistro.tratamiento}</p>
              </div>

              {viewingRegistro.medicamentos && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Medicamentos</p>
                  <p>{viewingRegistro.medicamentos}</p>
                </div>
              )}

              {viewingRegistro.observaciones && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Observaciones</p>
                  <p>{viewingRegistro.observaciones}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {viewingRegistro.proximaCita && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Próxima cita</p>
                    <p className="font-medium">{format(parseISO(viewingRegistro.proximaCita), 'dd/MM/yyyy')}</p>
                  </div>
                )}
                {viewingRegistro.costo && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Costo</p>
                    <p className="font-medium text-teal-600">${viewingRegistro.costo.toFixed(2)}</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button onClick={() => setViewingRegistro(null)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
