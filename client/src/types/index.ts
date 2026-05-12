// Tipos de usuarios y roles
export type UserRole = 'medico' | 'secretaria' | 'recepcionista' | 'admin';

export interface User {
  id: string;
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  telefono?: string;
  activo: boolean;
  fechaRegistro: string;
}

// Tipos de dueños de mascotas
export interface Dueno {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion?: string;
  fechaRegistro: string;
  notas?: string;
}

// Tipos de mascotas (pacientes)
export type Especie = 'perro' | 'gato' | 'ave' | 'conejo' | 'hamster' | 'otro';
export type Sexo = 'macho' | 'hembra';

export interface Mascota {
  id: string;
  nombre: string;
  especie: Especie;
  raza?: string;
  fechaNacimiento?: string;
  sexo?: Sexo;
  color?: string;
  peso?: number;
  duenoId: string;
  microchip?: string;
  alergias?: string;
  notas?: string;
  fechaRegistro: string;
}

// Tipos de historial clínico
export interface HistorialClinico {
  id: string;
  mascotaId: string;
  fecha: string;
  medicoId: string;
  motivoConsulta: string;
  sintomas: string;
  diagnostico: string;
  tratamiento: string;
  medicamentos?: string;
  observaciones?: string;
  proximaCita?: string;
  costo?: number;
}

// Tipos de citas
export type EstadoCita = 'pendiente' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada';

export interface Cita {
  id: string;
  mascotaId: string;
  duenoId: string;
  fecha: string;
  hora: string;
  duracion: number; // en minutos
  motivo: string;
  medicoId?: string;
  estado: EstadoCita;
  notas?: string;
  fechaCreacion: string;
}

// Tipos de turnos del personal
export type TipoTurno = 'mañana' | 'tarde' | 'noche' | 'completo';

export interface Turno {
  id: string;
  usuarioId: string;
  fecha: string;
  tipo: TipoTurno;
  horaInicio: string;
  horaFin: string;
  notas?: string;
}

// Tipos de asistencia (entrada/salida)
export interface Asistencia {
  id: string;
  usuarioId: string;
  usuarioNombre?: string;
  usuarioRol?: string;
  fecha: string;
  horaEntrada: string;
  horaSalida?: string;
  tipoRegistro: 'manual' | 'automatico';
  notas?: string;
  latitud?: number;
  longitud?: number;
  fechaRegistro: string;
  // Campos calculados
  estadoAsistencia?: 'a_tiempo' | 'retraso';
  minutosRetraso?: number;
}

// Tipos de pagos/ingresos
export type TipoPago = 'consulta' | 'servicio' | 'producto' | 'otro';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'otro';
export type EstadoPago = 'pagado' | 'pendiente' | 'anulado';

export interface Pago {
  id: string;
  tipo: TipoPago;
  referenciaId?: string;
  mascotaId?: string;
  mascotaNombre?: string;
  duenoId: string;
  duenoNombre?: string;
  duenoApellido?: string;
  concepto: string;
  monto: number;
  metodoPago: MetodoPago;
  estado: EstadoPago;
  fechaPago: string;
  registradoPor?: string;
  registradoPorNombre?: string;
  notas?: string;
}

// Configuración de horarios
export interface HorarioConfig {
  id: string;
  usuarioId: string;
  diaSemana: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado
  horaEntradaEsperada: string;
  horaSalidaEsperada: string;
  toleranciaMinutos: number;
  activo: boolean;
}

// Reportes financieros
export interface ReporteFinancieroDiario {
  fecha: string;
  resumen: {
    cantidadTotal: number;
    montoTotal: number;
  };
  porMetodoPago: {
    metodoPago: MetodoPago;
    cantidad: number;
    total: number;
  }[];
  porTipo: {
    tipo: TipoPago;
    cantidad: number;
    total: number;
  }[];
  transacciones: Pago[];
}

export interface ReporteFinancieroSemanal {
  fechaInicio: string;
  fechaFin: string;
  resumen: {
    cantidadTotal: number;
    montoTotal: number;
  };
  porDia: {
    fecha: string;
    cantidad: number;
    total: number;
  }[];
  porMetodoPago: {
    metodoPago: MetodoPago;
    cantidad: number;
    total: number;
  }[];
}

export interface ReporteFinancieroMensual {
  anio: string;
  mes: string;
  resumen: {
    cantidadTotal: number;
    montoTotal: number;
  };
  porDia: {
    fecha: string;
    cantidad: number;
    total: number;
  }[];
  porMetodoPago: {
    metodoPago: MetodoPago;
    cantidad: number;
    total: number;
  }[];
  porTipo: {
    tipo: TipoPago;
    cantidad: number;
    total: number;
  }[];
}

