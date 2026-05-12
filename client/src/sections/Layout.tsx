import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Stethoscope, 
  Calendar, 
  Users, 
  PawPrint, 
  ClipboardList, 
  UserCog, 
  Clock,
  Menu,
  LogOut,
  ChevronRight,
  User,
  DollarSign,
  LogIn,
  BarChart3,
  Package,
  ShoppingCart,
  Store
} from 'lucide-react';
import type { UserRole } from '@/types';

type ViewType = 'dashboard' | 'citas' | 'duenos' | 'mascotas' | 'historial' | 'personal' | 'turnos' | 'asistencia' | 'reportes' | 'farmacia' | 'venta-farmacia' | 'reportes-farmacia';

interface LayoutProps {
  userRole: UserRole;
  userName: string;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ElementType;
  allowedRoles: UserRole[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Inicio', icon: Calendar, allowedRoles: ['admin', 'medico', 'secretaria', 'recepcionista'] },
  { id: 'citas', label: 'Agenda de Citas', icon: Calendar, allowedRoles: ['admin', 'medico', 'secretaria', 'recepcionista'] },
  { id: 'duenos', label: 'Dueños', icon: Users, allowedRoles: ['admin', 'medico', 'secretaria', 'recepcionista'] },
  { id: 'mascotas', label: 'Pacientes (Mascotas)', icon: PawPrint, allowedRoles: ['admin', 'medico', 'secretaria', 'recepcionista'] },
  { id: 'historial', label: 'Historial Clínico', icon: ClipboardList, allowedRoles: ['admin', 'medico', 'secretaria'] },
  { id: 'personal', label: 'Personal', icon: UserCog, allowedRoles: ['admin', 'secretaria'] },
  { id: 'turnos', label: 'Turnos del Personal', icon: Clock, allowedRoles: ['admin', 'secretaria', 'recepcionista'] },
  { id: 'asistencia', label: 'Control de Asistencia', icon: LogIn, allowedRoles: ['admin', 'secretaria', 'medico', 'recepcionista'] },
  { id: 'reportes', label: 'Reportes Financieros', icon: DollarSign, allowedRoles: ['admin', 'secretaria'] },
  { id: 'farmacia', label: 'Inventario Farmacia', icon: Package, allowedRoles: ['admin', 'secretaria', 'recepcionista'] },
  { id: 'venta-farmacia', label: 'Punto de Venta', icon: ShoppingCart, allowedRoles: ['admin', 'secretaria', 'recepcionista'] },
  { id: 'reportes-farmacia', label: 'Reportes Farmacia', icon: Store, allowedRoles: ['admin', 'secretaria'] },
];

export function Layout({ 
  userRole, 
  userName, 
  currentView, 
  onViewChange, 
  onLogout, 
  children 
}: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavItems = navItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      admin: 'Administrador',
      medico: 'Médico Veterinario',
      secretaria: 'Secretaria',
      recepcionista: 'Recepcionista',
    };
    return labels[role];
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-teal-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">VetCare Pro</h1>
            <p className="text-xs text-teal-200">Sistema Veterinario</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 bg-teal-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-teal-300">{getRoleLabel(userRole)}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onViewChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive 
                      ? 'bg-white text-teal-700 font-medium' 
                      : 'text-teal-100 hover:bg-teal-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-teal-600">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-teal-100 hover:bg-teal-700 hover:text-white"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col bg-teal-700 fixed h-full">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-teal-700 text-white z-50 shadow-md">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-teal-600" />
            </div>
            <span className="font-bold">VetCare Pro</span>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-teal-700 border-none">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
