import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import type { 
  CategoriaProducto, 
  Producto, 
  MovimientoInventario,
  VentaFarmacia,
  ItemVentaFarmacia,
  TurnoCaja,
  ReporteInventario,
  ReporteVentasFarmacia,
  ReporteVentasPorTurno,
  ReporteMovimientosInventario,
  MetodoPago
} from '@/types';

// ============================================
// HOOK DE CATEGORÍAS
// ============================================
export function useCategorias() {
  const { request, loading, error } = useApi();
  const [categorias, setCategorias] = useState<CategoriaProducto[]>([]);

  const fetchCategorias = useCallback(async () => {
    const data = await request('/api/farmacia/categorias');
    if (data) setCategorias(data);
    return data;
  }, [request]);

  const createCategoria = useCallback(async (categoria: Omit<CategoriaProducto, 'id' | 'fechaCreacion' | 'activo'>) => {
    const data = await request('/api/farmacia/categorias', {
      method: 'POST',
      body: JSON.stringify(categoria),
    });
    if (data) setCategorias(prev => [...prev, data]);
    return data;
  }, [request]);

  const updateCategoria = useCallback(async (id: string, categoria: Partial<CategoriaProducto>) => {
    const data = await request(`/api/farmacia/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoria),
    });
    if (data) {
      setCategorias(prev => prev.map(c => c.id === id ? data : c));
    }
    return data;
  }, [request]);

  const deleteCategoria = useCallback(async (id: string) => {
    const data = await request(`/api/farmacia/categorias/${id}`, {
      method: 'DELETE',
    });
    if (data) {
      setCategorias(prev => prev.filter(c => c.id !== id));
    }
    return data;
  }, [request]);

  return {
    categorias,
    loading,
    error,
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
  };
}

// ============================================
// HOOK DE PRODUCTOS
// ============================================
export function useProductos() {
  const { request, loading, error } = useApi();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosStockBajo, setProductosStockBajo] = useState<Producto[]>([]);

  const fetchProductos = useCallback(async () => {
    const data = await request('/api/farmacia/productos');
    if (data) setProductos(data);
    return data;
  }, [request]);

  const fetchProductosStockBajo = useCallback(async () => {
    const data = await request('/api/farmacia/productos/stock-bajo');
    if (data) setProductosStockBajo(data);
    return data;
  }, [request]);

  const buscarProductos = useCallback(async (query: string) => {
    const data = await request(`/api/farmacia/productos/buscar/${encodeURIComponent(query)}`);
    return data as Producto[] | null;
  }, [request]);

  const getProducto = useCallback(async (id: string) => {
    const data = await request(`/api/farmacia/productos/${id}`);
    return data as Producto | null;
  }, [request]);

  const createProducto = useCallback(async (producto: Omit<Producto, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'activo' | 'categoriaNombre'>) => {
    const data = await request('/api/farmacia/productos', {
      method: 'POST',
      body: JSON.stringify(producto),
    });
    if (data) setProductos(prev => [...prev, data]);
    return data;
  }, [request]);

  const updateProducto = useCallback(async (id: string, producto: Partial<Producto>) => {
    const data = await request(`/api/farmacia/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(producto),
    });
    if (data) {
      setProductos(prev => prev.map(p => p.id === id ? data : p));
    }
    return data;
  }, [request]);

  const ajustarStock = useCallback(async (id: string, cantidad: number, motivo: string, usuarioId: string) => {
    const data = await request(`/api/farmacia/productos/${id}/ajustar-stock`, {
      method: 'POST',
      body: JSON.stringify({ cantidad, motivo, usuario_id: usuarioId }),
    });
    if (data) {
      setProductos(prev => prev.map(p => p.id === id ? data : p));
    }
    return data;
  }, [request]);

  const deleteProducto = useCallback(async (id: string) => {
    const data = await request(`/api/farmacia/productos/${id}`, {
      method: 'DELETE',
    });
    if (data) {
      setProductos(prev => prev.filter(p => p.id !== id));
    }
    return data;
  }, [request]);

  return {
    productos,
    productosStockBajo,
    loading,
    error,
    fetchProductos,
    fetchProductosStockBajo,
    buscarProductos,
    getProducto,
    createProducto,
    updateProducto,
    ajustarStock,
    deleteProducto,
  };
}

// ============================================
// HOOK DE MOVIMIENTOS DE INVENTARIO
// ============================================
export function useMovimientosInventario() {
  const { request, loading, error } = useApi();
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);

  const fetchMovimientos = useCallback(async () => {
    const data = await request('/api/farmacia/movimientos');
    if (data) setMovimientos(data);
    return data;
  }, [request]);

  const fetchMovimientosPorProducto = useCallback(async (productoId: string) => {
    const data = await request(`/api/farmacia/movimientos/producto/${productoId}`);
    return data as MovimientoInventario[] | null;
  }, [request]);

  return {
    movimientos,
    loading,
    error,
    fetchMovimientos,
    fetchMovimientosPorProducto,
  };
}

