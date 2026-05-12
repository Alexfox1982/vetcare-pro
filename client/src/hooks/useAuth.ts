import { useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '@/types';

const STORAGE_KEY = 'vetcare_auth';
const USERS_KEY = 'vetcare_users';

// Usuarios por defecto para demo
const defaultUsers: User[] = [
  {
    id: '1',
    nombre: 'Dr. Carlos Martínez',
    email: 'medico@vetcare.com',
    password: '123456',
    rol: 'medico',
    telefono: '555-0101',
    activo: true,
    fechaRegistro: new Date().toISOString(),
  },
  {
    id: '2',
    nombre: 'Ana López',
    email: 'secretaria@vetcare.com',
    password: '123456',
    rol: 'secretaria',
    telefono: '555-0102',
    activo: true,
    fechaRegistro: new Date().toISOString(),
  },
  {
    id: '3',
    nombre: 'María García',
    email: 'recepcionista@vetcare.com',
    password: '123456',
    rol: 'recepcionista',
    telefono: '555-0103',
    activo: true,
    fechaRegistro: new Date().toISOString(),
  },
  {
    id: '4',
    nombre: 'Administrador',
    email: 'admin@vetcare.com',
    password: '123456',
    rol: 'admin',
    telefono: '555-0100',
    activo: true,
    fechaRegistro: new Date().toISOString(),
  },
];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inicializar usuarios por defecto si no existen
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (!storedUsers) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }

    // Verificar sesión activa
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    const storedUsers = localStorage.getItem(USERS_KEY);
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : defaultUsers;
    
    const found = users.find(
      (u) => u.email === email && u.password === password && u.activo
    );
    
    if (found) {
      setUser(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasPermission = useCallback((roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.rol);
  }, [user]);

  const getAllUsers = useCallback((): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : defaultUsers;
  }, []);

  const addUser = useCallback((newUser: Omit<User, 'id' | 'fechaRegistro'>): User => {
    const users = getAllUsers();
    const userWithId: User = {
      ...newUser,
      id: Date.now().toString(),
      fechaRegistro: new Date().toISOString(),
    };
    users.push(userWithId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return userWithId;
  }, [getAllUsers]);

  const updateUser = useCallback((id: string, updates: Partial<User>): boolean => {
    const users = getAllUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      if (user?.id === id) {
        setUser(users[index]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users[index]));
      }
      return true;
    }
    return false;
  }, [getAllUsers, user]);

  const deleteUser = useCallback((id: string): boolean => {
    const users = getAllUsers();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length < users.length) {
      localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
      return true;
    }
    return false;
  }, [getAllUsers]);

  return {
    user,
    isLoading,
    login,
    logout,
    hasPermission,
    getAllUsers,
    addUser,
    updateUser,
    deleteUser,
  };
}
