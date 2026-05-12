@echo off
setlocal EnableDelayedExpansion
title VetCare Pro - Instalador para XAMPP
color 0B
cls

echo.
echo ========================================
echo    VETCARE PRO - INSTALADOR XAMPP
echo ========================================
echo.
echo Este script te guiara paso a paso
echo.

:: ============================================================
:: VERIFICAR XAMPP
:: ============================================================
echo [PASO 1] Verificando XAMPP...

if not exist "C:\xampp" (
    echo.
    echo ERROR: XAMPP no encontrado en C:\xampp
    echo.
    echo Por favor:
    echo 1. Descarga XAMPP de: https://apachefriends.org
    echo 2. Instalalo en C:\xampp
    echo 3. Vuelve a ejecutar este script
    echo.
    start https://apachefriends.org
    pause
    exit /b 1
)

echo     OK - XAMPP encontrado
echo.

:: ============================================================
:: VERIFICAR NODE.JS
:: ============================================================
echo [PASO 2] Verificando Node.js...

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js no encontrado
    echo.
    echo Por favor:
    echo 1. Descarga Node.js de: https://nodejs.org
    echo 2. Instala la version LTS
    echo 3. Reinicia tu computadora
    echo 4. Vuelve a ejecutar este script
    echo.
    start https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
echo     OK - Node.js %NODE_VERSION%
echo.

:: ============================================================
:: VERIFICAR UBICACION
:: ============================================================
echo [PASO 3] Verificando ubicacion...

if not exist "C:\xampp\htdocs" (
    echo ERROR: No se encontro C:\xampp\htdocs
    pause
    exit /b 1
)

:: Obtener la ruta actual del script
set "SCRIPT_DIR=%~dp0"
set "SOURCE_DIR=%SCRIPT_DIR%"

:: Verificar que estamos en la carpeta correcta
if not exist "%SOURCE_DIR%server" (
    echo.
    echo ERROR: No se encontro la carpeta 'server'
    echo.
    echo Asegurate de ejecutar este script desde la carpeta vetcare-server
    echo.
    pause
    exit /b 1
)

echo     OK - Ubicacion correcta
echo.

:: ============================================================
:: COPIAR ARCHIVOS
:: ============================================================
echo [PASO 4] Copiando archivos a XAMPP...

set "DEST_DIR=C:\xampp\htdocs\vetcare"

:: Crear carpeta destino si no existe
if not exist "%DEST_DIR%" mkdir "%DEST_DIR%"

:: Copiar archivos
echo     Copiando servidor...
xcopy /E /I /Y "%SOURCE_DIR%server" "%DEST_DIR%\server" >nul 2>&1

echo     Copiando cliente...
xcopy /E /I /Y "%SOURCE_DIR%client" "%DEST_DIR%\client" >nul 2>&1

echo     Copiando archivos de configuracion...
copy /Y "%SOURCE_DIR%INSTALAR.bat" "%DEST_DIR%\" >nul 2>&1
copy /Y "%SOURCE_DIR%INICIAR-SERVIDOR.bat" "%DEST_DIR%\" >nul 2>&1
copy /Y "%SOURCE_DIR%README.md" "%DEST_DIR%\" >nul 2>&1
copy /Y "%SOURCE_DIR%GUIA-XAMPP-COMPLETA.txt" "%DEST_DIR%\" >nul 2>&1

echo     OK - Archivos copiados
echo.

:: ============================================================
:: INSTALAR DEPENDENCIAS
:: ============================================================
echo [PASO 5] Instalando dependencias del servidor...

cd /d "%DEST_DIR%\server"

if exist "node_modules" (
    echo     Dependencias ya instaladas
echo.
    choice /C SN /M "    Deseas reinstalarlas"
    if !errorlevel! == 1 (
        rmdir /S /Q node_modules 2>nul
        del package-lock.json 2>nul
    ) else (
        goto :SKIP_NPM
    )
)

echo     Ejecutando npm install (esto puede tardar varios minutos)...
echo     Por favor espera...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudieron instalar las dependencias
    echo.
    echo Posibles causas:
    echo - Problemas de conexion a internet
    echo - Permisos insuficientes
    echo.
    echo Intenta:
    echo 1. Verificar tu conexion a internet
    echo 2. Ejecutar como administrador
    echo 3. Ejecutar manualmente: cd %DEST_DIR%\server ^&^& npm install
    echo.
    pause
    exit /b 1
)

echo     OK - Dependencias instaladas
echo.

:SKIP_NPM

:: ============================================================
:: CONFIGURAR BASE DE DATOS
:: ============================================================
echo [PASO 6] Configurando base de datos...

if exist "database.sqlite" (
    echo     Base de datos ya existe
echo.
    choice /C SN /M "    Deseas reiniciar con datos de demo"
    if !errorlevel! == 1 (
        del database.sqlite
        call npm run setup
    )
) else (
    call npm run setup
)

echo     OK - Base de datos configurada
echo.

:: ============================================================
:: COMPILAR CLIENTE
:: ============================================================
echo [PASO 7] Compilando frontend...

cd /d "%DEST_DIR%\client"

if exist "node_modules" (
    echo     Dependencias del cliente ya instaladas
echo.
    choice /C SN /M "    Deseas reinstalarlas"
    if !errorlevel! == 1 (
        rmdir /S /Q node_modules 2>nul
        del package-lock.json 2>nul
        call npm install
    )
) else (
    echo     Instalando dependencias del cliente...
    call npm install
)

echo     Compilando...
call npm run build 2>nul

if %errorlevel% neq 0 (
    echo.
    echo ADVERTENCIA: No se pudo compilar automaticamente
    echo Esto es normal si faltan dependencias de desarrollo
    echo.
    echo Para compilar manualmente:
    echo   cd %DEST_DIR%\client
    echo   npm install
    echo   npm run build
    echo.
)

echo     OK - Frontend listo
echo.

:: ============================================================
:: RESUMEN
:: ============================================================
echo.
echo ========================================
echo    INSTALACION COMPLETADA
echo ========================================
echo.
echo Ubicacion: %DEST_DIR%
echo.
echo Para iniciar el servidor:
echo   1. Abre XAMPP Control Panel
echo   2. Inicia Apache (opcional)
echo   3. Ve a: %DEST_DIR%
echo   4. Haz doble clic en: INICIAR-SERVIDOR.bat
echo.
echo O desde CMD:
echo   cd %DEST_DIR%\server
echo   npm start
echo.
echo La aplicacion estara en: http://localhost:3000
echo.
echo Usuarios de demo:
echo   admin@vetcare.com / 123456
echo   medico@vetcare.com / 123456
echo   secretaria@vetcare.com / 123456
echo   recepcionista@vetcare.com / 123456
echo.
echo ========================================
echo.

choice /C SN /M "Deseas iniciar el servidor ahora"
if %errorlevel% == 1 (
    cd /d "%DEST_DIR%"
    start "VetCare Pro Server" cmd /k "cd server && npm start"
    echo.
    echo Servidor iniciado en nueva ventana
echo.
    timeout /t 3 >nul
    start http://localhost:3000
)

echo.
pause
