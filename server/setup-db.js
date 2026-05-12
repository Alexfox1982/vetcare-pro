const { run, get } = require('./database');
const { v4: uuidv4 } = require('uuid');

async function setupDatabase() {
  console.log('\n========================================');
  console.log('    VETCARE PRO - CONFIGURACION DB');
  console.log('========================================\n');

  try {
    // Verificar si ya existen usuarios
    const existingUsers = await get('SELECT COUNT(*) as count FROM users');
    
    if (existingUsers.count > 0) {
      console.log('La base de datos ya tiene datos.');
      console.log('Usuarios existentes:', existingUsers.count);
      console.log('\nPara reiniciar, elimina el archivo database.sqlite');
      console.log('y ejecuta este script nuevamente.\n');
      return;
    }

    console.log('Insertando datos de ejemplo...\n');

    // Usuarios de demo
    const users = [
      { id: uuidv4(), nombre: 'Administrador', email: 'admin@vetcare.com', password: '123456', rol: 'admin', telefono: '555-0100' },
      { id: uuidv4(), nombre: 'Dr. Carlos Martinez', email: 'medico@vetcare.com', password: '123456', rol: 'medico', telefono: '555-0101' },
      { id: uuidv4(), nombre: 'Ana Lopez', email: 'secretaria@vetcare.com', password: '123456', rol: 'secretaria', telefono: '555-0102' },
      { id: uuidv4(), nombre: 'Maria Garcia', email: 'recepcionista@vetcare.com', password: '123456', rol: 'recepcionista', telefono: '555-0103' },
      { id: uuidv4(), nombre: 'Dra. Laura Fernandez', email: 'medico2@vetcare.com', password: '123456', rol: 'medico', telefono: '555-0104' },
    ];

    for (const user of users) {
      await run(
        'INSERT INTO users (id, nombre, email, password, rol, telefono, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [user.id, user.nombre, user.email, user.password, user.rol, user.telefono]
      );
      console.log(`  ✓ Usuario: ${user.nombre} (${user.rol})`);
    }

    // Dueños de ejemplo
    const duenos = [
      { id: uuidv4(), nombre: 'Juan', apellido: 'Perez', email: 'juan@email.com', telefono: '555-1001', direccion: 'Calle Principal 123' },
      { id: uuidv4(), nombre: 'Laura', apellido: 'Gonzalez', email: 'laura@email.com', telefono: '555-1002', direccion: 'Av. Las Flores 456' },
      { id: uuidv4(), nombre: 'Pedro', apellido: 'Rodriguez', email: 'pedro@email.com', telefono: '555-1003', direccion: 'Calle 5 de Mayo 789' },
      { id: uuidv4(), nombre: 'Carmen', apellido: 'Sanchez', email: 'carmen@email.com', telefono: '555-1004', direccion: 'Av. Reforma 321' },
    ];

    for (const dueno of duenos) {
      await run(
        'INSERT INTO duenos (id, nombre, apellido, email, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)',
        [dueno.id, dueno.nombre, dueno.apellido, dueno.email, dueno.telefono, dueno.direccion]
      );
      console.log(`  ✓ Dueño: ${dueno.nombre} ${dueno.apellido}`);
    }

    // Mascotas de ejemplo
    const mascotas = [
      { id: uuidv4(), nombre: 'Max', especie: 'perro', raza: 'Labrador', fecha_nacimiento: '2020-05-15', sexo: 'macho', color: 'Dorado', peso: 28, dueno_id: duenos[0].id, alergias: 'Ninguna' },
      { id: uuidv4(), nombre: 'Luna', especie: 'gato', raza: 'Siames', fecha_nacimiento: '2021-03-10', sexo: 'hembra', color: 'Gris', peso: 4.5, dueno_id: duenos[1].id, alergias: 'Polen' },
      { id: uuidv4(), nombre: 'Rocky', especie: 'perro', raza: 'Pastor Aleman', fecha_nacimiento: '2019-08-22', sexo: 'macho', color: 'Negro y cafe', peso: 35, dueno_id: duenos[2].id },
      { id: uuidv4(), nombre: 'Mia', especie: 'gato', raza: 'Persa', fecha_nacimiento: '2022-01-05', sexo: 'hembra', color: 'Blanco', peso: 3.8, dueno_id: duenos[3].id },
      { id: uuidv4(), nombre: 'Toby', especie: 'perro', raza: 'Beagle', fecha_nacimiento: '2021-11-18', sexo: 'macho', color: 'Tricolor', peso: 12, dueno_id: duenos[0].id },
    ];

    for (const mascota of mascotas) {
      await run(
        'INSERT INTO mascotas (id, nombre, especie, raza, fecha_nacimiento, sexo, color, peso, dueno_id, alergias) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [mascota.id, mascota.nombre, mascota.especie, mascota.raza, mascota.fecha_nacimiento, mascota.sexo, mascota.color, mascota.peso, mascota.dueno_id, mascota.alergias || null]
      );
      console.log(`  ✓ Mascota: ${mascota.nombre} (${mascota.especie})`);
    }

    // Citas de ejemplo
    const today = new Date().toISOString().split('T')[0];
    const citas = [
      { id: uuidv4(), mascota_id: mascotas[0].id, dueno_id: duenos[0].id, fecha: today, hora: '09:00', duracion: 30, motivo: 'Vacunacion anual', medico_id: users[1].id, estado: 'confirmada' },
      { id: uuidv4(), mascota_id: mascotas[1].id, dueno_id: duenos[1].id, fecha: today, hora: '10:30', duracion: 45, motivo: 'Revision de piel', medico_id: users[1].id, estado: 'pendiente' },
      { id: uuidv4(), mascota_id: mascotas[2].id, dueno_id: duenos[2].id, fecha: today, hora: '14:00', duracion: 30, motivo: 'Control de peso', medico_id: users[4].id, estado: 'confirmada' },
      { id: uuidv4(), mascota_id: mascotas[3].id, dueno_id: duenos[3].id, fecha: today, hora: '16:00', duracion: 60, motivo: 'Limpieza dental', medico_id: users[4].id, estado: 'pendiente' },
    ];

    for (const cita of citas) {
      await run(
        'INSERT INTO citas (id, mascota_id, dueno_id, fecha, hora, duracion, motivo, medico_id, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [cita.id, cita.mascota_id, cita.dueno_id, cita.fecha, cita.hora, cita.duracion, cita.motivo, cita.medico_id, cita.estado]
      );
      console.log(`  ✓ Cita: ${cita.motivo} - ${cita.hora}`);
    }

    // Historial de ejemplo
    const historial = [
      { id: uuidv4(), mascota_id: mascotas[0].id, fecha: '2024-01-15', medico_id: users[1].id, motivo_consulta: 'Vacunacion', sintomas: 'Ninguno', diagnostico: 'Saludable', tratamiento: 'Vacuna polivalente', medicamentos: 'Ninguno', costo: 450 },
      { id: uuidv4(), mascota_id: mascotas[1].id, fecha: '2024-02-10', medico_id: users[4].id, motivo_consulta: 'Comezon excesiva', sintomas: 'Rascado constante', diagnostico: 'Dermatitis alergica', tratamiento: 'Antihistaminico y champu medicado', medicamentos: 'Cetirizina 10mg', costo: 680 },
    ];

    for (const h of historial) {
      await run(
        'INSERT INTO historial (id, mascota_id, fecha, medico_id, motivo_consulta, sintomas, diagnostico, tratamiento, medicamentos, costo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [h.id, h.mascota_id, h.fecha, h.medico_id, h.motivo_consulta, h.sintomas, h.diagnostico, h.tratamiento, h.medicamentos, h.costo]
      );
      console.log(`  ✓ Historial: ${h.motivo_consulta}`);
    }

    // Turnos de ejemplo
    const turnos = [
      { id: uuidv4(), usuario_id: users[1].id, fecha: today, tipo: 'mañana', hora_inicio: '08:00', hora_fin: '14:00' },
      { id: uuidv4(), usuario_id: users[4].id, fecha: today, tipo: 'tarde', hora_inicio: '14:00', hora_fin: '20:00' },
    ];

    for (const turno of turnos) {
      await run(
        'INSERT INTO turnos (id, usuario_id, fecha, tipo, hora_inicio, hora_fin) VALUES (?, ?, ?, ?, ?, ?)',
        [turno.id, turno.usuario_id, turno.fecha, turno.tipo, turno.hora_inicio, turno.hora_fin]
      );
      console.log(`  ✓ Turno: ${turno.tipo} - ${turno.usuario_id}`);
    }

    // Asistencia de ejemplo
    const asistencias = [
      { id: uuidv4(), usuario_id: users[1].id, fecha: today, hora_entrada: '07:55', hora_salida: '14:05', tipo_registro: 'manual' },
      { id: uuidv4(), usuario_id: users[4].id, fecha: today, hora_entrada: '14:02', tipo_registro: 'manual' },
      { id: uuidv4(), usuario_id: users[2].id, fecha: today, hora_entrada: '08:10', hora_salida: '16:00', tipo_registro: 'manual' },
    ];

    for (const a of asistencias) {
      await run(
        'INSERT INTO asistencia (id, usuario_id, fecha, hora_entrada, hora_salida, tipo_registro) VALUES (?, ?, ?, ?, ?, ?)',
        [a.id, a.usuario_id, a.fecha, a.hora_entrada, a.hora_salida || null, a.tipo_registro]
      );
      console.log(`  ✓ Asistencia: ${a.usuario_id} - ${a.hora_entrada}`);
    }

    // Pagos de ejemplo
    const pagos = [
      { id: uuidv4(), tipo: 'consulta', referencia_id: historial[0].id, mascota_id: mascotas[0].id, dueno_id: duenos[0].id, concepto: 'Consulta general + Vacunación', monto: 450, metodo_pago: 'efectivo', estado: 'pagado', registrado_por: users[2].id },
      { id: uuidv4(), tipo: 'consulta', referencia_id: historial[1].id, mascota_id: mascotas[1].id, dueno_id: duenos[1].id, concepto: 'Consulta dermatológica', monto: 680, metodo_pago: 'tarjeta', estado: 'pagado', registrado_por: users[2].id },
      { id: uuidv4(), tipo: 'servicio', mascota_id: mascotas[0].id, dueno_id: duenos[0].id, concepto: 'Baño y corte de pelo', monto: 350, metodo_pago: 'efectivo', estado: 'pagado', registrado_por: users[2].id },
      { id: uuidv4(), tipo: 'producto', mascota_id: mascotas[2].id, dueno_id: duenos[2].id, concepto: 'Alimento premium 5kg', monto: 580, metodo_pago: 'transferencia', estado: 'pagado', registrado_por: users[2].id },
      { id: uuidv4(), tipo: 'consulta', mascota_id: mascotas[3].id, dueno_id: duenos[3].id, concepto: 'Desparasitación', monto: 280, metodo_pago: 'efectivo', estado: 'pagado', registrado_por: users[2].id },
    ];

    for (const p of pagos) {
      await run(
        'INSERT INTO pagos (id, tipo, referencia_id, mascota_id, dueno_id, concepto, monto, metodo_pago, estado, registrado_por) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.tipo, p.referencia_id || null, p.mascota_id || null, p.dueno_id, p.concepto, p.monto, p.metodo_pago, p.estado, p.registrado_por]
      );
      console.log(`  ✓ Pago: ${p.concepto} - $${p.monto}`);
    }

    // Horarios de ejemplo
    const horarios = [
      { usuario_id: users[1].id, dia_semana: 1, hora_entrada_esperada: '08:00', hora_salida_esperada: '14:00', tolerancia_minutos: 15 },
      { usuario_id: users[1].id, dia_semana: 2, hora_entrada_esperada: '08:00', hora_salida_esperada: '14:00', tolerancia_minutos: 15 },
      { usuario_id: users[1].id, dia_semana: 3, hora_entrada_esperada: '08:00', hora_salida_esperada: '14:00', tolerancia_minutos: 15 },
      { usuario_id: users[1].id, dia_semana: 4, hora_entrada_esperada: '08:00', hora_salida_esperada: '14:00', tolerancia_minutos: 15 },
      { usuario_id: users[1].id, dia_semana: 5, hora_entrada_esperada: '08:00', hora_salida_esperada: '14:00', tolerancia_minutos: 15 },
      { usuario_id: users[4].id, dia_semana: 1, hora_entrada_esperada: '14:00', hora_salida_esperada: '20:00', tolerancia_minutos: 15 },
      { usuario_id: users[4].id, dia_semana: 2, hora_entrada_esperada: '14:00', hora_salida_esperada: '20:00', tolerancia_minutos: 15 },
      { usuario_id: users[4].id, dia_semana: 3, hora_entrada_esperada: '14:00', hora_salida_esperada: '20:00', tolerancia_minutos: 15 },
      { usuario_id: users[4].id, dia_semana: 4, hora_entrada_esperada: '14:00', hora_salida_esperada: '20:00', tolerancia_minutos: 15 },
      { usuario_id: users[4].id, dia_semana: 5, hora_entrada_esperada: '14:00', hora_salida_esperada: '20:00', tolerancia_minutos: 15 },
      { usuario_id: users[2].id, dia_semana: 1, hora_entrada_esperada: '08:00', hora_salida_esperada: '16:00', tolerancia_minutos: 15 },
      { usuario_id: users[2].id, dia_semana: 2, hora_entrada_esperada: '08:00', hora_salida_esperada: '16:00', tolerancia_minutos: 15 },
      { usuario_id: users[2].id, dia_semana: 3, hora_entrada_esperada: '08:00', hora_salida_esperada: '16:00', tolerancia_minutos: 15 },
      { usuario_id: users[2].id, dia_semana: 4, hora_entrada_esperada: '08:00', hora_salida_esperada: '16:00', tolerancia_minutos: 15 },
      { usuario_id: users[2].id, dia_semana: 5, hora_entrada_esperada: '08:00', hora_salida_esperada: '16:00', tolerancia_minutos: 15 },
    ];

    for (const h of horarios) {
      const id = uuidv4();
      await run(
        'INSERT INTO horarios_config (id, usuario_id, dia_semana, hora_entrada_esperada, hora_salida_esperada, tolerancia_minutos) VALUES (?, ?, ?, ?, ?, ?)',
        [id, h.usuario_id, h.dia_semana, h.hora_entrada_esperada, h.hora_salida_esperada, h.tolerancia_minutos]
      );
    }
    console.log(`  ✓ Horarios configurados: ${horarios.length} registros`);

    // ============================================
    // DATOS DE FARMACIA
    // ============================================

    // Categorías de productos
    const categoriasProductos = [
      { id: uuidv4(), nombre: 'Medicamentos', descripcion: 'Medicamentos veterinarios recetados y de venta libre' },
      { id: uuidv4(), nombre: 'Vacunas', descripcion: 'Vacunas para perros, gatos y otras mascotas' },
      { id: uuidv4(), nombre: 'Alimentos', descripcion: 'Alimentos premium y medicados para mascotas' },
      { id: uuidv4(), nombre: 'Higiene y Cuidado', descripcion: 'Productos de higiene, champús y cuidado personal' },
      { id: uuidv4(), nombre: 'Accesorios', descripcion: 'Collares, correas, juguetes y accesorios varios' },
      { id: uuidv4(), nombre: 'Antiparasitarios', descripcion: 'Productos antipulgas, garrapatas y desparasitantes' },
    ];

    for (const cat of categoriasProductos) {
      await run(
        'INSERT INTO categorias_productos (id, nombre, descripcion) VALUES (?, ?, ?)',
        [cat.id, cat.nombre, cat.descripcion]
      );
      console.log(`  ✓ Categoría: ${cat.nombre}`);
    }

    // Productos de ejemplo
    const productos = [
      { id: uuidv4(), codigo: 'MED001', nombre: 'Amoxicilina 250mg', descripcion: 'Antibiótico de amplio espectro', categoria_id: categoriasProductos[0].id, precio_compra: 85, precio_venta: 150, stock_actual: 50, stock_minimo: 10, stock_maximo: 100, unidad_medida: 'caja', proveedor: 'Farmavet', requiere_receta: 1 },
      { id: uuidv4(), codigo: 'MED002', nombre: 'Metronidazol 500mg', descripcion: 'Antiprotozoario y antibacterial', categoria_id: categoriasProductos[0].id, precio_compra: 120, precio_venta: 220, stock_actual: 30, stock_minimo: 5, stock_maximo: 80, unidad_medida: 'caja', proveedor: 'Farmavet', requiere_receta: 1 },
      { id: uuidv4(), codigo: 'MED003', nombre: 'Prednisona 5mg', descripcion: 'Corticosteroide antiinflamatorio', categoria_id: categoriasProductos[0].id, precio_compra: 95, precio_venta: 180, stock_actual: 25, stock_minimo: 8, stock_maximo: 60, unidad_medida: 'caja', proveedor: 'VetPharma', requiere_receta: 1 },
      { id: uuidv4(), codigo: 'VAC001', nombre: 'Vacuna Pentavalente Canina', descripcion: 'Parvovirus, moquillo, hepatitis, parainfluenza, leptospira', categoria_id: categoriasProductos[1].id, precio_compra: 180, precio_venta: 350, stock_actual: 40, stock_minimo: 10, stock_maximo: 100, unidad_medida: 'dosis', proveedor: 'Zoetis', requiere_receta: 0 },
      { id: uuidv4(), codigo: 'VAC002', nombre: 'Vacuna Triple Felina', descripcion: 'Rinotraqueítis, calicivirus, panleucopenia', categoria_id: categoriasProductos[1].id, precio_compra: 160, precio_venta: 300, stock_actual: 35, stock_minimo: 8, stock_maximo: 80, unidad_medida: 'dosis', proveedor: 'Zoetis', requiere_receta: 0 },
      { id: uuidv4(), codigo: 'VAC003', nombre: 'Vacuna Rabia', descripcion: 'Vacuna antirrábica inactivada', categoria_id: categoriasProductos[1].id, precio_compra: 90, precio_venta: 180, stock_actual: 60, stock_minimo: 15, stock_maximo: 120, unidad_medida: 'dosis', proveedor: 'Boehringer', requiere_receta: 0 },
      { id: uuidv4(), codigo: 'ALI001', nombre: 'Royal Canin Adult Medium 15kg', descripcion: 'Alimento para perros adultos de razas medianas', categoria_id: categoriasProductos[2].id, precio_compra: 850, precio_venta: 1250, stock_actual: 20, stock_minimo: 5, stock_maximo: 50, unidad_medida: 'bolsa', proveedor: 'Royal Canin', requiere_receta: 0 },
      { id: uuidv4(), codigo: 'ALI002', nombre: 'Hill\'s Prescription Diet i/d', descripcion: 'Alimento gastrointestinal para perros', categoria_id: categoriasProductos[2].id, precio_compra: 920, precio_venta: 1380, stock_actual: 12, stock_minimo: 5, stock_maximo: 30, unidad_medida: 'bolsa', proveedor: 'Hill\'s', requiere_receta: 1 },
      { id: uuidv4(), codigo: 'ALI003', nombre: 'Pro Plan Adult Cat 7.5kg', descripcion: 'Alimento para gatos adultos', categoria_id: categoriasProductos[2].id, precio_compra: 650, precio_venta: 950, stock_actual: 18, stock_minimo: 5, stock_maximo: 40, unidad_medida: 'bolsa', proveedor: 'Purina', requiere_receta: 0 },
      { id: uuidv4(), codigo: 'HIG001', nombre: 'Champú Medicado Clorexyderm', descripcion: 'Champú antiséptico para dermatitis', categoria_id: categoriasProductos[3].id, precio_compra: 180, precio_venta: 320, stock_actual: 15, stock_minimo: 5, stock_maximo: 40, unidad_medida: 'botella', proveedor: 'ICF', requiere_receta: 0 },
      { id: uuidv4(), codigo: 'HIG002', nombre: 'Cepillo Dental + Pasta Kit', descripcion: 'Kit de higiene dental para mascotas', categoria_id: categoriasProductos[3].id, precio_compra: 120, precio_venta: 220, stock_actual: 25, stock_minimo: 8, stock_maximo: 50, unidad_medida: 'kit', proveedor: 'VetCare', requiere_receta: 0 },
      { id: uuidv4(), codigo: 'HIG003', nombre: 'Toallitas Húmedas PetWipes', descripcion: 'Toallitas limpiadoras para mascotas', categoria_id: categoriasProductos[3].id, precio_compra: 65, precio_venta: 120, stock_actual: 40, stock_minimo: 10, stock_maximo: 100, unidad_medida: 'paquete', proveedor: 'PetCare', requiere_receta: 0 },
      { id: uuidv4(), codigo: 'ACC001', nombre: 'Collar Ajustable Reflectivo', descripcion: 'Collar nylon reflectivo talla M', categoria_id: categoriasProductos[4].id, precio_compra: 85, precio_venta: 160, stock_actual: 30, stock_minimo: 10, stock_maximo: 80, unidad_medida: 'unidad', proveedor: 'PetStyle', requiere_receta: 0 },
      { id: uuidv4(), codigo: 'ACC002', nombre: 'Correa Retráctil 5m', descripcion: 'Correa extensible para paseo', categoria_id: categoriasProductos[4].id, precio_compra: 150, precio_venta: 280, stock_actual: 20, stock_minimo: 5, stock_maximo: 50, unidad_medida: 'unidad', proveedor: 'Flexi', requiere_receta: 0 },
      { id: uuidv4(), codigo: 'ACC003', nombre: 'Juguete Kong Classic', descripcion: 'Juguete resistente para masticar', categoria_id: categoriasProductos[4].id, precio_compra: 200, precio_venta: 380, stock_actual: 15, stock_minimo: 5, stock_maximo: 40, unidad_medida: 'unidad', proveedor: 'Kong', requiere_receta: 0 },
      { id: uuidv4(), codigo: 'ANT001', nombre: 'Frontline Plus Perro', descripcion: 'Pipeta antipulgas y garrapatas', categoria_id: categoriasProductos[5].id, precio_compra: 220, precio_venta: 400, stock_actual: 45, stock_minimo: 10, stock_maximo: 100, unidad_medida: 'caja', proveedor: 'Merial', requiere_receta: 0 },
      { id: uuidv4(), codigo: 'ANT002', nombre: 'Drontal Plus', descripcion: 'Desparasitante interno para perros', categoria_id: categoriasProductos[5].id, precio_compra: 140, precio_venta: 260, stock_actual: 35, stock_minimo: 8, stock_maximo: 80, unidad_medida: 'caja', proveedor: 'Bayer', requiere_receta: 0 },
      { id: uuidv4(), codigo: 'ANT003', nombre: 'Bravecto Perro 10-20kg', descripcion: 'Comprimido masticable antiparasitario 3 meses', categoria_id: categoriasProductos[5].id, precio_compra: 450, precio_venta: 750, stock_actual: 20, stock_minimo: 5, stock_maximo: 40, unidad_medida: 'comprimido', proveedor: 'MSD', requiere_receta: 0 },
    ];

    for (const prod of productos) {
      await run(
        `INSERT INTO productos (id, codigo, nombre, descripcion, categoria_id, precio_compra, precio_venta, 
         stock_actual, stock_minimo, stock_maximo, unidad_medida, proveedor, requiere_receta) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [prod.id, prod.codigo, prod.nombre, prod.descripcion, prod.categoria_id, prod.precio_compra, 
         prod.precio_venta, prod.stock_actual, prod.stock_minimo, prod.stock_maximo, 
         prod.unidad_medida, prod.proveedor, prod.requiere_receta]
      );
      console.log(`  ✓ Producto: ${prod.nombre}`);
    }

    console.log('\n========================================');
    console.log('    CONFIGURACION COMPLETADA');
    console.log('========================================\n');
    console.log('Usuarios de demo:');
    console.log('  admin@vetcare.com / 123456');
    console.log('  medico@vetcare.com / 123456');
    console.log('  secretaria@vetcare.com / 123456');
    console.log('  recepcionista@vetcare.com / 123456');
    console.log('\nPara iniciar el servidor:');
    console.log('  npm start\n');

  } catch (error) {
    console.error('Error al configurar la base de datos:', error.message);
  }
}

setupDatabase();
