================================================================================
                    VETCARE PRO - INSTALACION RAPIDA
================================================================================

REQUISITOS:
-----------
1. Tener Node.js instalado (18 o superior)
   Descargar desde: https://nodejs.org
   
2. Windows 10 o superior (tambien funciona en Linux/Mac)


INSTALACION EN WINDOWS:
-----------------------

METODO 1: Usar el instalador automatico (RECOMENDADO)
-----------------------------------------------------
1. Haz doble clic en "INSTALAR.bat"
2. Espera a que termine la instalacion
3. Listo!


METODO 2: Manual paso a paso
----------------------------

PASO 1: Instalar dependencias del servidor
   cd server
   npm install

PASO 2: Configurar base de datos
   npm run setup

PASO 3: Instalar dependencias del cliente
   cd ..\client
   npm install

PASO 4: Compilar frontend
   npm run build

PASO 5: Iniciar servidor
   cd ..\server
   npm start


INICIAR LA APLICACION:
----------------------
Despues de instalar, para iniciar el servidor:

Opcion A: Haz doble clic en "INICIAR-SERVIDOR.bat"

Opcion B: Abre terminal y ejecuta:
   cd server
   npm start

La aplicacion estara en: http://localhost:3000


USUARIOS DE DEMO:
-----------------
admin@vetcare.com          / 123456  (Administrador)
medico@vetcare.com         / 123456  (Medico)
secretaria@vetcare.com     / 123456  (Secretaria)
recepcionista@vetcare.com  / 123456  (Recepcionista)


SOLUCION DE PROBLEMAS:
----------------------

ERROR: "node no se reconoce"
-> Instala Node.js desde https://nodejs.org

ERROR: "npm install falla"
-> Verifica tu conexion a internet
-> Ejecuta como administrador

ERROR: "Puerto 3000 en uso"
-> Cambia el puerto en server/server.js
-> O mata el proceso: netstat -ano | findstr :3000

PANTALLA EN BLANCO:
-> Verifica que el servidor este corriendo
-> Revisa la consola del navegador (F12)


================================================================================
                         © 2024 VetCare Pro
================================================================================
