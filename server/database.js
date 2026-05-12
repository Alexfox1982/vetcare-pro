const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

// Crear conexión a la base de datos
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
    initDatabase();
  }
});

// Promisify para usar async/await
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Inicializar tablas
function initDatabase() {
  db.serialize(() => {
    // Tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      rol TEXT NOT NULL CHECK(rol IN ('admin', 'medico', 'secretaria', 'recepcionista')),
      telefono TEXT,
      activo INTEGER DEFAULT 1,
      fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de dueños
    db.run(`CREATE TABLE IF NOT EXISTS duenos (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      email TEXT NOT NULL,
      telefono TEXT NOT NULL,
      direccion TEXT,
      notas TEXT,
      fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de mascotas
    db.run(`CREATE TABLE IF NOT EXISTS mascotas (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      especie TEXT NOT NULL,
      raza TEXT,
      fecha_nacimiento TEXT,
      sexo TEXT CHECK(sexo IN ('macho', 'hembra')),
      color TEXT,
      peso REAL,
      dueno_id TEXT NOT NULL,
      microchip TEXT,
      alergias TEXT,
      notas TEXT,
      fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dueno_id) REFERENCES duenos(id) ON DELETE CASCADE
    )`);

    // Tabla de citas
    db.run(`CREATE TABLE IF NOT EXISTS citas (
      id TEXT PRIMARY KEY,
      mascota_id TEXT NOT NULL,
      dueno_id TEXT NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      duracion INTEGER DEFAULT 30,
      motivo TEXT NOT NULL,
      medico_id TEXT,
      estado TEXT DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada')),
      notas TEXT,
      fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE,
      FOREIGN KEY (dueno_id) REFERENCES duenos(id) ON DELETE CASCADE,
      FOREIGN KEY (medico_id) REFERENCES users(id) ON DELETE SET NULL
    )`);

    // Tabla de historial clínico
    db.run(`CREATE TABLE IF NOT EXISTS historial (
      id TEXT PRIMARY KEY,
      mascota_id TEXT NOT NULL,
      fecha TEXT NOT NULL,
      medico_id TEXT NOT NULL,
      motivo_consulta TEXT NOT NULL,
      sintomas TEXT,
      diagnostico TEXT NOT NULL,
      tratamiento TEXT NOT NULL,
      medicamentos TEXT,
      observaciones TEXT,
      proxima_cita TEXT,
      costo REAL,
      FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE,
      FOREIGN KEY (medico_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Tabla de turnos
    db.run(`CREATE TABLE IF NOT EXISTS turnos (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      fecha TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('mañana', 'tarde', 'noche', 'completo')),
      hora_inicio TEXT NOT NULL,
      hora_fin TEXT NOT NULL,
      notas TEXT,
      FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Tabla de asistencia (registro de entrada/salida del personal)
    db.run(`CREATE TABLE IF NOT EXISTS asistencia (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      fecha TEXT NOT NULL,
      hora_entrada TEXT NOT NULL,
      hora_salida TEXT,
      tipo_registro TEXT DEFAULT 'manual' CHECK(tipo_registro IN ('manual', 'automatico')),
      notas TEXT,
      latitud REAL,
      longitud REAL,
      fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Tabla de pagos/ingresos (registro de cobros)
    db.run(`CREATE TABLE IF NOT EXISTS pagos (
      id TEXT PRIMARY KEY,
      tipo TEXT NOT NULL CHECK(tipo IN ('consulta', 'servicio', 'producto', 'otro')),
      referencia_id TEXT,
      mascota_id TEXT,
      dueno_id TEXT NOT NULL,
      concepto TEXT NOT NULL,
      monto REAL NOT NULL,
      metodo_pago TEXT DEFAULT 'efectivo' CHECK(metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'otro')),
      estado TEXT DEFAULT 'pagado' CHECK(estado IN ('pagado', 'pendiente', 'anulado')),
      fecha_pago TEXT DEFAULT CURRENT_TIMESTAMP,
      registrado_por TEXT,
      notas TEXT,
      FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE SET NULL,
      FOREIGN KEY (dueno_id) REFERENCES duenos(id) ON DELETE CASCADE,
      FOREIGN KEY (registrado_por) REFERENCES users(id) ON DELETE SET NULL
    )`);

    // Tabla de configuración de horarios de trabajo
    db.run(`CREATE TABLE IF NOT EXISTS horarios_config (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      dia_semana INTEGER NOT NULL CHECK(dia_semana BETWEEN 0 AND 6),
      hora_entrada_esperada TEXT NOT NULL,
      hora_salida_esperada TEXT NOT NULL,
      tolerancia_minutos INTEGER DEFAULT 15,
      activo INTEGER DEFAULT 1,
      FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // ========== TABLAS DE FARMACIA ==========
    
    // Tabla de categorías de productos
    db.run(`CREATE TABLE IF NOT EXISTS categorias_productos (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      activo INTEGER DEFAULT 1,
      fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de productos (inventario de farmacia)
    db.run(`CREATE TABLE IF NOT EXISTS productos (
      id TEXT PRIMARY KEY,
      codigo TEXT UNIQUE,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      categoria_id TEXT NOT NULL,
      precio_compra REAL NOT NULL DEFAULT 0,
      precio_venta REAL NOT NULL DEFAULT 0,
      stock_actual INTEGER NOT NULL DEFAULT 0,
      stock_minimo INTEGER NOT NULL DEFAULT 5,
      stock_maximo INTEGER DEFAULT 100,
      unidad_medida TEXT DEFAULT 'unidad',
      proveedor TEXT,
      fecha_vencimiento TEXT,
      requiere_receta INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categorias_productos(id) ON DELETE CASCADE
    )`);

    // Tabla de movimientos de inventario (entradas y salidas)
    db.run(`CREATE TABLE IF NOT EXISTS movimientos_inventario (
      id TEXT PRIMARY KEY,
      producto_id TEXT NOT NULL,
      tipo_movimiento TEXT NOT NULL CHECK(tipo_movimiento IN ('entrada', 'salida', 'ajuste', 'devolucion', 'vencimiento')),
      cantidad INTEGER NOT NULL,
      stock_anterior INTEGER NOT NULL,
      stock_nuevo INTEGER NOT NULL,
      motivo TEXT,
      referencia_id TEXT,
      tipo_referencia TEXT,
      costo_unitario REAL,
      precio_venta_unitario REAL,
      usuario_id TEXT NOT NULL,
      fecha_movimiento TEXT DEFAULT CURRENT_TIMESTAMP,
      notas TEXT,
      FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Tabla de ventas de farmacia
    db.run(`CREATE TABLE IF NOT EXISTS ventas_farmacia (
      id TEXT PRIMARY KEY,
      numero_venta TEXT UNIQUE NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      dueno_id TEXT,
      mascota_id TEXT,
      subtotal REAL NOT NULL DEFAULT 0,
      descuento REAL DEFAULT 0,
      impuesto REAL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      metodo_pago TEXT DEFAULT 'efectivo' CHECK(metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'otro')),
      estado TEXT DEFAULT 'completada' CHECK(estado IN ('completada', 'pendiente', 'cancelada')),
      vendedor_id TEXT NOT NULL,
      turno_id TEXT,
      notas TEXT,
      fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dueno_id) REFERENCES duenos(id) ON DELETE SET NULL,
      FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE SET NULL,
      FOREIGN KEY (vendedor_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE SET NULL
    )`);

    // Tabla de detalle de ventas (items vendidos)
    db.run(`CREATE TABLE IF NOT EXISTS detalle_venta_farmacia (
      id TEXT PRIMARY KEY,
      venta_id TEXT NOT NULL,
      producto_id TEXT NOT NULL,
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      descuento REAL DEFAULT 0,
      subtotal REAL NOT NULL,
      total REAL NOT NULL,
      FOREIGN KEY (venta_id) REFERENCES ventas_farmacia(id) ON DELETE CASCADE,
      FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
    )`);

    // Tabla de turnos de farmacia (control de caja por turno)
    db.run(`CREATE TABLE IF NOT EXISTS turnos_caja (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      fecha_apertura TEXT NOT NULL,
      hora_apertura TEXT NOT NULL,
      monto_apertura REAL NOT NULL DEFAULT 0,
      fecha_cierre TEXT,
      hora_cierre TEXT,
      monto_cierre REAL,
      total_ventas REAL DEFAULT 0,
      total_efectivo REAL DEFAULT 0,
      total_tarjeta REAL DEFAULT 0,
      total_transferencia REAL DEFAULT 0,
      estado TEXT DEFAULT 'abierto' CHECK(estado IN ('abierto', 'cerrado')),
      notas_apertura TEXT,
      notas_cierre TEXT,
      FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    console.log('Tablas creadas/verificadas correctamente');
  });
}

module.exports = {
  db,
  run,
  all,
  get
};
