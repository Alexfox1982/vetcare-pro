import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  PawPrint, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Users,
  Calendar,
  Weight,
  FileText,
  Eye
} from 'lucide-react';
import type { Mascota, Dueno, Especie, Sexo } from '@/types';

interface MascotasManagerProps {
  mascotas: Mascota[];
  duenos: Dueno[];
  onAdd: (mascota: Omit<Mascota, 'id' | 'fechaRegistro'>) => void;
  onUpdate: (id: string, mascota: Partial<Mascota>) => void;
  onDelete: (id: string) => void;
  onViewHistorial: (mascotaId: string) => void;
}

const especies: { value: Especie; label: string; icon: string }[] = [
  { value: 'perro', label: 'Perro', icon: '🐕' },
  { value: 'gato', label: 'Gato', icon: '🐈' },
  { value: 'ave', label: 'Ave', icon: '🐦' },
  { value: 'conejo', label: 'Conejo', icon: '🐰' },
  { value: 'hamster', label: 'Hámster', icon: '🐹' },
  { value: 'otro', label: 'Otro', icon: '🐾' },
];

export function MascotasManager({ 
  mascotas, 
  duenos, 
  onAdd, 
  onUpdate, 
  onDelete,
  onViewHistorial
}: MascotasManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState<Especie | 'todos'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMascota, setEditingMascota] = useState<Mascota | null>(null);
  const [viewingMascota, setViewingMascota] = useState<Mascota | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    especie: 'perro' as Especie,
    raza: '',
    fechaNacimiento: '',
    sexo: '' as Sexo | '',
    color: '',
    peso: '',
    duenoId: '',
    microchip: '',
    alergias: '',
    notas: '',
  });

  const filteredMascotas = useMemo(() => {
    return mascotas.filter(mascota => {
      const dueno = duenos.find(d => d.id === mascota.duenoId);
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = 
        mascota.nombre.toLowerCase().includes(searchLower) ||
        (mascota.raza?.toLowerCase().includes(searchLower) || false) ||
        (dueno?.nombre.toLowerCase().includes(searchLower) || false) ||
        (dueno?.apellido.toLowerCase().includes(searchLower) || false);
      
      const matchesEspecie = filtroEspecie === 'todos' || mascota.especie === filtroEspecie;
      
      return matchesSearch && matchesEspecie;
    }).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [mascotas, duenos, searchTerm, filtroEspecie]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      especie: 'perro',
      raza: '',
      fechaNacimiento: '',
      sexo: '',
      color: '',
      peso: '',
      duenoId: '',
      microchip: '',
      alergias: '',
      notas: '',
    });
    setEditingMascota(null);
  };

  const openModal = (mascota?: Mascota) => {
    if (mascota) {
      setEditingMascota(mascota);
      setFormData({
        nombre: mascota.nombre,
        especie: mascota.especie,
        raza: mascota.raza || '',
        fechaNacimiento: mascota.fechaNacimiento || '',
        sexo: mascota.sexo || '',
        color: mascota.color || '',
        peso: mascota.peso?.toString() || '',
        duenoId: mascota.duenoId,
        microchip: mascota.microchip || '',
        alergias: mascota.alergias || '',
        notas: mascota.notas || '',
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
    
    const data: Omit<Mascota, 'id' | 'fechaRegistro'> = {
      nombre: formData.nombre,
      especie: formData.especie,
      raza: formData.raza || undefined,
      fechaNacimiento: formData.fechaNacimiento || undefined,
      sexo: formData.sexo || undefined,
      color: formData.color || undefined,
      peso: formData.peso ? parseFloat(formData.peso) : undefined,
      duenoId: formData.duenoId,
      microchip: formData.microchip || undefined,
      alergias: formData.alergias || undefined,
      notas: formData.notas || undefined,
    };
    
    if (editingMascota) {
      onUpdate(editingMascota.id, data);
    } else {
      onAdd(data);
    }
    closeModal();
  };

  const handleDelete = (mascota: Mascota) => {
    if (confirm(`¿Está seguro de eliminar a ${mascota.nombre}?`)) {
      onDelete(mascota.id);
    }
  };

  const getDuenoNombre = (id: string) => {
    const d = duenos.find(d => d.id === id);
    return d ? `${d.nombre} ${d.apellido}` : 'Desconocido';
  };

  const getEspecieIcon = (especie: Especie) => {
    return especies.find(e => e.value === especie)?.icon || '🐾';
  };

  const getEspecieLabel = (especie: Especie) => {
    return especies.find(e => e.value === especie)?.label || especie;
  };

  const calcularEdad = (fechaNacimiento?: string) => {
    if (!fechaNacimiento) return 'Desconocida';
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    const años = hoy.getFullYear() - nacimiento.getFullYear();
    const meses = hoy.getMonth() - nacimiento.getMonth();
    
    if (años > 0) {
      return `${años} año${años > 1 ? 's' : ''}`;
    } else if (meses > 0) {
      return `${meses} mes${meses > 1 ? 'es' : ''}`;
    } else {
      return '< 1 mes';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pacientes (Mascotas)</h1>
          <p className="text-gray-600">Gestione la información de las mascotas</p>
        </div>
        <Button onClick={() => openModal()} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Mascota
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, raza o dueño..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroEspecie} onValueChange={(v) => setFiltroEspecie(v as Especie | 'todos')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas las especies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las especies</SelectItem>
                {especies.map(esp => (
                  <SelectItem key={esp.value} value={esp.value}>
                    <span className="flex items-center gap-2">
                      <span>{esp.icon}</span>
                      {esp.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Mascotas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mascotas ({filteredMascotas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMascotas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron mascotas</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMascotas.map((mascota) => (
                <div
                  key={mascota.id}
                  className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-2xl">
                        {getEspecieIcon(mascota.especie)}
                      </div>
                      <div>
                        <h3 className="font-medium">{mascota.nombre}</h3>
                        <p className="text-sm text-gray-500">
                          {getEspecieLabel(mascota.especie)}
                          {mascota.raza && ` - ${mascota.raza}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="truncate">{getDuenoNombre(mascota.duenoId)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{calcularEdad(mascota.fechaNacimiento)}</span>
                    </div>
                    {mascota.peso && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Weight className="w-4 h-4" />
                        <span>{mascota.peso} kg</span>
                      </div>
                    )}
                    {mascota.alergias && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Alergias: {mascota.alergias}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setViewingMascota(mascota)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onViewHistorial(mascota.id)}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Historial
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openModal(mascota)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(mascota)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Mascota */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMascota ? 'Editar Mascota' : 'Nueva Mascota'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="especie">Especie *</Label>
                <Select 
                  value={formData.especie} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, especie: v as Especie }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {especies.map(esp => (
                      <SelectItem key={esp.value} value={esp.value}>
                        <span className="flex items-center gap-2">
                          <span>{esp.icon}</span>
                          {esp.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="raza">Raza</Label>
                <Input
                  id="raza"
                  value={formData.raza}
                  onChange={(e) => setFormData(prev => ({ ...prev, raza: e.target.value }))}
                  placeholder="Ej: Labrador"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo</Label>
                <Select 
                  value={formData.sexo} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, sexo: v as Sexo }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="macho">Macho</SelectItem>
                    <SelectItem value="hembra">Hembra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="Ej: Dorado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  value={formData.peso}
                  onChange={(e) => setFormData(prev => ({ ...prev, peso: e.target.value }))}
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueno">Dueño *</Label>
              <Select 
                value={formData.duenoId} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, duenoId: v }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un dueño" />
                </SelectTrigger>
                <SelectContent>
                  {duenos.map(dueno => (
                    <SelectItem key={dueno.id} value={dueno.id}>
                      {dueno.nombre} {dueno.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="microchip">Número de microchip</Label>
              <Input
                id="microchip"
                value={formData.microchip}
                onChange={(e) => setFormData(prev => ({ ...prev, microchip: e.target.value }))}
                placeholder="Ej: 123456789012345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alergias">Alergias</Label>
              <Input
                id="alergias"
                value={formData.alergias}
                onChange={(e) => setFormData(prev => ({ ...prev, alergias: e.target.value }))}
                placeholder="Ej: Polen, ciertos alimentos..."
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
                {editingMascota ? 'Guardar Cambios' : 'Crear Mascota'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Ver Detalles */}
      <Dialog open={!!viewingMascota} onOpenChange={() => setViewingMascota(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la Mascota</DialogTitle>
          </DialogHeader>
          
          {viewingMascota && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center text-4xl">
                  {getEspecieIcon(viewingMascota.especie)}
                </div>
                <div>
                  <h3 className="text-2xl font-medium">{viewingMascota.nombre}</h3>
                  <p className="text-gray-500">
                    {getEspecieLabel(viewingMascota.especie)}
                    {viewingMascota.raza && ` - ${viewingMascota.raza}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Dueño</p>
                  <p className="font-medium">{getDuenoNombre(viewingMascota.duenoId)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Edad</p>
                  <p className="font-medium">{calcularEdad(viewingMascota.fechaNacimiento)}</p>
                </div>
                {viewingMascota.sexo && (
                  <div>
                    <p className="text-sm text-gray-500">Sexo</p>
                    <p className="font-medium capitalize">{viewingMascota.sexo}</p>
                  </div>
                )}
                {viewingMascota.peso && (
                  <div>
                    <p className="text-sm text-gray-500">Peso</p>
                    <p className="font-medium">{viewingMascota.peso} kg</p>
                  </div>
                )}
                {viewingMascota.color && (
                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-medium">{viewingMascota.color}</p>
                  </div>
                )}
                {viewingMascota.microchip && (
                  <div>
                    <p className="text-sm text-gray-500">Microchip</p>
                    <p className="font-medium">{viewingMascota.microchip}</p>
                  </div>
                )}
              </div>

              {viewingMascota.alergias && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Alergias</p>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {viewingMascota.alergias}
                  </Badge>
                </div>
              )}

              {viewingMascota.notas && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Notas</p>
                  <p className="text-sm">{viewingMascota.notas}</p>
                </div>
              )}

              <DialogFooter>
                <Button onClick={() => setViewingMascota(null)}>
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
