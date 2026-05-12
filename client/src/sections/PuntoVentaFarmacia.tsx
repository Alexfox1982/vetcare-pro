import { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, Search, CreditCard, 
  Banknote, ArrowRightLeft, Receipt, User, Package, 
  X, Check, Printer, Save, History, Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useProductos, useVentasFarmacia, useTurnosCaja } from '@/hooks/useFarmaciaApi';
import { useAppData } from '@/hooks/useAppData';
import { useToast } from '@/hooks/use-toast';
import type { Producto, ItemVentaFarmacia, MetodoPago } from '@/types';

interface PuntoVentaFarmaciaProps {
  currentUser: { id: string; nombre: string; rol: string } | null;
}

export default function PuntoVentaFarmacia({ currentUser }: PuntoVentaFarmaciaProps) {
  const { toast } = useToast();
  const { duenos } = useAppData();
  const { productos, buscarProductos, fetchProductos } = useProductos();
  const { createVenta, fetchVentasPorFecha } = useVentasFarmacia();
  const { turnoAbierto, fetchTurnoAbierto, abrirTurno, cerrarTurno } = useTurnosCaja();

  const [searchQuery, setSearchQuery] = useState('');
  const [productosBusqueda, setProductosBusqueda] = useState<Producto[]>([]);
  const [cart, setCart] = useState<ItemVentaFarmacia[]>([]);
  const [selectedDueno, setSelectedDueno] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [descuento, setDescuento] = useState('');
  const [notas, setNotas] = useState('');
  const [isCompletarModalOpen, setIsCompletarModalOpen] = useState(false);
  const [isAbrirTurnoModalOpen, setIsAbrirTurnoModalOpen] = useState(false);
  const [isCerrarTurnoModalOpen, setIsCerrarTurnoModalOpen] = useState(false);
  const [montoApertura, setMontoApertura] = useState('');
  const [montoCierre, setMontoCierre] = useState('');
  const [ventasHoy, setVentasHoy] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchTurnoAbierto(currentUser.id);
    }
    fetchProductos();
    cargarVentasHoy();
  }, [currentUser]);

  const cargarVentasHoy = async () => {
    const hoy = new Date().toISOString().split('T')[0];
    const data = await fetchVentasPorFecha(hoy);
    if (data) setVentasHoy(data);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const data = await buscarProductos(searchQuery);
      if (data) setProductosBusqueda(data);
    } else {
      setProductosBusqueda([]);
    }
  };

  const addToCart = (producto: Producto) => {
    if (producto.stockActual <= 0) {
      toast({ title: 'Error', description: 'Producto sin stock', variant: 'destructive' });
      return;
    }

    const existingItem = cart.find(item => item.productoId === producto.id);
    
    if (existingItem) {
      if (existingItem.cantidad >= producto.stockActual) {
        toast({ title: 'Error', description: 'Stock insuficiente', variant: 'destructive' });
        return;
      }
      setCart(cart.map(item => 
        item.productoId === producto.id 
          ? { 
              ...item, 
              cantidad: item.cantidad + 1,
              subtotal: (item.cantidad + 1) * item.precioUnitario,
              total: (item.cantidad + 1) * item.precioUnitario - item.descuento
            }
          : item
      ));
    } else {
      const newItem: ItemVentaFarmacia = {
        productoId: producto.id,
        productoNombre: producto.nombre,
        cantidad: 1,
        precioUnitario: producto.precioVenta,
        descuento: 0,
        subtotal: producto.precioVenta,
        total: producto.precioVenta
      };
      setCart([...cart, newItem]);
    }
    setSearchQuery('');
    setProductosBusqueda([]);
  };

  const updateCantidad = (productoId: string, delta: number) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    setCart(cart.map(item => {
      if (item.productoId === productoId) {
        const newCantidad = item.cantidad + delta;
        if (newCantidad <= 0) return item;
        if (newCantidad > producto.stockActual) {
          toast({ title: 'Error', description: 'Stock insuficiente', variant: 'destructive' });
          return item;
        }
        return {
          ...item,
          cantidad: newCantidad,
          subtotal: newCantidad * item.precioUnitario,
          total: newCantidad * item.precioUnitario - item.descuento
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productoId: string) => {
    setCart(cart.filter(item => item.productoId !== productoId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedDueno('');
    setDescuento('');
    setNotas('');
    setMetodoPago('efectivo');
  };

  const calcularTotales = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const descuentoTotal = parseFloat(descuento) || 0;
    const impuesto = 0; // Puedes agregar lógica de impuestos
    const total = subtotal - descuentoTotal + impuesto;
    return { subtotal, descuentoTotal, impuesto, total };
  };

  const handleCompletarVenta = async () => {
    if (cart.length === 0) {
      toast({ title: 'Error', description: 'El carrito está vacío', variant: 'destructive' });
      return;
    }

    if (!turnoAbierto) {
      toast({ title: 'Error', description: 'Debe abrir un turno de caja primero', variant: 'destructive' });
      setIsAbrirTurnoModalOpen(true);
      return;
    }

    const { subtotal, descuentoTotal, impuesto, total } = calcularTotales();

    const ventaData = {
      duenoId: selectedDueno || undefined,
      items: cart,
      subtotal,
      descuento: descuentoTotal,
      impuesto,
      total,
      metodoPago,
      vendedorId: currentUser?.id || '',
      turnoId: turnoAbierto.id,
      notas
    };

    const result = await createVenta(ventaData);
    if (result) {
      toast({ title: 'Éxito', description: `Venta ${result.numeroVenta} completada` });
      clearCart();
      cargarVentasHoy();
      setIsCompletarModalOpen(false);
    }
  };

  const handleAbrirTurno = async () => {
    if (!currentUser?.id) return;
    
    await abrirTurno(currentUser.id, parseFloat(montoApertura) || 0);
    toast({ title: 'Éxito', description: 'Turno de caja abierto' });
    setIsAbrirTurnoModalOpen(false);
    setMontoApertura('');
  };

  const handleCerrarTurno = async () => {
    if (!turnoAbierto) return;
    
    await cerrarTurno(turnoAbierto.id, parseFloat(montoCierre) || 0);
    toast({ title: 'Éxito', description: 'Turno de caja cerrado' });
    setIsCerrarTurnoModalOpen(false);
    setMontoCierre('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const { subtotal, descuentoTotal, impuesto, total } = calcularTotales();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Store className="h-8 w-8 text-indigo-600" />
            Punto de Venta - Farmacia
          </h1>
          <p className="text-gray-500 mt-1">Venta rápida de productos</p>
        </div>
        <div className="flex gap-2">
          {turnoAbierto ? (
            <Button variant="outline" onClick={() => setIsCerrarTurnoModalOpen(true)} className="border-orange-500 text-orange-600">
              <Store className="h-4 w-4 mr-2" />
              Cerrar Turno
            </Button>
          ) : (
            <Button onClick={() => setIsAbrirTurnoModalOpen(true)} className="bg-green-600 hover:bg-green-700">
              <Store className="h-4 w-4 mr-2" />
              Abrir Turno
            </Button>
          )}
        </div>
      </div>

      {/* Estado del Turno */}
      {turnoAbierto ? (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <p className="font-semibold text-green-800">Turno Abierto</p>
                  <p className="text-sm text-green-600">
                    Apertura: {turnoAbierto.horaApertura} - Monto: {formatCurrency(turnoAbierto.montoApertura)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-orange-500 rounded-full" />
              <div>
                <p className="font-semibold text-orange-800">No hay turno abierto</p>
                <p className="text-sm text-orange-600">Debe abrir un turno de caja para realizar ventas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo - Búsqueda y Productos */}
        <div className="lg:col-span-2 space-y-4">
          {/* Búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Escriba para buscar productos..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length >= 2) {
                      handleSearch();
                    } else {
                      setProductosBusqueda([]);
                    }
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Resultados de búsqueda */}
              {productosBusqueda.length > 0 && (
                <Card className="mt-4 border shadow-lg">
                  <ScrollArea className="h-[300px]">
                    <div className="p-2 space-y-2">
                      {productosBusqueda.map((producto) => (
                        <div
                          key={producto.id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer border"
                          onClick={() => addToCart(producto)}
                        >
                          <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{producto.nombre}</p>
                              <p className="text-sm text-gray-500">{producto.categoriaNombre}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(producto.precioVenta)}</p>
                            <Badge variant={producto.stockActual > 0 ? 'default' : 'destructive'}>
                              Stock: {producto.stockActual}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Ventas del Día */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Ventas de Hoy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                <div className="divide-y">
                  {ventasHoy.map((venta) => (
                    <div key={venta.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{venta.numeroVenta}</p>
                        <p className="text-sm text-gray-500">{venta.hora} - {venta.duenoNombre} {venta.duenoApellido}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(venta.total)}</p>
                        <Badge variant={venta.metodoPago === 'efectivo' ? 'default' : venta.metodoPago === 'tarjeta' ? 'secondary' : 'outline'}>
                          {venta.metodoPago}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Panel Derecho - Carrito */}
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrito ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cliente */}
              <div className="space-y-2">
                <Label>Cliente (Opcional)</Label>
                <Select value={selectedDueno} onValueChange={setSelectedDueno}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Cliente General</SelectItem>
                    {duenos.map((dueno) => (
                      <SelectItem key={dueno.id} value={dueno.id}>
                        {dueno.nombre} {dueno.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Items del carrito */}
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2" />
                      <p>El carrito está vacío</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.productoId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.productoNombre}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(item.precioUnitario)} c/u</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => updateCantidad(item.productoId, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.cantidad}</span>
                          <Button variant="outline" size="sm" onClick={() => updateCantidad(item.productoId, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.productoId)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <Separator />

              {/* Totales */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Descuento:</span>
                  <Input
                    type="number"
                    value={descuento}
                    onChange={(e) => setDescuento(e.target.value)}
                    className="w-24 text-right"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-indigo-600">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={metodoPago === 'efectivo' ? 'default' : 'outline'}
                    onClick={() => setMetodoPago('efectivo')}
                    className="flex flex-col items-center py-3"
                  >
                    <Banknote className="h-5 w-5 mb-1" />
                    Efectivo
                  </Button>
                  <Button
                    variant={metodoPago === 'tarjeta' ? 'default' : 'outline'}
                    onClick={() => setMetodoPago('tarjeta')}
                    className="flex flex-col items-center py-3"
                  >
                    <CreditCard className="h-5 w-5 mb-1" />
                    Tarjeta
                  </Button>
                  <Button
                    variant={metodoPago === 'transferencia' ? 'default' : 'outline'}
                    onClick={() => setMetodoPago('transferencia')}
                    className="flex flex-col items-center py-3"
                  >
                    <ArrowRightLeft className="h-5 w-5 mb-1" />
                    Transferencia
                  </Button>
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label>Notas</Label>
                <Input
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Notas adicionales..."
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={clearCart}>
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
              <Button 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700" 
                onClick={() => setIsCompletarModalOpen(true)}
                disabled={cart.length === 0 || !turnoAbierto}
              >
                <Check className="h-4 w-4 mr-2" />
                Completar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Modal Completar Venta */}
      <Dialog open={isCompletarModalOpen} onOpenChange={setIsCompletarModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Venta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Descuento:</span>
                <span>-{formatCurrency(descuentoTotal)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total a Pagar:</span>
                <span className="text-indigo-600">{formatCurrency(total)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-gray-500" />
              <span>Método de pago: <strong>{metodoPago}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <span>Cliente: <strong>{selectedDueno ? duenos.find(d => d.id === selectedDueno)?.nombre + ' ' + duenos.find(d => d.id === selectedDueno)?.apellido : 'General'}</strong></span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompletarModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCompletarVenta} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" />
              Confirmar Venta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Abrir Turno */}
      <Dialog open={isAbrirTurnoModalOpen} onOpenChange={setIsAbrirTurnoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Turno de Caja</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto de Apertura</Label>
              <Input
                type="number"
                value={montoApertura}
                onChange={(e) => setMontoApertura(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAbrirTurnoModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAbrirTurno} className="bg-green-600 hover:bg-green-700">
              <Store className="h-4 w-4 mr-2" />
              Abrir Turno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Cerrar Turno */}
      <Dialog open={isCerrarTurnoModalOpen} onOpenChange={setIsCerrarTurnoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Turno de Caja</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {turnoAbierto && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Monto Apertura:</span>
                  <span>{formatCurrency(turnoAbierto.montoApertura)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Ventas:</span>
                  <span>{formatCurrency(turnoAbierto.totalVentas)}</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Monto de Cierre (Efectivo en Caja)</Label>
              <Input
                type="number"
                value={montoCierre}
                onChange={(e) => setMontoCierre(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCerrarTurnoModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCerrarTurno} className="bg-orange-600 hover:bg-orange-700">
              <Store className="h-4 w-4 mr-2" />
              Cerrar Turno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
