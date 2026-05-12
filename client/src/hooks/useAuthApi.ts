import { useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '';

export function useAuthApi() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const stored = localStorage.getItem('vetcare_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        localStorage.removeItem('vetcare_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      setUser(data);
      localStorage.setItem('vetcare_user', JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('vetcare_user');
  }, []);

  const hasPermission = useCallback((roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.rol);
  }, [user]);

  // Cargar todos los usuarios
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    return [];
  }, []);

  const addUser = useCallback(async (newUser: Omit<User, 'id' | 'fechaRegistro'>): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchUsers();
        return data;
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
    return null;
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: string, updates: Partial<User>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchUsers();
        if (user?.id === id) {
          const updated = await response.json();
          setUser(updated);
          localStorage.setItem('vetcare_user', JSON.stringify(updated));
        }
        return true;
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
    return false;
  }, [fetchUsers, user]);

  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUsers();
        return true;
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
    return false;
  }, [fetchUsers]);

  return {
    user,
    users,
    isLoading,
    login,
    logout,
    hasPermission,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
  };
}
