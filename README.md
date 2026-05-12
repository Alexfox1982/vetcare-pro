# VetCare Pro - Sistema Veterinario con Base de Datos

Sistema completo de gestión veterinaria con backend Node.js + Express y base de datos SQLite.

## 📁 Estructura del Proyecto

```
vetcare-server/
├── server/                 # Backend Node.js
│   ├── package.json        # Dependencias del servidor
│   ├── server.js           # Servidor principal Express
│   ├── database.js         # Configuración SQLite
│   ├── setup-db.js         # Script para datos de demo
│   └── database.sqlite     # Base de datos (se crea al iniciar)
├── client/                 # Frontend React
│   ├── src/                # Código fuente
│   ├── dist/               # Build de producción
│   ├── package.json        # Dependencias del cliente
│   └── .env                # Variables de entorno
└── README.md               # Este archivo
```

## 🚀 Instalación Rápida

### Requisitos
- Node.js 18+ (descargar de https://nodejs.org)
- npm (viene con Node.js)

### Pasos de Instalación

#### 1. Extraer archivos
Extrae el ZIP en tu servidor web (ej: `C:\xampp\htdocs\vetcare\` o `/var/www/vetcare/`)

#### 2. Instalar dependencias del servidor
```bash
cd server
npm install
```

#### 3. Configurar base de datos (datos de demo)
```bash
npm run setup
```

#### 4. Iniciar el servidor
```bash
npm start
```

El servidor estará disponible en: **http://localhost:3000**

---

## 📦 Instalación en Servidor de Producción

### Opción 1: Servidor Propio (VPS/Dedicado)

1. **Subir archivos** al servidor via FTP/SFTP
2. **Instalar Node.js** en el servidor
3. **Instalar PM2** para mantener el servidor activo:
   ```bash
   npm install -g pm2
   ```
4. **Configurar el servidor**:
   ```bash
   cd server
   npm install
   npm run setup
   ```
5. **Iniciar con PM2**:
   ```bash
   pm2 start server.js --name vetcare
   pm2 startup
   pm2 save
   ```

### Opción 2: cPanel (Hosting Compartido)

Si tu hosting tiene Node.js support:

1. Sube los archivos via FTP
2. En cPanel, busca "Setup Node.js App"
3. Selecciona la carpeta `server/`
4. Versión de Node.js: 18.x o superior
5. Archivo de inicio: `server.js`
6. Ejecuta `npm install` desde el terminal de cPanel
7. Ejecuta `npm run setup`
8. Inicia la aplicación

### Opción 3: XAMPP (Windows Local)

1. Instala XAMPP desde https://apachefriends.org
2. Copia todo el proyecto a `C:\xampp\htdocs\vetcare\`
3. Abre XAMPP Control Panel
4. Inicia Apache (para servir el frontend)
5. Abre terminal en `C:\xampp\htdocs\vetcare\server\`
6. Ejecuta:
   ```bash
   npm install
   npm run setup
   npm start
   ```
7. Abre navegador en: `http://localhost/vetcare/client/dist/`

---

## ⚙️ Configuración

### Cambiar puerto del servidor
Edita `server/server.js`:
```javascript
const PORT = process.env.PORT || 3000;  // Cambia 3000 por tu puerto
```

### Configurar dominio
Si usas un dominio, actualiza la URL en `client/.env`:
```
VITE_API_URL=https://tudominio.com
```

Luego rebuild el cliente:
```bash
cd client
npm install
npm run build
```

---

## 🔐 Usuarios de Demo

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@vetcare.com | 123456 | Administrador |
| medico@vetcare.com | 123456 | Médico |
| secretaria@vetcare.com | 123456 | Secretaria |
| recepcionista@vetcare.com | 123456 | Recepcionista |

---

## 🗄️ Base de Datos

La base de datos SQLite se crea automáticamente en `server/database.sqlite`

### Tablas:
- **users** - Usuarios del sistema
- **duenos** - Dueños de mascotas
- **mascotas** - Pacientes (mascotas)
- **citas** - Citas programadas
- **historial** - Historial clínico
- **turnos** - Turnos del personal

### Backup de datos
Simplemente copia el archivo `database.sqlite` para hacer backup.

### Resetear datos
Elimina `database.sqlite` y ejecuta `npm run setup` nuevamente.

---

## 📱 Características

✅ Gestión de dueños y mascotas  
✅ Historial clínico completo  
✅ Calendario de citas (vista diaria y semanal)  
✅ Jerarquía de usuarios (Admin, Médico, Secretaria, Recepcionista)  
✅ Control de turnos del personal  
✅ Base de datos SQLite (sin configuración adicional)  
✅ Diseño responsivo (funciona en móvil, tablet y PC)  
✅ API REST completa  

---

## 🛠️ Comandos Útiles

```bash
# Servidor
cd server
npm start          # Iniciar servidor
npm run dev        # Iniciar con nodemon (desarrollo)
npm run setup      # Crear datos de demo

# Cliente
cd client
npm install        # Instalar dependencias
npm run dev        # Servidor de desarrollo
npm run build      # Build para producción
```

---

## 🔧 Solución de Problemas

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Port already in use"
Cambia el puerto en `server.js` o mata el proceso:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Pantalla en blanco
1. Verifica que el servidor esté corriendo
2. Revisa la consola del navegador (F12)
3. Asegúrate que `VITE_API_URL` esté configurado correctamente

---

## 📞 Soporte

Para soporte técnico o preguntas, contacta al desarrollador.

---

**© 2024 VetCare Pro - Sistema Veterinario**
