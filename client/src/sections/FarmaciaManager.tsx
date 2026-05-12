import { useState, useEffect, useCallback } from 'react';
import { 
  Package, Plus, Search, Edit2, Trash2, AlertTriangle, 
  TrendingUp, TrendingDown, Box, Tag, History, BarChart3,
  ChevronDown, ChevronUp, X, Save, Minus, Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProductos, useCategorias, useMovimientosInventario, useReportesFarmacia } from '@/hooks/useFarmaciaApi';
import { useToast } from '@/hooks/use-toast';
import type { Producto, CategoriaProducto } from '@/types';

interface FarmaciaManagerProps {
  currentUser: { id: string; nombre: string; rol: string } | null;
}

export default function FarmaciaManager({ currentUser }: FarmaciaManagerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('productos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isProductoModalOpen, setIsProductoModalOpen] = useState(false);
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
  const [isAjusteModalOpen, setIsAjusteModalOpen] = useState(false);
  const [isMovimientosModalOpen, setIsMovimientosModalOpen] = useState(false);
  const [ajusteCantidad, setAjusteCantidad] = useState('');
  const [ajusteMotivo, setAjusteMotivo] = useState('');

  const {
    productos,
    productosStockBajo,
    fetchProductos,
    fetchProductosStockBajo,
    buscarProductos,
    createProducto,
    updateProducto,
    ajustarStock,
    deleteProducto,
    loading: loadingProductos
  } = useProductos();

  const {
    categorias,
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    loading: loadingCategorias
  } = useCategorias();

  const {
    fetchMovimientosPorProducto
  } = useMovimientosInventario();

  const {
    fetchReporteInventario
  } = useReportesFarmacia();

  const [movimientosProducto, setMovimientosProducto] = useState<any[]>([]);
  const [reporteInventario, setReporteInventario] = useState<any>(null);

  // Formulario de producto
  const [productoForm, setProductoForm] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoriaId: '',
    precioCompra: '',
    precioVenta: '',
    stockActual: '',
    stockMinimo: '5',
    stockMaximo: '100',
    unidadMedida: 'unidad',
    proveedor: '',
    fechaVencimiento: '',
    requiereReceta: false
  });

  // Formulario de categoría
  const [categoriaForm, setCategoriaForm] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
    fetchProductosStockBajo();
    cargarReporteInventario();
  }, []);

  const cargarReporteInventario = async () => {
    const data = await fetchReporteInventario();
    if (data) setReporteInventario(data);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await buscarProductos(searchQuery);
    } else {
      await fetchProductos();
    }
  };

  const openProductoModal = (producto?: Producto) => {
    if (producto) {
      setSelectedProducto(producto);
      setProductoForm({
        codigo: producto.codigo || '',
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        categoriaId: producto.categoriaId,
        precioCompra: producto.precioCompra.toString(),
        precioVenta: producto.precioVenta.toString(),
        stockActual: producto.stockActual.toString(),
        stockMinimo: producto.stockMinimo.toString(),
        stockMaximo: producto.stockMaximo.toString(),
        unidadMedida: producto.unidadMedida,
        proveedor: producto.proveedor || '',
        fechaVencimiento: producto.fechaVencimiento || '',
        requiereReceta: producto.requiereReceta
      });
    } else {
      setSelectedProducto(null);
      setProductoForm({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoriaId: '',
        precioCompra: '',
        precioVenta: '',
        stockActual: '',
        stockMinimo: '5',
        stockMaximo: '100',
        unidadMedida: 'unidad',
        proveedor: '',
        fechaVencimiento: '',
        requiereReceta: false
      });
    }
    setIsProductoModalOpen(true);
  };

  const saveProducto = async () => {
    if (!productoForm.nombre || !productoForm.categoriaId) {
      toast({
        title: 'Error',
        description: 'Nombre y categoría son obligatorios',
        variant: 'destructive'
      });
      return;
    }

    const productoData = {
      ...productoForm,
      precioCompra: parseFloat(productoForm.precioCompra) || 0,
      precioVenta: parseFloat(productoForm.precioVenta) || 0,
      stockActual: parseInt(productoForm.stockActual) || 0,
      stockMinimo: parseInt(productoForm.stockMinimo) || 5,
      stockMaximo: parseInt(productoForm.stockMaximo) || 100,
      usuario_id: currentUser?.id
    };

    if (selectedProducto) {
      await updateProducto(selectedProducto.id, productoData);
      toast({ title: 'Éxito', description: 'Producto actualizado correctamente' });
    } else {
      await createProducto(productoData);
      toast({ title: 'Éxito', description: 'Producto creado correctamente' });
    }
    setIsProductoModalOpen(false);
    fetchProductos();
    fetchProductosStockBajo();
    cargarReporteInventario();
  };

  const handleDeleteProducto = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      await deleteProducto(id);
      toast({ title: 'Éxito', description: 'Producto eliminado correctamente' });
      fetchProductos();
      cargarReporteInventario();
    }
  };

  const openAjusteModal = (producto: Producto) => {
    setSelectedProducto(producto);
    setAjusteCantidad('');
    setAjusteMotivo('');
    setIsAjusteModalOpen(true);
  };

  const handleAjusteStock = async () => {
    if (!selectedProducto || !ajusteCantidad || !ajusteMotivo) return;
    
    await ajustarStock(
      selectedProducto.id, 
      parseInt(ajusteCantidad), 
      ajusteMotivo,
      currentUser?.id || 'system'
    );
    toast({ title: 'Éxito', description: 'Stock ajustado correctamente' });
    setIsAjusteModalOpen(false);
    fetchProductos();
    fetchProductosStockBajo();
    cargarReporteInventario();
  };

  const verMovimientos = async (producto: Producto) => {
    setSelectedProducto(producto);
    const data = await fetchMovimientosPorProducto(producto.id);
    if (data) setMovimientosProducto(data);
    setIsMovimientosModalOpen(true);
  };

  const saveCategoria = async () => {
    if (!categoriaForm.nombre) {
      toast({ title: 'Error', description: 'El nombre es obligatorio', variant: 'destructive' });
      return;
    }

    await createCategoria(categoriaForm);
    toast({ title: 'Éxito', description: 'Categoría creada correctamente' });
    setIsCategoriaModalOpen(false);
    setCategoriaForm({ nombre: '', descripcion: '' });
    fetchCategorias();
  };

  const getStockBadge = (producto: Producto) => {
    if (producto.stockActual <= 0) {
      return <Badge variant="destructive">Sin Stock</Badge>;
    } else if (producto.stockActual <= producto.stockMinimo) {
      return <Badge variant="destructive" className="bg-orange-500">Stock Bajo</Badge>;
    } else if (producto.stockActual >= producto.stockMaximo) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Stock Alto</Badge>;
    }
    return <Badge variant="default" className="bg-green-500">OK</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