// ============================================
// HOOK DE VENTAS DE FARMACIA
// ============================================
export function useVentasFarmacia() {
  const { request, loading, error } = useApi();
  const [ventas, setVentas] = useState<VentaFarmacia[]>([]);

  const fetchVentas = useCallback(async () => {
    const data = await request('/api/farmacia/ventas');
    if (data) setVentas(data);
    return data;
  }, [request]);

  const fetchVentasPorFecha = useCallback(async (fecha: string) => {
    const data = await request(`/api/farmacia/ventas/fecha/${fecha}`);
    return data as VentaFarmacia[] | null;
  }, [request]);

  const getVenta = useCallback(async (id: string) => {
    const data = await request(`/api/farmacia/ventas/${id}`);
    return data as VentaFarmacia | null;
  }, [request]);

  const createVenta = useCallback(async (venta: {
    duenoId?: string;
    mascotaId?: string;
    items: ItemVentaFarmacia[];
    subtotal: number;
    descuento: number;
    impuesto: number;
    total: number;
    metodoPago: MetodoPago;
    vendedorId: string;
    turnoId?: string;
    notas?: string;
  }) => {
    const data = await request('/api/farmacia/ventas', {
      method: 'POST',
      body: JSON.stringify(venta),
    });
    if (data) setVentas(prev => [data, ...prev]);
    return data;
  }, [request]);

  const cancelarVenta = useCallback(async (id: string, motivo: string, usuarioId: string) => {
    const data = await request(`/api/farmacia/ventas/${id}/cancelar`, {
      method: 'PUT',
      body: JSON.stringify({ motivo, usuario_id: usuarioId }),
    });
    if (data) {
      setVentas(prev => prev.map(v => v.id === id ? { ...v, estado: 'cancelada' as const } : v));
    }
    return data;
  }, [request]);

  return {
    ventas,
    loading,
    error,
    fetchVentas,
    fetchVentasPorFecha,
    getVenta,
    createVenta,
    cancelarVenta,
  };
}

// ============================================
// HOOK DE TURNOS DE CAJA
// ============================================
export function useTurnosCaja() {
  const { request, loading, error } = useApi();
  const [turnos, setTurnos] = useState<TurnoCaja[]>([]);
  const [turnoAbierto, setTurnoAbierto] = useState<TurnoCaja | null>(null);

  const fetchTurnos = useCallback(async () => {
    const data = await request('/api/farmacia/turnos-caja');
    if (data) setTurnos(data);
    return data;
  }, [request]);

  const fetchTurnoAbierto = useCallback(async (usuarioId: string) => {
    const data = await request(`/api/farmacia/turnos-caja/abierto/${usuarioId}`);
    if (data) setTurnoAbierto(data);
    else setTurnoAbierto(null);
    return data;
  }, [request]);

  const abrirTurno = useCallback(async (usuarioId: string, montoApertura: number, notasApertura?: string) => {
    const data = await request('/api/farmacia/turnos-caja/abrir', {
      method: 'POST',
      body: JSON.stringify({ 
        usuario_id: usuarioId, 
        monto_apertura: montoApertura, 
        notas_apertura: notasApertura 
      }),
    });
    if (data) {
      setTurnoAbierto(data);
      setTurnos(prev => [data, ...prev]);
    }
    return data;
  }, [request]);

  const cerrarTurno = useCallback(async (turnoId: string, montoCierre: number, notasCierre?: string) => {
    const data = await request(`/api/farmacia/turnos-caja/${turnoId}/cerrar`, {
      method: 'PUT',
      body: JSON.stringify({ monto_cierre: montoCierre, notas_cierre: notasCierre }),
    });
    if (data) {
      setTurnoAbierto(null);
      setTurnos(prev => prev.map(t => t.id === turnoId ? data : t));
    }
    return data;
  }, [request]);

  return {
    turnos,
    turnoAbierto,
    loading,
    error,
    fetchTurnos,
    fetchTurnoAbierto,
    abrirTurno,
    cerrarTurno,
  };
}

// ============================================
// HOOK DE REPORTES DE FARMACIA
// ============================================
export function useReportesFarmacia() {
  const { request, loading, error } = useApi();

  const fetchReporteInventario = useCallback(async () => {
    const data = await request('/api/farmacia/reportes/inventario');
    return data as ReporteInventario | null;
  }, [request]);

  const fetchReporteVentas = useCallback(async (fechaInicio: string, fechaFin: string) => {
    const data = await request(`/api/farmacia/reportes/ventas/${fechaInicio}/${fechaFin}`);
    return data as ReporteVentasFarmacia | null;
  }, [request]);

  const fetchReporteVentasPorTurno = useCallback(async (turnoId: string) => {
    const data = await request(`/api/farmacia/reportes/ventas-por-turno/${turnoId}`);
    return data as ReporteVentasPorTurno | null;
  }, [request]);

  const fetchReporteMovimientos = useCallback(async (fechaInicio: string, fechaFin: string) => {
    const data = await request(`/api/farmacia/reportes/movimientos/${fechaInicio}/${fechaFin}`);
    return data as ReporteMovimientosInventario | null;
  }, [request]);

  return {
    loading,
    error,
    fetchReporteInventario,
    fetchReporteVentas,
    fetchReporteVentasPorTurno,
    fetchReporteMovimientos,
  };
}