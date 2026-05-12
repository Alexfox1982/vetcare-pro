import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  UserCog, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Mail,
  Phone,
  Shield,
  User,
  Eye
} from 'lucide-react';
import type { User as UserType, UserRole } from '@/types';

interface PersonalManagerProps {
  users: UserType[];
  currentUser: UserType;
  onAdd: (user: Omit<UserType, 'id' | 'fechaRegistro'>) => void;
  onUpdate: (id: string, user: Partial<UserType>) => void;
  onDelete: (id: string) => void;
}

const roles: { value: UserRole; label: string; color: string }[] = [
  { value: 'admin', label: 'Administrador', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'medico', label: 'Médico Veterinario', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'secretaria', label: 'Secretaria', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'recepcionista', label: 'Recepcionista', color: 'bg-orange-100 text-orange-800 border-orange-300' },
];

export function PersonalManager({ 
  users, 
  currentUser,
  onAdd, 
  onUpdate, 
  onDelete 
}: PersonalManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRol, setFiltroRol] = useState<UserRole | 'todos'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [viewingUser, setViewingUser] = useState<UserType | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'recepcionista' as UserRole,
    telefono: '',
    activo: true,
  });

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = 
        user.nombre.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.telefono?.includes(searchTerm) || false;
      
      const matchesRol = filtroRol === 'todos' || user.rol === filtroRol;
      
      return matchesSearch && matchesRol;
    }).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [users, searchTerm, filtroRol]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'recepcionista',
      telefono: '',
      activo: true,
    });
    setEditingUser(null);
  };

  const openModal = (user?: UserType) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        password: '', // No mostrar contraseña actual
        rol: user.rol,
        telefono: user.telefono || '',
        activo: user.activo,
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
    
    const data: Omit<UserType, 'id' | 'fechaRegistro'> = {
      ...formData,
      password: editingUser && !formData.password ? editingUser.password : formData.password,
    };
    
    if (editingUser) {
      onUpdate(editingUser.id, data);
    } else {
      onAdd(data);
    }
    closeModal();
  };

  const handleDelete = (user: UserType) => {
    if (user.id === currentUser.id) {
      alert('No puede eliminar su propio usuario');
      return;
    }
    if (confirm(`¿Está seguro de eliminar a ${user.nombre}?`)) {
      onDelete(user.id);
    }
  };

  const getRoleBadge = (rol: UserRole) => {
    const roleInfo = roles.find(r => r.value === rol);
    return (
      <Badge variant="outline" className={roleInfo?.color || ''}>
        {roleInfo?.label || rol}
      </Badge>
    );
  };

  const canEdit = currentUser.rol === 'admin' || currentUser.rol === 'secretaria';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Personal</h1>
          <p className="text-gray-600">Administre los usuarios del sistema</p>
        </div>
        {canEdit && (
          <Button onClick={() => openModal()} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroRol} onValueChange={(v) => setFiltroRol(v as UserRole | 'todos')}>
              <SelectTrigger className="w-[180px]">
                <Shield className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Todos los roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los roles</SelectItem>
                {roles.map(r => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserCog className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 rounded-lg border hover:shadow-md transition-shadow ${
                    !user.activo ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{user.nombre}</h3>
                        {getRoleBadge(user.rol)}
                      </div>
                    </div>
                    {!user.activo && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600">
                        Inactivo
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.telefono && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{user.telefono}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setViewingUser(user)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    {canEdit && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openModal(user)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-700"
                          disabled={user.id === currentUser.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Usuario */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                required
              />
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
              <Label htmlFor="password">
                Contraseña {editingUser && '(dejar en blanco para mantener actual)'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required={!editingUser}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol *</Label>
              <Select 
                value={formData.rol} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, rol: v as UserRole }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="555-0000"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="activo" className="cursor-pointer">Usuario activo</Label>
                <p className="text-sm text-gray-500">Puede iniciar sesión en el sistema</p>
              </div>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, activo: v }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Ver Detalles */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
          </DialogHeader>
          
          {viewingUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">{viewingUser.nombre}</h3>
                  {getRoleBadge(viewingUser.rol)}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{viewingUser.email}</span>
                </div>
                {viewingUser.telefono && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{viewingUser.telefono}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <span>{roles.find(r => r.value === viewingUser.rol)?.label}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">Estado</p>
                <Badge variant={viewingUser.activo ? 'default' : 'secondary'}>
                  {viewingUser.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">Fecha de registro</p>
                <p>{new Date(viewingUser.fechaRegistro).toLocaleDateString()}</p>
              </div>

              <DialogFooter>
                <Button onClick={() => setViewingUser(null)}>
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
