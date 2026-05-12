import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin,
  PawPrint,
  Eye
} from 'lucide-react';
import type { Dueno, Mascota } from '@/types';

interface DuenosManagerProps {
  duenos: Dueno[];
  mascotas: Mascota[];
  onAdd: (dueno: Omit<Dueno, 'id' | 'fechaRegistro'>) => void;
  onUpdate: (id: string, dueno: Partial<Dueno>) => void;
  onDelete: (id: string) => void;
  onViewMascotas: (duenoId: string) => void;
}

export function DuenosManager({ 
  duenos, 
  mascotas, 
  onAdd, 
  onUpdate, 
  onDelete,
  onViewMascotas
}: DuenosManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDueno, setEditingDueno] = useState<Dueno | null>(null);
  const [viewingDueno, setViewingDueno] = useState<Dueno | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    notas: '',
  });

  const filteredDuenos = useMemo(() => {
    return duenos.filter(dueno => {
      const searchLower = searchTerm.toLowerCase();
      return (
        dueno.nombre.toLowerCase().includes(searchLower) ||
        dueno.apellido.toLowerCase().includes(searchLower) ||
        dueno.email.toLowerCase().includes(searchLower) ||
        dueno.telefono.includes(searchTerm)
      );
    }).sort((a, b) => a.apellido.localeCompare(b.apellido));
  }, [duenos, searchTerm]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      notas: '',
    });
    setEditingDueno(null);
  };

  const openModal = (dueno?: Dueno) => {
    if (dueno) {
      setEditingDueno(dueno);
      setFormData({
        nombre: dueno.nombre,
        apellido: dueno.apellido,
        email: dueno.email,
        telefono: dueno.telefono,
        direccion: dueno.direccion || '',
        notas: dueno.notas || '',
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
    
    if (editingDueno) {
      onUpdate(editingDueno.id, formData);
    } else {
      onAdd(formData);
    }
    closeModal();
  };

  const handleDelete = (dueno: Dueno) => {
    const mascotasCount = mascotas.filter(m => m.duenoId === dueno.id).length;
    const mensaje = mascotasCount > 0 
      ? `¿Está seguro de eliminar a ${dueno.nombre} ${dueno.apellido}? Esto también eliminará ${mascotasCount} mascota(s) asociada(s).`
      : `¿Está seguro de eliminar a ${dueno.nombre} ${dueno.apellido}?`;
    
    if (confirm(mensaje)) {
      onDelete(dueno.id);
    }
  };

  const getMascotasCount = (duenoId: string) => {
    return mascotas.filter(m => m.duenoId === duenoId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dueños de Mascotas</h1>
          <p className="text-gray-600">Gestione la información de los dueños</p>
        </div>
        <Button onClick={() => openModal()} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Dueño
        </Button>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, apellido, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Dueños */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dueños ({filteredDuenos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDuenos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron dueños</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDuenos.map((dueno) => (
                <div
                  key={dueno.id}
                  className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-teal-700">
                          {dueno.nombre[0]}{dueno.apellido[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{dueno.nombre} {dueno.apellido}</h3>
                        <p className="text-sm text-gray-500">
                          {getMascotasCount(dueno.id)} mascota(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{dueno.telefono}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{dueno.email}</span>
                    </div>
                    {dueno.direccion && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{dueno.direccion}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setViewingDueno(dueno)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onViewMascotas(dueno.id)}
                    >
                      <PawPrint className="w-4 h-4 mr-1" />
                      Mascotas
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openModal(dueno)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(dueno)}
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

      {/* Modal de Dueño */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingDueno ? 'Editar Dueño' : 'Nuevo Dueño'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="555-0000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                placeholder="Calle, número, ciudad..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm"
                placeholder="Información adicional..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                {editingDueno ? 'Guardar Cambios' : 'Crear Dueño'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Ver Detalles */}
      <Dialog open={!!viewingDueno} onOpenChange={() => setViewingDueno(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles del Dueño</DialogTitle>
          </DialogHeader>
          
          {viewingDueno && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-teal-700">
                    {viewingDueno.nombre[0]}{viewingDueno.apellido[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-medium">{viewingDueno.nombre} {viewingDueno.apellido}</h3>
                  <p className="text-gray-500">Registrado el {new Date(viewingDueno.fechaRegistro).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{viewingDueno.telefono}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{viewingDueno.email}</span>
                </div>
                {viewingDueno.direccion && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{viewingDueno.direccion}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <PawPrint className="w-4 h-4" />
                  Mascotas ({getMascotasCount(viewingDueno.id)})
                </h4>
                <div className="space-y-2">
                  {mascotas
                    .filter(m => m.duenoId === viewingDueno.id)
                    .map(mascota => (
                      <div key={mascota.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="font-medium">{mascota.nombre}</span>
                        <span className="text-sm text-gray-500">({mascota.especie} - {mascota.raza || 'Sin raza'})</span>
                      </div>
                    ))}
                  {getMascotasCount(viewingDueno.id) === 0 && (
                    <p className="text-gray-500 text-sm">No tiene mascotas registradas</p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setViewingDueno(null)}>
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
