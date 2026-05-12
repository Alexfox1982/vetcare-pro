const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { run, all, get } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../client/dist')));

// ============================================
// AUTH - Autenticación
// ============================================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await get('SELECT * FROM users WHERE email = ? AND activo = 1', [email]);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    // Comparar contraseñas (en producción usar bcrypt)
    if (password !== user.password) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    res.json({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      telefono: user.telefono
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USUARIOS
// ============================================

// Obtener todos los usuarios
app.get('/api/users', async (req, res) => {
  try {
    const users = await all('SELECT id, nombre, email, rol, telefono, activo, fecha_registro FROM users ORDER BY nombre');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un usuario
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await get('SELECT id, nombre, email, rol, telefono, activo, fecha_registro FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear usuario
app.post('/api/users', async (req, res) => {
  try {
    const { nombre, email, password, rol, telefono, activo } = req.body;
    const id = uuidv4();
    
    await run(
      'INSERT INTO users (id, nombre, email, password, rol, telefono, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, nombre, email, password, rol, telefono || null, activo ? 1 : 0]
    );
    
    const newUser = await get('SELECT id, nombre, email, rol, telefono, activo, fecha_registro FROM users WHERE id = ?', [id]);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar usuario
app.put('/api/users/:id', async (req, res) => {
  try {
    const { nombre, email, password, rol, telefono, activo } = req.body;
    
    let sql = 'UPDATE users SET nombre = ?, email = ?, rol = ?, telefono = ?, activo = ?';
    let params = [nombre, email, rol, telefono || null, activo ? 1 : 0];
    
    if (password) {
      sql += ', password = ?';
      params.push(password);
    }
    
    sql += ' WHERE id = ?';
    params.push(req.params.id);
    
    await run(sql, params);
    
    const updatedUser = await get('SELECT id, nombre, email, rol, telefono, activo, fecha_registro FROM users WHERE id = ?', [req.params.id]);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar usuario
app.delete('/api/users/:id', async (req, res) => {
  try {
    await run('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DUEÑOS
// ============================================

// Obtener todos los dueños
app.get('/api/duenos', async (req, res) => {
  try {
    const duenos = await all('SELECT * FROM duenos ORDER BY apellido, nombre');
    res.json(duenos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un dueño
app.get('/api/duenos/:id', async (req, res) => {
  try {
    const dueno = await get('SELECT * FROM duenos WHERE id = ?', [req.params.id]);
    if (!dueno) return res.status(404).json({ error: 'Dueño no encontrado' });
    res.json(dueno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear dueño
app.post('/api/duenos', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, direccion, notas } = req.body;
    const id = uuidv4();
    
    await run(
      'INSERT INTO duenos (id, nombre, apellido, email, telefono, direccion, notas) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, nombre, apellido, email, telefono, direccion || null, notas || null]
    );
    
    const newDueno = await get('SELECT * FROM duenos WHERE id = ?', [id]);
    res.status(201).json(newDueno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar dueño
app.put('/api/duenos/:id', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, direccion, notas } = req.body;
    
    await run(
      'UPDATE duenos SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ?, notas = ? WHERE id = ?',
      [nombre, apellido, email, telefono, direccion || null, notas || null, req.params.id]
    );
    
    const updatedDueno = await get('SELECT * FROM duenos WHERE id = ?', [req.params.id]);
    res.json(updatedDueno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar dueño
app.delete('/api/duenos/:id', async (req, res) => {
  try {
    await run('DELETE FROM duenos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Dueño eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MASCOTAS
// ============================================

// Obtener todas las mascotas
app.get('/api/mascotas', async (req, res) => {
  try {
    const mascotas = await all('SELECT * FROM mascotas ORDER BY nombre');
    res.json(mascotas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener mascotas por dueño
app.get('/api/mascotas/dueno/:duenoId', async (req, res) => {
  try {
    const mascotas = await all('SELECT * FROM mascotas WHERE dueno_id = ? ORDER BY nombre', [req.params.duenoId]);
    res.json(mascotas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una mascota
app.get('/api/mascotas/:id', async (req, res) => {
  try {
    const mascota = await get('SELECT * FROM mascotas WHERE id = ?', [req.params.id]);
    if (!mascota) return res.status(404).json({ error: 'Mascota no encontrada' });
    res.json(mascota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear mascota
app.post('/api/mascotas', async (req, res) => {
  try {
    const { nombre, especie, raza, fecha_nacimiento, sexo, color, peso, dueno_id, microchip, alergias, notas } = req.body;
    const id = uuidv4();
    
    await run(
      'INSERT INTO mascotas (id, nombre, especie, raza, fecha_nacimiento, sexo, color, peso, dueno_id, microchip, alergias, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, nombre, especie, raza || null, fecha_nacimiento || null, sexo || null, color || null, peso || null, dueno_id, microchip || null, alergias || null, notas || null]
    );
    
    const newMascota = await get('SELECT * FROM mascotas WHERE id = ?', [id]);
    res.status(201).json(newMascota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar mascota
app.put('/api/mascotas/:id', async (req, res) => {
  try {
    const { nombre, especie, raza, fecha_nacimiento, sexo, color, peso, dueno_id, microchip, alergias, notas } = req.body;
    
    await run(
      'UPDATE mascotas SET nombre = ?, especie = ?, raza = ?, fecha_nacimiento = ?, sexo = ?, color = ?, peso = ?, dueno_id = ?, microchip = ?, alergias = ?, notas = ? WHERE id = ?',
      [nombre, especie, raza || null, fecha_nacimiento || null, sexo || null, color || null, peso || null, dueno_id, microchip || null, alergias || null, notas || null, req.params.id]
    );
    
    const updatedMascota = await get('SELECT * FROM mascotas WHERE id = ?', [req.params.id]);
    res.json(updatedMascota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar mascota
app.delete('/api/mascotas/:id', async (req, res) => {
  try {
    await run('DELETE FROM mascotas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Mascota eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CITAS
// ============================================

// Obtener todas las citas
app.get('/api/citas', async (req, res) => {
  try {
    const citas = await all('SELECT * FROM citas ORDER BY fecha DESC, hora DESC');
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener citas por fecha
app.get('/api/citas/fecha/:fecha', async (req, res) => {
  try {
    const citas = await all('SELECT * FROM citas WHERE fecha = ? ORDER BY hora', [req.params.fecha]);
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una cita
app.get('/api/citas/:id', async (req, res) => {
  try {
    const cita = await get('SELECT * FROM citas WHERE id = ?', [req.params.id]);
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(cita);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear cita
app.post('/api/citas', async (req, res) => {
  try {
    const { mascota_id, dueno_id, fecha, hora, duracion, motivo, medico_id, estado, notas } = req.body;
    const id = uuidv4();
    
    await run(
      'INSERT INTO citas (id, mascota_id, dueno_id, fecha, hora, duracion, motivo, medico_id, estado, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, mascota_id, dueno_id, fecha, hora, duracion || 30, motivo, medico_id || null, estado || 'pendiente', notas || null]
    );
    
    const newCita = await get('SELECT * FROM citas WHERE id = ?', [id]);
    res.status(201).json(newCita);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar cita
app.put('/api/citas/:id', async (req, res) => {
  try {
    const { mascota_id, dueno_id, fecha, hora, duracion, motivo, medico_id, estado, notas } = req.body;
    
    await run(
      'UPDATE citas SET mascota_id = ?, dueno_id = ?, fecha = ?, hora = ?, duracion = ?, motivo = ?, medico_id = ?, estado = ?, notas = ? WHERE id = ?',
      [mascota_id, dueno_id, fecha, hora, duracion, motivo, medico_id || null, estado, notas || null, req.params.id]
    );
    
    const updatedCita = await get('SELECT * FROM citas WHERE id = ?', [req.params.id]);
    res.json(updatedCita);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar cita
app.delete('/api/citas/:id', async (req, res) => {
  try {
    await run('DELETE FROM citas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Cita eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HISTORIAL CLINICO
// ============================================

// Obtener todo el historial
app.get('/api/historial', async (req, res) => {
  try {
    const historial = await all('SELECT * FROM historial ORDER BY fecha DESC');
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener historial por mascota
app.get('/api/historial/mascota/:mascotaId', async (req, res) => {
  try {
    const historial = await all('SELECT * FROM historial WHERE mascota_id = ? ORDER BY fecha DESC', [req.params.mascotaId]);
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear historial
app.post('/api/historial', async (req, res) => {
  try {
    const { mascota_id, fecha, medico_id, motivo_consulta, sintomas, diagnostico, tratamiento, medicamentos, observaciones, proxima_cita, costo } = req.body;
    const id = uuidv4();
    
    await run(
      'INSERT INTO historial (id, mascota_id, fecha, medico_id, motivo_consulta, sintomas, diagnostico, tratamiento, medicamentos, observaciones, proxima_cita, costo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, mascota_id, fecha, medico_id, motivo_consulta, sintomas || null, diagnostico, tratamiento, medicamentos || null, observaciones || null, proxima_cita || null, costo || null]
    );
    
    const newHistorial = await get('SELECT * FROM historial WHERE id = ?', [id]);
    res.status(201).json(newHistorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar historial
app.put('/api/historial/:id', async (req, res) => {
  try {
    const { mascota_id, fecha, medico_id, motivo_consulta, sintomas, diagnostico, tratamiento, medicamentos, observaciones, proxima_cita, costo } = req.body;
    
    await run(
      'UPDATE historial SET mascota_id = ?, fecha = ?, medico_id = ?, motivo_consulta = ?, sintomas = ?, diagnostico = ?, tratamiento = ?, medicamentos = ?, observaciones = ?, proxima_cita = ?, costo = ? WHERE id = ?',
      [mascota_id, fecha, medico_id, motivo_consulta, sintomas || null, diagnostico, tratamiento, medicamentos || null, observaciones || null, proxima_cita || null, costo || null, req.params.id]
    );
    
    const updatedHistorial = await get('SELECT * FROM historial WHERE id = ?', [req.params.id]);
    res.json(updatedHistorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar historial
app.delete('/api/historial/:id', async (req, res) => {
  try {
    await run('DELETE FROM historial WHERE id = ?', [req.params.id]);
    res.json({ message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// TURNOS
// ============================================

// Obtener todos los turnos
app.get('/api/turnos', async (req, res) => {
  try {
    const turnos = await all('SELECT * FROM turnos ORDER BY fecha DESC, hora_inicio');
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener turnos por fecha
app.get('/api/turnos/fecha/:fecha', async (req, res) => {
  try {
    const turnos = await all('SELECT * FROM turnos WHERE fecha = ? ORDER BY hora_inicio', [req.params.fecha]);
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear turno
app.post('/api/turnos', async (req, res) => {
  try {
    const { usuario_id, fecha, tipo, hora_inicio, hora_fin, notas } = req.body;
    const id = uuidv4();
    
    await run(
      'INSERT INTO turnos (id, usuario_id, fecha, tipo, hora_inicio, hora_fin, notas) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, usuario_id, fecha, tipo, hora_inicio, hora_fin, notas || null]
    );
    
    const newTurno = await get('SELECT * FROM turnos WHERE id = ?', [id]);
    res.status(201).json(newTurno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar turno
app.put('/api/turnos/:id', async (req, res) => {
  try {
    const { usuario_id, fecha, tipo, hora_inicio, hora_fin, notas } = req.body;
    
    await run(
      'UPDATE turnos SET usuario_id = ?, fecha = ?, tipo = ?, hora_inicio = ?, hora_fin = ?, notas = ? WHERE id = ?',
      [usuario_id, fecha, tipo, hora_inicio, hora_fin, notas || null, req.params.id]
    );
    
    const updatedTurno = await get('SELECT * FROM turnos WHERE id = ?', [req.params.id]);
    res.json(updatedTurno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar turno
app.delete('/api/turnos/:id', async (req, res) => {
  try {
    await run('DELETE FROM turnos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Turno eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ASISTENCIA (Registro de entrada/salida)
// ============================================

// Obtener todos los registros de asistencia
app.get('/api/asistencia', async (req, res) => {
  try {
    const registros = await all(`
      SELECT a.*, u.nombre as usuario_nombre, u.rol as usuario_rol 
      FROM asistencia a 
      JOIN users u ON a.usuario_id = u.id 
      ORDER BY a.fecha DESC, a.hora_entrada DESC
    `);
    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener asistencia por usuario
app.get('/api/asistencia/usuario/:usuarioId', async (req, res) => {
  try {
    const registros = await all(`
      SELECT a.*, u.nombre as usuario_nombre 
      FROM asistencia a 
      JOIN users u ON a.usuario_id = u.id 
      WHERE a.usuario_id = ? 
      ORDER BY a.fecha DESC, a.hora_entrada DESC
    `, [req.params.usuarioId]);
    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener asistencia por fecha
app.get('/api/asistencia/fecha/:fecha', async (req, res) => {
  try {
    const registros = await all(`
      SELECT a.*, u.nombre as usuario_nombre, u.rol as usuario_rol 
      FROM asistencia a 
      JOIN users u ON a.usuario_id = u.id 
      WHERE a.fecha = ? 
      ORDER BY a.hora_entrada
    `, [req.params.fecha]);
    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar entrada
app.post('/api/asistencia/entrada', async (req, res) => {
  try {
    const { usuario_id, fecha, hora_entrada, tipo_registro, notas, latitud, longitud } = req.body;
    const id = uuidv4();
    
    // Verificar si ya hay una entrada sin salida
    const entradaAbierta = await get(
      'SELECT * FROM asistencia WHERE usuario_id = ? AND fecha = ? AND hora_salida IS NULL',
      [usuario_id, fecha]
    );
    
    if (entradaAbierta) {
      return res.status(400).json({ error: 'Ya existe una entrada sin cerrar para este usuario' });
    }
    
    await run(
      'INSERT INTO asistencia (id, usuario_id, fecha, hora_entrada, tipo_registro, notas, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, usuario_id, fecha, hora_entrada, tipo_registro || 'manual', notas || null, latitud || null, longitud || null]
    );
    
    const newRegistro = await get(`
      SELECT a.*, u.nombre as usuario_nombre 
      FROM asistencia a 
      JOIN users u ON a.usuario_id = u.id 
      WHERE a.id = ?
    `, [id]);
    
    res.status(201).json(newRegistro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar salida
app.put('/api/asistencia/:id/salida', async (req, res) => {
  try {
    const { hora_salida, notas } = req.body;
    
    await run(
      'UPDATE asistencia SET hora_salida = ?, notas = COALESCE(?, notas) WHERE id = ?',
      [hora_salida, notas, req.params.id]
    );
    
    const updatedRegistro = await get(`
      SELECT a.*, u.nombre as usuario_nombre 
      FROM asistencia a 
      JOIN users u ON a.usuario_id = u.id 
      WHERE a.id = ?
    `, [req.params.id]);
    
    res.json(updatedRegistro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener asistencia actual (entrada sin salida)
app.get('/api/asistencia/actual/:usuarioId', async (req, res) => {
  try {
    const registro = await get(`
      SELECT a.*, u.nombre as usuario_nombre 
      FROM asistencia a 
      JOIN users u ON a.usuario_id = u.id 
      WHERE a.usuario_id = ? AND a.hora_salida IS NULL 
      ORDER BY a.fecha DESC, a.hora_entrada DESC 
      LIMIT 1
    `, [req.params.usuarioId]);
    
    res.json(registro || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar registro de asistencia
app.delete('/api/asistencia/:id', async (req, res) => {
  try {
    await run('DELETE FROM asistencia WHERE id = ?', [req.params.id]);
    res.json({ message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PAGOS/INGRESOS
// ============================================

// Obtener todos los pagos
app.get('/api/pagos', async (req, res) => {
  try {
    const pagos = await all(`
      SELECT p.*, m.nombre as mascota_nombre, d.nombre as dueno_nombre, d.apellido as dueno_apellido, u.nombre as registrado_por_nombre
      FROM pagos p
      LEFT JOIN mascotas m ON p.mascota_id = m.id
      JOIN duenos d ON p.dueno_id = d.id
      LEFT JOIN users u ON p.registrado_por = u.id
      ORDER BY p.fecha_pago DESC
    `);
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener pagos por fecha
app.get('/api/pagos/fecha/:fecha', async (req, res) => {
  try {
    const pagos = await all(`
      SELECT p.*, m.nombre as mascota_nombre, d.nombre as dueno_nombre, d.apellido as dueno_apellido
      FROM pagos p
      LEFT JOIN mascotas m ON p.mascota_id = m.id
      JOIN duenos d ON p.dueno_id = d.id
      WHERE date(p.fecha_pago) = ?
      ORDER BY p.fecha_pago DESC
    `, [req.params.fecha]);
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener pagos por rango de fechas
app.get('/api/pagos/rango/:fechaInicio/:fechaFin', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.params;
    const pagos = await all(`
      SELECT p.*, m.nombre as mascota_nombre, d.nombre as dueno_nombre, d.apellido as dueno_apellido
      FROM pagos p
      LEFT JOIN mascotas m ON p.mascota_id = m.id
      JOIN duenos d ON p.dueno_id = d.id
      WHERE date(p.fecha_pago) BETWEEN ? AND ?
      ORDER BY p.fecha_pago DESC
    `, [fechaInicio, fechaFin]);
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear pago
app.post('/api/pagos', async (req, res) => {
  try {
    const { tipo, referencia_id, mascota_id, dueno_id, concepto, monto, metodo_pago, estado, registrado_por, notas } = req.body;
    const id = uuidv4();
    
    await run(
      'INSERT INTO pagos (id, tipo, referencia_id, mascota_id, dueno_id, concepto, monto, metodo_pago, estado, registrado_por, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, tipo, referencia_id || null, mascota_id || null, dueno_id, concepto, monto, metodo_pago || 'efectivo', estado || 'pagado', registrado_por || null, notas || null]
    );
    
    const newPago = await get(`
      SELECT p.*, m.nombre as mascota_nombre, d.nombre as dueno_nombre, d.apellido as dueno_apellido
      FROM pagos p
      LEFT JOIN mascotas m ON p.mascota_id = m.id
      JOIN duenos d ON p.dueno_id = d.id
      WHERE p.id = ?
    `, [id]);
    
    res.status(201).json(newPago);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar pago
app.put('/api/pagos/:id', async (req, res) => {
  try {
    const { tipo, referencia_id, mascota_id, dueno_id, concepto, monto, metodo_pago, estado, notas } = req.body;
    
    await run(
      'UPDATE pagos SET tipo = ?, referencia_id = ?, mascota_id = ?, dueno_id = ?, concepto = ?, monto = ?, metodo_pago = ?, estado = ?, notas = ? WHERE id = ?',
      [tipo, referencia_id || null, mascota_id || null, dueno_id, concepto, monto, metodo_pago, estado, notas || null, req.params.id]
    );
    
    const updatedPago = await get(`
      SELECT p.*, m.nombre as mascota_nombre, d.nombre as dueno_nombre, d.apellido as dueno_apellido
      FROM pagos p
      LEFT JOIN mascotas m ON p.mascota_id = m.id
      JOIN duenos d ON p.dueno_id = d.id
      WHERE p.id = ?
    `, [req.params.id]);
    
    res.json(updatedPago);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar pago
app.delete('/api/pagos/:id', async (req, res) => {
  try {
    await run('DELETE FROM pagos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Pago eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// REPORTES FINANCIEROS
// ============================================

// Reporte diario de ingresos
app.get('/api/reportes/financiero/diario/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;
    
    // Totales por método de pago
    const porMetodo = await all(`
      SELECT metodo_pago, COUNT(*) as cantidad, SUM(monto) as total
      FROM pagos
      WHERE date(fecha_pago) = ? AND estado = 'pagado'
      GROUP BY metodo_pago
    `, [fecha]);
    
    // Totales por tipo
    const porTipo = await all(`
      SELECT tipo, COUNT(*) as cantidad, SUM(monto) as total
      FROM pagos
      WHERE date(fecha_pago) = ? AND estado = 'pagado'
      GROUP BY tipo
    `, [fecha]);
    
    // Total general
    const total = await get(`
      SELECT COUNT(*) as cantidad_total, SUM(monto) as monto_total
      FROM pagos
      WHERE date(fecha_pago) = ? AND estado = 'pagado'
    `, [fecha]);
    
    // Detalle de transacciones
    const detalle = await all(`
      SELECT p.*, m.nombre as mascota_nombre, d.nombre as dueno_nombre, d.apellido as dueno_apellido
      FROM pagos p
      LEFT JOIN mascotas m ON p.mascota_id = m.id
      JOIN duenos d ON p.dueno_id = d.id
      WHERE date(p.fecha_pago) = ? AND p.estado = 'pagado'
      ORDER BY p.fecha_pago DESC
    `, [fecha]);
    
    res.json({
      fecha,
      resumen: {
        cantidad_total: total?.cantidad_total || 0,
        monto_total: total?.monto_total || 0
      },
      por_metodo_pago: porMetodo,
      por_tipo: porTipo,
      transacciones: detalle
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporte semanal de ingresos
app.get('/api/reportes/financiero/semanal/:fechaInicio', async (req, res) => {
  try {
    const { fechaInicio } = req.params;
    
    // Calcular fecha fin (7 días después)
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + 6);
    const fechaFinStr = fechaFin.toISOString().split('T')[0];
    
    // Totales por día
    const porDia = await all(`
      SELECT date(fecha_pago) as fecha, COUNT(*) as cantidad, SUM(monto) as total
      FROM pagos
      WHERE date(fecha_pago) BETWEEN ? AND ? AND estado = 'pagado'
      GROUP BY date(fecha_pago)
      ORDER BY fecha
    `, [fechaInicio, fechaFinStr]);
    
    // Totales por método de pago
    const porMetodo = await all(`
      SELECT metodo_pago, COUNT(*) as cantidad, SUM(monto) as total
      FROM pagos
      WHERE date(fecha_pago) BETWEEN ? AND ? AND estado = 'pagado'
      GROUP BY metodo_pago
    `, [fechaInicio, fechaFinStr]);
    
    // Total general
    const total = await get(`
      SELECT COUNT(*) as cantidad_total, SUM(monto) as monto_total
      FROM pagos
      WHERE date(fecha_pago) BETWEEN ? AND ? AND estado = 'pagado'
    `, [fechaInicio, fechaFinStr]);
    
    res.json({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFinStr,
      resumen: {
        cantidad_total: total?.cantidad_total || 0,
        monto_total: total?.monto_total || 0
      },
      por_dia: porDia,
      por_metodo_pago: porMetodo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporte mensual de ingresos
app.get('/api/reportes/financiero/mensual/:anio/:mes', async (req, res) => {
  try {
    const { anio, mes } = req.params;
    
    // Totales por día
    const porDia = await all(`
      SELECT date(fecha_pago) as fecha, COUNT(*) as cantidad, SUM(monto) as total
      FROM pagos
      WHERE strftime('%Y', fecha_pago) = ? AND strftime('%m', fecha_pago) = ? AND estado = 'pagado'
      GROUP BY date(fecha_pago)
      ORDER BY fecha
    `, [anio, mes.padStart(2, '0')]);
    
    // Totales por método de pago
    const porMetodo = await all(`
      SELECT metodo_pago, COUNT(*) as cantidad, SUM(monto) as total
      FROM pagos
      WHERE strftime('%Y', fecha_pago) = ? AND strftime('%m', fecha_pago) = ? AND estado = 'pagado'
      GROUP BY metodo_pago
    `, [anio, mes.padStart(2, '0')]);
    
    // Totales por tipo
    const porTipo = await all(`
      SELECT tipo, COUNT(*) as cantidad, SUM(monto) as total
      FROM pagos
      WHERE strftime('%Y', fecha_pago) = ? AND strftime('%m', fecha_pago) = ? AND estado = 'pagado'
      GROUP BY tipo
    `, [anio, mes.padStart(2, '0')]);
    
    // Total general
    const total = await get(`
      SELECT COUNT(*) as cantidad_total, SUM(monto) as monto_total
      FROM pagos
      WHERE strftime('%Y', fecha_pago) = ? AND strftime('%m', fecha_pago) = ? AND estado = 'pagado'
    `, [anio, mes.padStart(2, '0')]);
    
    res.json({
      anio,
      mes,
      resumen: {
        cantidad_total: total?.cantidad_total || 0,
        monto_total: total?.monto_total || 0
      },
      por_dia: porDia,
      por_metodo_pago: porMetodo,
      por_tipo: porTipo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// REPORTES DE ASISTENCIA/RETRASOS
// ============================================

// Reporte de asistencia por período
app.get('/api/reportes/asistencia/:fechaInicio/:fechaFin', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.params;
    
    const registros = await all(`
      SELECT 
        a.*, 
        u.nombre as usuario_nombre, 
        u.rol as usuario_rol,
        CASE 
          WHEN h.hora_entrada_esperada IS NOT NULL AND a.hora_entrada > h.hora_entrada_esperada 
          THEN 'retraso' 
          ELSE 'a_tiempo' 
        END as estado_asistencia,
        CASE 
          WHEN h.hora_entrada_esperada IS NOT NULL 
          THEN (julianday(a.hora_entrada) - julianday(h.hora_entrada_esperada)) * 24 * 60
          ELSE 0 
        END as minutos_retraso
      FROM asistencia a
      JOIN users u ON a.usuario_id = u.id
      LEFT JOIN horarios_config h ON a.usuario_id = h.usuario_id 
        AND h.dia_semana = CAST(strftime('%w', a.fecha) AS INTEGER)
        AND h.activo = 1
      WHERE a.fecha BETWEEN ? AND ?
      ORDER BY a.fecha DESC, a.hora_entrada DESC
    `, [fechaInicio, fechaFin]);
    
    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporte de retrasos por usuario
app.get('/api/reportes/retrasos/:fechaInicio/:fechaFin', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.params;
    
    const retrasos = await all(`
      SELECT 
        u.id as usuario_id,
        u.nombre as usuario_nombre,
        u.rol as usuario_rol,
        COUNT(*) as total_dias,
        SUM(CASE WHEN a.hora_entrada > h.hora_entrada_esperada THEN 1 ELSE 0 END) as dias_con_retraso,
        AVG(CASE 
          WHEN a.hora_entrada > h.hora_entrada_esperada 
          THEN (julianday(a.hora_entrada) - julianday(h.hora_entrada_esperada)) * 24 * 60
          ELSE 0 
        END) as promedio_minutos_retraso,
        MAX(CASE 
          WHEN a.hora_entrada > h.hora_entrada_esperada 
          THEN (julianday(a.hora_entrada) - julianday(h.hora_entrada_esperada)) * 24 * 60
          ELSE 0 
        END) as maximo_minutos_retraso
      FROM asistencia a
      JOIN users u ON a.usuario_id = u.id
      LEFT JOIN horarios_config h ON a.usuario_id = h.usuario_id 
        AND h.dia_semana = CAST(strftime('%w', a.fecha) AS INTEGER)
        AND h.activo = 1
      WHERE a.fecha BETWEEN ? AND ? AND h.hora_entrada_esperada IS NOT NULL
      GROUP BY u.id, u.nombre, u.rol
      ORDER BY dias_con_retraso DESC
    `, [fechaInicio, fechaFin]);
    
    res.json(retrasos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resumen de asistencia por usuario
app.get('/api/reportes/asistencia/resumen/:usuarioId/:fechaInicio/:fechaFin', async (req, res) => {
  try {
    const { usuarioId, fechaInicio, fechaFin } = req.params;
    
    const resumen = await get(`
      SELECT 
        u.id as usuario_id,
        u.nombre as usuario_nombre,
        COUNT(*) as total_registros,
        SUM(CASE WHEN a.hora_salida IS NOT NULL THEN 1 ELSE 0 END) as registros_completos,
        AVG(CASE 
          WHEN a.hora_salida IS NOT NULL 
          THEN (julianday(a.hora_salida) - julianday(a.hora_entrada)) * 24 
          ELSE NULL 
        END) as promedio_horas_trabajadas,
        SUM(CASE 
          WHEN h.hora_entrada_esperada IS NOT NULL AND a.hora_entrada > h.hora_entrada_esperada 
          THEN 1 
          ELSE 0 
        END) as total_retrasos
      FROM asistencia a
      JOIN users u ON a.usuario_id = u.id
      LEFT JOIN horarios_config h ON a.usuario_id = h.usuario_id 
        AND h.dia_semana = CAST(strftime('%w', a.fecha) AS INTEGER)
        AND h.activo = 1
      WHERE a.usuario_id = ? AND a.fecha BETWEEN ? AND ?
      GROUP BY u.id, u.nombre
    `, [usuarioId, fechaInicio, fechaFin]);
    
    res.json(resumen || {
      usuario_id: usuarioId,
      total_registros: 0,
      registros_completos: 0,
      promedio_horas_trabajadas: 0,
      total_retrasos: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CONFIGURACIÓN DE HORARIOS
// ============================================

// Obtener horarios de un usuario
app.get('/api/horarios-config/:usuarioId', async (req, res) => {
  try {
    const horarios = await all(`
      SELECT * FROM horarios_config 
      WHERE usuario_id = ? AND activo = 1 
      ORDER BY dia_semana
    `, [req.params.usuarioId]);
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear/actualizar horario
app.post('/api/horarios-config', async (req, res) => {
  try {
    const { usuario_id, dia_semana, hora_entrada_esperada, hora_salida_esperada, tolerancia_minutos } = req.body;
    const id = uuidv4();
    
    // Desactivar horario anterior si existe
    await run(
      'UPDATE horarios_config SET activo = 0 WHERE usuario_id = ? AND dia_semana = ?',
      [usuario_id, dia_semana]
    );
    
    await run(
      'INSERT INTO horarios_config (id, usuario_id, dia_semana, hora_entrada_esperada, hora_salida_esperada, tolerancia_minutos) VALUES (?, ?, ?, ?, ?, ?)',
      [id, usuario_id, dia_semana, hora_entrada_esperada, hora_salida_esperada, tolerancia_minutos || 15]
    );
    
    const newHorario = await get('SELECT * FROM horarios_config WHERE id = ?', [id]);
    res.status(201).json(newHorario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar horario
app.delete('/api/horarios-config/:id', async (req, res) => {
  try {
    await run('UPDATE horarios_config SET activo = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Horario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FARMACIA - CATEGORIAS
// ============================================

// Obtener todas las categorías
app.get('/api/farmacia/categorias', async (req, res) => {
  try {
    const categorias = await all('SELECT * FROM categorias_productos WHERE activo = 1 ORDER BY nombre');
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear categoría
app.post('/api/farmacia/categorias', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const id = uuidv4();
    
    await run(
      'INSERT INTO categorias_productos (id, nombre, descripcion) VALUES (?, ?, ?)',
      [id, nombre, descripcion || null]
    );
    
    const newCategoria = await get('SELECT * FROM categorias_productos WHERE id = ?', [id]);
    res.status(201).json(newCategoria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar categoría
app.put('/api/farmacia/categorias/:id', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    await run(
      'UPDATE categorias_productos SET nombre = ?, descripcion = ? WHERE id = ?',
      [nombre, descripcion || null, req.params.id]
    );
    
    const updatedCategoria = await get('SELECT * FROM categorias_productos WHERE id = ?', [req.params.id]);
    res.json(updatedCategoria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar categoría
app.delete('/api/farmacia/categorias/:id', async (req, res) => {
  try {
    await run('UPDATE categorias_productos SET activo = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FARMACIA - PRODUCTOS
// ============================================

// Obtener todos los productos
app.get('/api/farmacia/productos', async (req, res) => {
  try {
    const productos = await all(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p 
      LEFT JOIN categorias_productos c ON p.categoria_id = c.id 
      WHERE p.activo = 1 
      ORDER BY p.nombre
    `);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener productos con stock bajo
app.get('/api/farmacia/productos/stock-bajo', async (req, res) => {
  try {
    const productos = await all(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p 
      LEFT JOIN categorias_productos c ON p.categoria_id = c.id 
      WHERE p.activo = 1 AND p.stock_actual <= p.stock_minimo
      ORDER BY p.stock_actual ASC
    `);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar productos
app.get('/api/farmacia/productos/buscar/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const productos = await all(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p 
      LEFT JOIN categorias_productos c ON p.categoria_id = c.id 
      WHERE p.activo = 1 AND (p.nombre LIKE ? OR p.codigo LIKE ? OR p.descripcion LIKE ?)
      ORDER BY p.nombre
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un producto
app.get('/api/farmacia/productos/:id', async (req, res) => {
  try {
    const producto = await get(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p 
      LEFT JOIN categorias_productos c ON p.categoria_id = c.id 
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear producto
app.post('/api/farmacia/productos', async (req, res) => {
  try {
    const { 
      codigo, nombre, descripcion, categoria_id, 
      precio_compra, precio_venta, stock_actual, stock_minimo, stock_maximo,
      unidad_medida, proveedor, fecha_vencimiento, requiere_receta 
    } = req.body;
    
    const id = uuidv4();
    
    await run(`
      INSERT INTO productos (
        id, codigo, nombre, descripcion, categoria_id, 
        precio_compra, precio_venta, stock_actual, stock_minimo, stock_maximo,
        unidad_medida, proveedor, fecha_vencimiento, requiere_receta
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, codigo || null, nombre, descripcion || null, categoria_id,
      precio_compra || 0, precio_venta || 0, stock_actual || 0, stock_minimo || 5, stock_maximo || 100,
      unidad_medida || 'unidad', proveedor || null, fecha_vencimiento || null, requiere_receta ? 1 : 0
    ]);
    
    // Registrar movimiento de entrada inicial
    if (stock_actual > 0) {
      await run(`
        INSERT INTO movimientos_inventario (
          id, producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo,
          motivo, usuario_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(), id, 'entrada', stock_actual, 0, stock_actual,
        'Stock inicial', req.body.usuario_id || 'system'
      ]);
    }
    
    const newProducto = await get(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p 
      LEFT JOIN categorias_productos c ON p.categoria_id = c.id 
      WHERE p.id = ?
    `, [id]);
    
    res.status(201).json(newProducto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar producto
app.put('/api/farmacia/productos/:id', async (req, res) => {
  try {
    const { 
      codigo, nombre, descripcion, categoria_id, 
      precio_compra, precio_venta, stock_minimo, stock_maximo,
      unidad_medida, proveedor, fecha_vencimiento, requiere_receta 
    } = req.body;
    
    await run(`
      UPDATE productos SET 
        codigo = ?, nombre = ?, descripcion = ?, categoria_id = ?,
        precio_compra = ?, precio_venta = ?, stock_minimo = ?, stock_maximo = ?,
        unidad_medida = ?, proveedor = ?, fecha_vencimiento = ?, requiere_receta = ?,
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      codigo || null, nombre, descripcion || null, categoria_id,
      precio_compra || 0, precio_venta || 0, stock_minimo || 5, stock_maximo || 100,
      unidad_medida || 'unidad', proveedor || null, fecha_vencimiento || null, 
      requiere_receta ? 1 : 0, req.params.id
    ]);
    
    const updatedProducto = await get(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p 
      LEFT JOIN categorias_productos c ON p.categoria_id = c.id 
      WHERE p.id = ?
    `, [req.params.id]);
    
    res.json(updatedProducto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajustar stock de producto
app.post('/api/farmacia/productos/:id/ajustar-stock', async (req, res) => {
  try {
    const { cantidad, motivo, usuario_id } = req.body;
    const productoId = req.params.id;
    
    // Obtener stock actual
    const producto = await get('SELECT stock_actual FROM productos WHERE id = ?', [productoId]);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    
    const stockAnterior = producto.stock_actual;
    const stockNuevo = stockAnterior + cantidad;
    
    if (stockNuevo < 0) {
      return res.status(400).json({ error: 'El stock no puede ser negativo' });
    }
    
    // Actualizar stock
    await run(
      'UPDATE productos SET stock_actual = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?',
      [stockNuevo, productoId]
    );
    
    // Registrar movimiento
    const tipoMovimiento = cantidad > 0 ? 'entrada' : 'salida';
    await run(`
      INSERT INTO movimientos_inventario (
        id, producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo,
        motivo, usuario_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(), productoId, tipoMovimiento, Math.abs(cantidad), stockAnterior, stockNuevo,
      motivo || 'Ajuste de stock', usuario_id
    ]);
    
    const updatedProducto = await get(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p 
      LEFT JOIN categorias_productos c ON p.categoria_id = c.id 
      WHERE p.id = ?
    `, [productoId]);
    
    res.json(updatedProducto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar producto
app.delete('/api/farmacia/productos/:id', async (req, res) => {
  try {
    await run('UPDATE productos SET activo = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FARMACIA - MOVIMIENTOS DE INVENTARIO
// ============================================

// Obtener movimientos de un producto
app.get('/api/farmacia/movimientos/producto/:productoId', async (req, res) => {
  try {
    const movimientos = await all(`
      SELECT m.*, p.nombre as producto_nombre, u.nombre as usuario_nombre
      FROM movimientos_inventario m
      JOIN productos p ON m.producto_id = p.id
      JOIN users u ON m.usuario_id = u.id
      WHERE m.producto_id = ?
      ORDER BY m.fecha_movimiento DESC
    `, [req.params.productoId]);
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los movimientos
app.get('/api/farmacia/movimientos', async (req, res) => {
  try {
    const movimientos = await all(`
      SELECT m.*, p.nombre as producto_nombre, u.nombre as usuario_nombre
      FROM movimientos_inventario m
      JOIN productos p ON m.producto_id = p.id
      JOIN users u ON m.usuario_id = u.id
      ORDER BY m.fecha_movimiento DESC
      LIMIT 100
    `);
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FARMACIA - VENTAS
// ============================================

// Obtener todas las ventas
app.get('/api/farmacia/ventas', async (req, res) => {
  try {
    const ventas = await all(`
      SELECT v.*, d.nombre as dueno_nombre, d.apellido as dueno_apellido,
             m.nombre as mascota_nombre, u.nombre as vendedor_nombre
      FROM ventas_farmacia v
      LEFT JOIN duenos d ON v.dueno_id = d.id
      LEFT JOIN mascotas m ON v.mascota_id = m.id
      JOIN users u ON v.vendedor_id = u.id
      ORDER BY v.fecha DESC, v.hora DESC
    `);
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener ventas por fecha
app.get('/api/farmacia/ventas/fecha/:fecha', async (req, res) => {
  try {
    const ventas = await all(`
      SELECT v.*, d.nombre as dueno_nombre, d.apellido as dueno_apellido,
             m.nombre as mascota_nombre, u.nombre as vendedor_nombre
      FROM ventas_farmacia v
      LEFT JOIN duenos d ON v.dueno_id = d.id
      LEFT JOIN mascotas m ON v.mascota_id = m.id
      JOIN users u ON v.vendedor_id = u.id
      WHERE v.fecha = ?
      ORDER BY v.hora DESC
    `, [req.params.fecha]);
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una venta con detalle
app.get('/api/farmacia/ventas/:id', async (req, res) => {
  try {
    const venta = await get(`
      SELECT v.*, d.nombre as dueno_nombre, d.apellido as dueno_apellido,
             m.nombre as mascota_nombre, u.nombre as vendedor_nombre
      FROM ventas_farmacia v
      LEFT JOIN duenos d ON v.dueno_id = d.id
      LEFT JOIN mascotas m ON v.mascota_id = m.id
      JOIN users u ON v.vendedor_id = u.id
      WHERE v.id = ?
    `, [req.params.id]);
    
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    
    const detalle = await all(`
      SELECT d.*, p.nombre as producto_nombre, p.codigo as producto_codigo
      FROM detalle_venta_farmacia d
      JOIN productos p ON d.producto_id = p.id
      WHERE d.venta_id = ?
    `, [req.params.id]);
    
    res.json({ ...venta, detalle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear venta
app.post('/api/farmacia/ventas', async (req, res) => {
  const db = require('./database').db;
  
  try {
    const {
      dueno_id, mascota_id, items, subtotal, descuento, impuesto, total,
      metodo_pago, vendedor_id, turno_id, notas
    } = req.body;
    
    // Generar número de venta
    const fecha = new Date();
    const numeroVenta = `VF${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
    
    const ventaId = uuidv4();
    const fechaStr = fecha.toISOString().split('T')[0];
    const horaStr = fecha.toTimeString().slice(0, 5);
    
    // Iniciar transacción
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    try {
      // Crear venta
      await run(`
        INSERT INTO ventas_farmacia (
          id, numero_venta, fecha, hora, dueno_id, mascota_id,
          subtotal, descuento, impuesto, total, metodo_pago, vendedor_id, turno_id, notas
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        ventaId, numeroVenta, fechaStr, horaStr, dueno_id || null, mascota_id || null,
        subtotal, descuento || 0, impuesto || 0, total, metodo_pago || 'efectivo',
        vendedor_id, turno_id || null, notas || null
      ]);
      
      // Crear detalle y actualizar stock
      for (const item of items) {
        const detalleId = uuidv4();
        
        // Insertar detalle
        await run(`
          INSERT INTO detalle_venta_farmacia (
            id, venta_id, producto_id, cantidad, precio_unitario, descuento, subtotal, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          detalleId, ventaId, item.producto_id, item.cantidad, item.precio_unitario,
          item.descuento || 0, item.subtotal, item.total
        ]);
        
        // Obtener stock actual
        const producto = await get('SELECT stock_actual, precio_compra FROM productos WHERE id = ?', [item.producto_id]);
        const stockAnterior = producto.stock_actual;
        const stockNuevo = stockAnterior - item.cantidad;
        
        // Actualizar stock
        await run(
          'UPDATE productos SET stock_actual = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?',
          [stockNuevo, item.producto_id]
        );
        
        // Registrar movimiento de salida
        await run(`
          INSERT INTO movimientos_inventario (
            id, producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo,
            motivo, referencia_id, tipo_referencia, costo_unitario, precio_venta_unitario, usuario_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(), item.producto_id, 'salida', item.cantidad, stockAnterior, stockNuevo,
          'Venta de farmacia', ventaId, 'venta_farmacia', producto.precio_compra,
          item.precio_unitario, vendedor_id
        ]);
      }
      
      // Commit
      await new Promise((resolve, reject) => {
        db.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Obtener venta completa
      const newVenta = await get(`
        SELECT v.*, d.nombre as dueno_nombre, d.apellido as dueno_apellido,
               m.nombre as mascota_nombre, u.nombre as vendedor_nombre
        FROM ventas_farmacia v
        LEFT JOIN duenos d ON v.dueno_id = d.id
        LEFT JOIN mascotas m ON v.mascota_id = m.id
        JOIN users u ON v.vendedor_id = u.id
        WHERE v.id = ?
      `, [ventaId]);
      
      const detalle = await all(`
        SELECT d.*, p.nombre as producto_nombre, p.codigo as producto_codigo
        FROM detalle_venta_farmacia d
        JOIN productos p ON d.producto_id = p.id
        WHERE d.venta_id = ?
      `, [ventaId]);
      
      res.status(201).json({ ...newVenta, detalle });
    } catch (error) {
      // Rollback
      await new Promise((resolve) => {
        db.run('ROLLBACK', () => resolve());
      });
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancelar venta
app.put('/api/farmacia/ventas/:id/cancelar', async (req, res) => {
  const db = require('./database').db;
  
  try {
    const { motivo, usuario_id } = req.body;
    
    // Iniciar transacción
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    try {
      // Obtener detalle de la venta
      const detalle = await all('SELECT * FROM detalle_venta_farmacia WHERE venta_id = ?', [req.params.id]);
      
      // Revertir stock
      for (const item of detalle) {
        const producto = await get('SELECT stock_actual FROM productos WHERE id = ?', [item.producto_id]);
        const stockAnterior = producto.stock_actual;
        const stockNuevo = stockAnterior + item.cantidad;
        
        // Actualizar stock
        await run(
          'UPDATE productos SET stock_actual = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?',
          [stockNuevo, item.producto_id]
        );
        
        // Registrar movimiento de devolución
        await run(`
          INSERT INTO movimientos_inventario (
            id, producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo,
            motivo, referencia_id, tipo_referencia, usuario_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(), item.producto_id, 'devolucion', item.cantidad, stockAnterior, stockNuevo,
          `Cancelación de venta: ${motivo || 'Sin motivo'}`, req.params.id, 'venta_cancelada', usuario_id
        ]);
      }
      
      // Actualizar estado de venta
      await run(
        "UPDATE ventas_farmacia SET estado = 'cancelada', notas = COALESCE(notas || ' | ', '') || ? WHERE id = ?",
        [`CANCELADA: ${motivo || 'Sin motivo'}`, req.params.id]
      );
      
      // Commit
      await new Promise((resolve, reject) => {
        db.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      res.json({ message: 'Venta cancelada correctamente' });
    } catch (error) {
      // Rollback
      await new Promise((resolve) => {
        db.run('ROLLBACK', () => resolve());
      });
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FARMACIA - TURNOS DE CAJA
// ============================================

// Obtener turnos de caja
app.get('/api/farmacia/turnos-caja', async (req, res) => {
  try {
    const turnos = await all(`
      SELECT t.*, u.nombre as usuario_nombre
      FROM turnos_caja t
      JOIN users u ON t.usuario_id = u.id
      ORDER BY t.fecha_apertura DESC, t.hora_apertura DESC
    `);
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener turno abierto de un usuario
app.get('/api/farmacia/turnos-caja/abierto/:usuarioId', async (req, res) => {
  try {
    const turno = await get(`
      SELECT t.*, u.nombre as usuario_nombre
      FROM turnos_caja t
      JOIN users u ON t.usuario_id = u.id
      WHERE t.usuario_id = ? AND t.estado = 'abierto'
    `, [req.params.usuarioId]);
    
    res.json(turno || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Abrir turno de caja
app.post('/api/farmacia/turnos-caja/abrir', async (req, res) => {
  try {
    const { usuario_id, monto_apertura, notas_apertura } = req.body;
    
    // Verificar si ya hay un turno abierto
    const turnoAbierto = await get(
      "SELECT * FROM turnos_caja WHERE usuario_id = ? AND estado = 'abierto'",
      [usuario_id]
    );
    
    if (turnoAbierto) {
      return res.status(400).json({ error: 'Ya existe un turno abierto para este usuario' });
    }
    
    const id = uuidv4();
    const fecha = new Date();
    const fechaStr = fecha.toISOString().split('T')[0];
    const horaStr = fecha.toTimeString().slice(0, 5);
    
    await run(`
      INSERT INTO turnos_caja (id, usuario_id, fecha_apertura, hora_apertura, monto_apertura, notas_apertura)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, usuario_id, fechaStr, horaStr, monto_apertura || 0, notas_apertura || null]);
    
    const newTurno = await get(`
      SELECT t.*, u.nombre as usuario_nombre
      FROM turnos_caja t
      JOIN users u ON t.usuario_id = u.id
      WHERE t.id = ?
    `, [id]);
    
    res.status(201).json(newTurno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cerrar turno de caja
app.put('/api/farmacia/turnos-caja/:id/cerrar', async (req, res) => {
  try {
    const { monto_cierre, notas_cierre } = req.body;
    
    const fecha = new Date();
    const fechaStr = fecha.toISOString().split('T')[0];
    const horaStr = fecha.toTimeString().slice(0, 5);
    
    // Calcular totales de ventas del turno
    const totales = await get(`
      SELECT 
        COUNT(*) as total_ventas,
        SUM(total) as total_ventas_monto,
        SUM(CASE WHEN metodo_pago = 'efectivo' THEN total ELSE 0 END) as total_efectivo,
        SUM(CASE WHEN metodo_pago = 'tarjeta' THEN total ELSE 0 END) as total_tarjeta,
        SUM(CASE WHEN metodo_pago = 'transferencia' THEN total ELSE 0 END) as total_transferencia
      FROM ventas_farmacia
      WHERE turno_id = ? AND estado = 'completada'
    `, [req.params.id]);
    
    await run(`
      UPDATE turnos_caja SET 
        fecha_cierre = ?, 
        hora_cierre = ?, 
        monto_cierre = ?,
        total_ventas = ?,
        total_efectivo = ?,
        total_tarjeta = ?,
        total_transferencia = ?,
        estado = 'cerrado',
        notas_cierre = ?
      WHERE id = ?
    `, [
      fechaStr, horaStr, monto_cierre,
      totales?.total_ventas || 0,
      totales?.total_efectivo || 0,
      totales?.total_tarjeta || 0,
      totales?.total_transferencia || 0,
      notas_cierre || null,
      req.params.id
    ]);
    
    const updatedTurno = await get(`
      SELECT t.*, u.nombre as usuario_nombre
      FROM turnos_caja t
      JOIN users u ON t.usuario_id = u.id
      WHERE t.id = ?
    `, [req.params.id]);
    
    res.json(updatedTurno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FARMACIA - REPORTES
// ============================================

// Reporte de inventario actual
app.get('/api/farmacia/reportes/inventario', async (req, res) => {
  try {
    const resumen = await get(`
      SELECT 
        COUNT(*) as total_productos,
        SUM(CASE WHEN stock_actual <= stock_minimo THEN 1 ELSE 0 END) as productos_stock_bajo,
        SUM(stock_actual * precio_compra) as valor_inventario_costo,
        SUM(stock_actual * precio_venta) as valor_inventario_venta
      FROM productos
      WHERE activo = 1
    `);
    
    const porCategoria = await all(`
      SELECT 
        c.nombre as categoria,
        COUNT(p.id) as cantidad_productos,
        SUM(p.stock_actual) as stock_total,
        SUM(p.stock_actual * p.precio_compra) as valor_costo,
        SUM(p.stock_actual * p.precio_venta) as valor_venta
      FROM productos p
      JOIN categorias_productos c ON p.categoria_id = c.id
      WHERE p.activo = 1
      GROUP BY c.id, c.nombre
    `);
    
    res.json({ resumen, por_categoria: porCategoria });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporte de ventas por período
app.get('/api/farmacia/reportes/ventas/:fechaInicio/:fechaFin', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.params;
    
    const resumen = await get(`
      SELECT 
        COUNT(*) as total_ventas,
        SUM(subtotal) as total_subtotal,
        SUM(descuento) as total_descuentos,
        SUM(impuesto) as total_impuestos,
        SUM(total) as total_ventas_monto
      FROM ventas_farmacia
      WHERE fecha BETWEEN ? AND ? AND estado = 'completada'
    `, [fechaInicio, fechaFin]);
    
    const porDia = await all(`
      SELECT 
        fecha,
        COUNT(*) as cantidad_ventas,
        SUM(total) as total_ventas
      FROM ventas_farmacia
      WHERE fecha BETWEEN ? AND ? AND estado = 'completada'
      GROUP BY fecha
      ORDER BY fecha
    `, [fechaInicio, fechaFin]);
    
    const porMetodoPago = await all(`
      SELECT 
        metodo_pago,
        COUNT(*) as cantidad,
        SUM(total) as total
      FROM ventas_farmacia
      WHERE fecha BETWEEN ? AND ? AND estado = 'completada'
      GROUP BY metodo_pago
    `, [fechaInicio, fechaFin]);
    
    const porVendedor = await all(`
      SELECT 
        u.nombre as vendedor,
        COUNT(*) as cantidad_ventas,
        SUM(v.total) as total_ventas
      FROM ventas_farmacia v
      JOIN users u ON v.vendedor_id = u.id
      WHERE v.fecha BETWEEN ? AND ? AND v.estado = 'completada'
      GROUP BY v.vendedor_id, u.nombre
    `, [fechaInicio, fechaFin]);
    
    const productosMasVendidos = await all(`
      SELECT 
        p.nombre as producto,
        p.codigo,
        SUM(d.cantidad) as cantidad_vendida,
        SUM(d.total) as total_ventas
      FROM detalle_venta_farmacia d
      JOIN productos p ON d.producto_id = p.id
      JOIN ventas_farmacia v ON d.venta_id = v.id
      WHERE v.fecha BETWEEN ? AND ? AND v.estado = 'completada'
      GROUP BY d.producto_id, p.nombre, p.codigo
      ORDER BY cantidad_vendida DESC
      LIMIT 10
    `, [fechaInicio, fechaFin]);
    
    res.json({
      periodo: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      resumen,
      por_dia: porDia,
      por_metodo_pago: porMetodoPago,
      por_vendedor: porVendedor,
      productos_mas_vendidos: productosMasVendidos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporte de ventas por turno
app.get('/api/farmacia/reportes/ventas-por-turno/:turnoId', async (req, res) => {
  try {
    const turno = await get(`
      SELECT t.*, u.nombre as usuario_nombre
      FROM turnos_caja t
      JOIN users u ON t.usuario_id = u.id
      WHERE t.id = ?
    `, [req.params.turnoId]);
    
    if (!turno) return res.status(404).json({ error: 'Turno no encontrado' });
    
    const ventas = await all(`
      SELECT v.*, d.nombre as dueno_nombre, d.apellido as dueno_apellido
      FROM ventas_farmacia v
      LEFT JOIN duenos d ON v.dueno_id = d.id
      WHERE v.turno_id = ? AND v.estado = 'completada'
      ORDER BY v.hora
    `, [req.params.turnoId]);
    
    const totales = await get(`
      SELECT 
        COUNT(*) as cantidad_ventas,
        SUM(subtotal) as total_subtotal,
        SUM(descuento) as total_descuentos,
        SUM(total) as total_ventas,
        SUM(CASE WHEN metodo_pago = 'efectivo' THEN total ELSE 0 END) as total_efectivo,
        SUM(CASE WHEN metodo_pago = 'tarjeta' THEN total ELSE 0 END) as total_tarjeta,
        SUM(CASE WHEN metodo_pago = 'transferencia' THEN total ELSE 0 END) as total_transferencia
      FROM ventas_farmacia
      WHERE turno_id = ? AND estado = 'completada'
    `, [req.params.turnoId]);
    
    res.json({ turno, ventas, totales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporte de movimientos de inventario
app.get('/api/farmacia/reportes/movimientos/:fechaInicio/:fechaFin', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.params;
    
    const movimientos = await all(`
      SELECT 
        m.*, 
        p.nombre as producto_nombre,
        p.codigo as producto_codigo,
        u.nombre as usuario_nombre
      FROM movimientos_inventario m
      JOIN productos p ON m.producto_id = p.id
      JOIN users u ON m.usuario_id = u.id
      WHERE date(m.fecha_movimiento) BETWEEN ? AND ?
      ORDER BY m.fecha_movimiento DESC
    `, [fechaInicio, fechaFin]);
    
    const resumen = await all(`
      SELECT 
        tipo_movimiento,
        COUNT(*) as cantidad_movimientos,
        SUM(cantidad) as total_unidades
      FROM movimientos_inventario
      WHERE date(fecha_movimiento) BETWEEN ? AND ?
      GROUP BY tipo_movimiento
    `, [fechaInicio, fechaFin]);
    
    res.json({ movimientos, resumen });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTA CATCH-ALL PARA EL FRONTEND
// ============================================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('    VETCARE PRO - SERVIDOR API');
  console.log('========================================\n');
  console.log(`Servidor corriendo en:`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → http://127.0.0.1:${PORT}\n`);
  console.log('Endpoints disponibles:');
  console.log('  POST /api/auth/login           - Login');
  console.log('  GET  /api/users                - Usuarios');
  console.log('  GET  /api/duenos               - Dueños');
  console.log('  GET  /api/mascotas             - Mascotas');
  console.log('  GET  /api/citas                - Citas');
  console.log('  GET  /api/historial            - Historial');
  console.log('  GET  /api/turnos               - Turnos');
  console.log('  GET  /api/asistencia           - Asistencia');
  console.log('  GET  /api/pagos                - Pagos');
  console.log('  GET  /api/farmacia/productos   - Productos Farmacia');
  console.log('  GET  /api/farmacia/ventas      - Ventas Farmacia\n');
});

module.exports = app;