// Reportes de asistencia/retrasos
export interface ReporteRetraso {
  usuarioId: string;
  usuarioNombre: string;
  usuarioRol: string;
  totalDias: number;
  diasConRetraso: number;
  promedioMinutosRetraso: number;
  maximoMinutosRetraso: number;
}

export interface ResumenAsistencia {
  usuarioId: string;
  usuarioNombre: string;
  totalRegistros: number;
  registrosCompletos: number;
  promedioHorasTrabajadas: number;
  totalRetrasos: number;
}

// Estado de la aplicación
export interface AppState {
  currentUser: User | null;
  users: User[];
  duenos: Dueno[];
  mascotas: Mascota[];
  historial: HistorialClinico[];
  citas: Cita[];
  turnos: Turno[];
  asistencia: Asistencia[];
  pagos: Pago[];
}

// Props comunes
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SelectOption {
  value: string;
  label: string;
}

// ============================================
// TIPOS DE FARMACIA
// ============================================

// Categorías de productos
export interface CategoriaProducto {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion: string;
}

// Productos del inventario
export interface Producto {
  id: string;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  categoriaId: string;
  categoriaNombre?: string;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  unidadMedida: string;
  proveedor?: string;
  fechaVencimiento?: string;
  requiereReceta: boolean;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Tipos de movimiento de inventario
export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste' | 'devolucion' | 'vencimiento';

// Movimientos de inventario
export interface MovimientoInventario {
  id: string;
  productoId: string;
  productoNombre?: string;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo?: string;
  referenciaId?: string;
  tipoReferencia?: string;
  costoUnitario?: number;
  precioVentaUnitario?: number;
  usuarioId: string;
  usuarioNombre?: string;
  fechaMovimiento: string;
  notas?: string;
}

// Detalle de venta
export interface DetalleVentaFarmacia {
  id: string;
  ventaId: string;
  productoId: string;
  productoNombre?: string;
  productoCodigo?: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  total: number;
}

// Ventas de farmacia
export type EstadoVentaFarmacia = 'completada' | 'pendiente' | 'cancelada';

export interface VentaFarmacia {
  id: string;
  numeroVenta: string;
  fecha: string;
  hora: string;
  duenoId?: string;
  duenoNombre?: string;
  duenoApellido?: string;
  mascotaId?: string;
  mascotaNombre?: string;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  metodoPago: MetodoPago;
  estado: EstadoVentaFarmacia;
  vendedorId: string;
  vendedorNombre?: string;
  turnoId?: string;
  notas?: string;
  fechaCreacion: string;
  // Detalle de la venta
  detalle?: DetalleVentaFarmacia[];
}

// Item para crear venta
export interface ItemVentaFarmacia {
  productoId: string;
  productoNombre?: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  total: number;
}

// Turnos de caja
export type EstadoTurnoCaja = 'abierto' | 'cerrado';

export interface TurnoCaja {
  id: string;
  usuarioId: string;
  usuarioNombre?: string;
  fechaApertura: string;
  horaApertura: string;
  montoApertura: number;
  fechaCierre?: string;
  horaCierre?: string;
  montoCierre?: number;
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalTransferencia: number;
  estado: EstadoTurnoCaja;
  notasApertura?: string;
  notasCierre?: string;
}

// Reportes de farmacia
export interface ReporteInventario {
  resumen: {
    totalProductos: number;
    productosStockBajo: number;
    valorInventarioCosto: number;
    valorInventarioVenta: number;
  };
  porCategoria: {
    categoria: string;
    cantidadProductos: number;
    stockTotal: number;
    valorCosto: number;
    valorVenta: number;
  }[];
}

export interface ReporteVentasFarmacia {
  periodo: {
    fechaInicio: string;
    fechaFin: string;
  };
  resumen: {
    totalVentas: number;
    totalSubtotal: number;
    totalDescuentos: number;
    totalImpuestos: number;
    totalVentasMonto: number;
  };
  porDia: {
    fecha: string;
    cantidadVentas: number;
    totalVentas: number;
  }[];
  porMetodoPago: {
    metodoPago: MetodoPago;
    cantidad: number;
    total: number;
  }[];
  porVendedor: {
    vendedor: string;
    cantidadVentas: number;
    totalVentas: number;
  }[];
  productosMasVendidos: {
    producto: string;
    codigo?: string;
    cantidadVendida: number;
    totalVentas: number;
  }[];
}

export interface ReporteVentasPorTurno {
  turno: TurnoCaja;
  ventas: VentaFarmacia[];
  totales: {
    cantidadVentas: number;
    totalSubtotal: number;
    totalDescuentos: number;
    totalVentas: number;
    totalEfectivo: number;
    totalTarjeta: number;
    totalTransferencia: number;
  };
}

export interface ReporteMovimientosInventario {
  movimientos: MovimientoInventario[];
  resumen: {
    tipoMovimiento: TipoMovimiento;
    cantidadMovimientos: number;
    totalUnidades: number;
  }[];
}