return (
    <div className="space-y-6 overflow-x-hidden px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-indigo-600" />
            Gestión de Farmacia
          </h1>
          <p className="text-gray-500 mt-1">Control de inventario, productos y stock</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Button onClick={() => openProductoModal()} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
          <Button variant="outline" onClick={() => setIsCategoriaModalOpen(true)}>
            <Tag className="h-4 w-4 mr-2" />
            Categorías
          </Button>
        </div>
      </div>

      {/* Resumen */}
      {reporteInventario && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Productos</p>
                  <p className="text-2xl font-bold">{reporteInventario.resumen.totalProductos}</p>
                </div>
                <Box className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Stock Bajo</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {reporteInventario.resumen.productosStockBajo}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Valor Costo</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(reporteInventario.resumen.valorInventarioCosto)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Valor Venta</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(reporteInventario.resumen.valorInventarioVenta)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
	  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-2">
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="stock-bajo">
            Stock Bajo
            {productosStockBajo.length > 0 && (
              <Badge variant="destructive" className="ml-2">{productosStockBajo.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="categorias">Categorías</TabsTrigger>
        </TabsList>

        {/* Tab Productos */}
        <TabsContent value="productos" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

               <Card>
  <CardContent className="p-0">

    <div className="overflow-x-auto">

      <ScrollArea className="h-[500px] min-w-[900px]">

        <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">P. Compra</TableHead>
                      <TableHead className="text-right">P. Venta</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productos.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell className="font-mono text-sm">{producto.codigo || '-'}</TableCell>
                        <TableCell>
                          <div className="font-medium">{producto.nombre}</div>
                          {producto.requiereReceta && (
                            <Badge variant="outline" className="text-xs mt-1">Requiere Receta</Badge>
                          )}
                        </TableCell>
                        <TableCell>{producto.categoriaNombre}</TableCell>
                        <TableCell className="text-right">
                          {producto.stockActual} {producto.unidadMedida}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(producto.precioCompra)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(producto.precioVenta)}</TableCell>
                        <TableCell>{getStockBadge(producto)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openAjusteModal(producto)}>
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => verMovimientos(producto)}>
                              <History className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openProductoModal(producto)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteProducto(producto.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Stock Bajo */}
        <TabsContent value="stock-bajo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                Productos con Stock Bajo o Agotado
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
		<ScrollArea className="w-full">
		<div className="overflow-x-auto">
  		<Table>               
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Stock Actual</TableHead>
                      <TableHead>Stock Mínimo</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productosStockBajo.map((producto) => (
                      <TableRow key={producto.id} className={producto.stockActual <= 0 ? 'bg-red-50' : 'bg-orange-50'}>
                        <TableCell>
                          <div className="font-medium">{producto.nombre}</div>
                          <div className="text-sm text-gray-500">{producto.categoriaNombre}</div>
                        </TableCell>
                        <TableCell>
                          <span className={producto.stockActual <= 0 ? 'text-red-600 font-bold' : 'text-orange-600 font-bold'}>
                            {producto.stockActual}
                          </span>
                        </TableCell>
                        <TableCell>{producto.stockMinimo}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => openAjusteModal(producto)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Ajustar Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
		</Table>
		</div>                
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Categorías */}
        <TabsContent value="categorias">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Categorías de Productos</CardTitle>
              <Button size="sm" onClick={() => setIsCategoriaModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorias.map((categoria) => (
                  <Card key={categoria.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{categoria.nombre}</h3>
                          <p className="text-sm text-gray-500">{categoria.descripcion}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteCategoria(categoria.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Producto */}
      <Dialog open={isProductoModalOpen} onOpenChange={setIsProductoModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProducto ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          </DialogHeader>
	    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={productoForm.codigo}
                onChange={(e) => setProductoForm({...productoForm, codigo: e.target.value})}
                placeholder="Código del producto"
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={productoForm.nombre}
                onChange={(e) => setProductoForm({...productoForm, nombre: e.target.value})}
                placeholder="Nombre del producto"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={productoForm.descripcion}
                onChange={(e) => setProductoForm({...productoForm, descripcion: e.target.value})}
                placeholder="Descripción del producto"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select
                value={productoForm.categoriaId}
                onValueChange={(value) => setProductoForm({...productoForm, categoriaId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidad de Medida</Label>
              <Select
                value={productoForm.unidadMedida}
                onValueChange={(value) => setProductoForm({...productoForm, unidadMedida: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unidad">Unidad</SelectItem>
                  <SelectItem value="caja">Caja</SelectItem>
                  <SelectItem value="kg">Kilogramo</SelectItem>
                  <SelectItem value="g">Gramo</SelectItem>
                  <SelectItem value="ml">Mililitro</SelectItem>
                  <SelectItem value="l">Litro</SelectItem>
                  <SelectItem value="tableta">Tableta</SelectItem>
                  <SelectItem value="capsula">Cápsula</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Precio de Compra</Label>
              <Input
                type="number"
                step="0.01"
                value={productoForm.precioCompra}
                onChange={(e) => setProductoForm({...productoForm, precioCompra: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Precio de Venta</Label>
              <Input
                type="number"
                step="0.01"
                value={productoForm.precioVenta}
                onChange={(e) => setProductoForm({...productoForm, precioVenta: e.target.value})}
                placeholder="0.00"
              />
            </div>
            {!selectedProducto && (
              <div className="space-y-2">
                <Label>Stock Inicial</Label>
                <Input
                  type="number"
                  value={productoForm.stockActual}
                  onChange={(e) => setProductoForm({...productoForm, stockActual: e.target.value})}
                  placeholder="0"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Stock Mínimo</Label>
              <Input
                type="number"
                value={productoForm.stockMinimo}
                onChange={(e) => setProductoForm({...productoForm, stockMinimo: e.target.value})}
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <Label>Stock Máximo</Label>
              <Input
                type="number"
                value={productoForm.stockMaximo}
                onChange={(e) => setProductoForm({...productoForm, stockMaximo: e.target.value})}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Input
                value={productoForm.proveedor}
                onChange={(e) => setProductoForm({...productoForm, proveedor: e.target.value})}
                placeholder="Nombre del proveedor"
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de Vencimiento</Label>
              <Input
                type="date"
                value={productoForm.fechaVencimiento}
                onChange={(e) => setProductoForm({...productoForm, fechaVencimiento: e.target.value})}
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Switch
                checked={productoForm.requiereReceta}
                onCheckedChange={(checked) => setProductoForm({...productoForm, requiereReceta: checked})}
              />
              <Label>Requiere Receta Médica</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductoModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveProducto} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ajuste Stock */}
      <Dialog open={isAjusteModalOpen} onOpenChange={setIsAjusteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Stock - {selectedProducto?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Stock Actual: <strong>{selectedProducto?.stockActual}</strong></p>
            </div>
            <div className="space-y-2">
              <Label>Cantidad (positiva para entrada, negativa para salida)</Label>
              <Input
                type="number"
                value={ajusteCantidad}
                onChange={(e) => setAjusteCantidad(e.target.value)}
                placeholder="Ej: 10 o -5"
              />
            </div>
            <div className="space-y-2">
              <Label>Motivo del Ajuste</Label>
              <Textarea
                value={ajusteMotivo}
                onChange={(e) => setAjusteMotivo(e.target.value)}
                placeholder="Ej: Compra a proveedor, Merma, Ajuste de inventario..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAjusteModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAjusteStock} className="bg-indigo-600 hover:bg-indigo-700">
              Aplicar Ajuste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Movimientos */}
      <Dialog open={isMovimientosModalOpen} onOpenChange={setIsMovimientosModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Historial de Movimientos - {selectedProducto?.nombre}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Stock Anterior</TableHead>
                  <TableHead>Stock Nuevo</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientosProducto.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell>{new Date(mov.fecha_movimiento).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        mov.tipo_movimiento === 'entrada' ? 'default' :
                        mov.tipo_movimiento === 'salida' ? 'destructive' :
                        'secondary'
                      }>
                        {mov.tipo_movimiento}
                      </Badge>
                    </TableCell>
                    <TableCell>{mov.cantidad}</TableCell>
                    <TableCell>{mov.stock_anterior}</TableCell>
                    <TableCell>{mov.stock_nuevo}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{mov.motivo}</TableCell>
                    <TableCell>{mov.usuario_nombre}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal Categoría */}
      <Dialog open={isCategoriaModalOpen} onOpenChange={setIsCategoriaModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Categoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={categoriaForm.nombre}
                onChange={(e) => setCategoriaForm({...categoriaForm, nombre: e.target.value})}
                placeholder="Nombre de la categoría"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={categoriaForm.descripcion}
                onChange={(e) => setCategoriaForm({...categoriaForm, descripcion: e.target.value})}
                placeholder="Descripción de la categoría"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoriaModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveCategoria} className="bg-indigo-600 hover:bg-indigo-700">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
