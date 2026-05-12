import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const get = useCallback(<T>(endpoint: string) => {
    return request<T>(endpoint, { method: 'GET' });
  }, [request]);

  const post = useCallback(<T>(endpoint: string, body: unknown) => {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }, [request]);

  const put = useCallback(<T>(endpoint: string, body: unknown) => {
    return request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }, [request]);

  const del = useCallback(<T>(endpoint: string) => {
    return request<T>(endpoint, { method: 'DELETE' });
  }, [request]);

  return {
    isLoading,
    error,
    get,
    post,
    put,
    del,
  };
}
