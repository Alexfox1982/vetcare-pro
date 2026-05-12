@echo off
title VetCare Pro - Instalador
color 0A
cls

echo.
echo ========================================
echo    VETCARE PRO - INSTALADOR
echo ========================================
echo.

:: Verificar Node.js
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js no esta instalado.
    echo.
    echo Por favor instala Node.js desde:
    echo https://nodejs.org
    echo.
    echo Descarga la version LTS (recomendada)
    echo.
    start https://nodejs.org
    pause
    exit /b 1
)

echo     OK - Node.js detectado
echo.

:: Instalar dependencias del servidor
echo [2/4] Instalando dependencias del servidor...
cd server
if exist node_modules (
    echo     Dependencias ya instaladas
) else (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: No se pudieron instalar las dependencias
        pause
        exit /b 1
    )
)
echo     OK
echo.

:: Configurar base de datos
echo [3/4] Configurando base de datos...
if exist database.sqlite (
    echo     Base de datos ya existe
    choice /C SN /M "Deseas reiniciar los datos de demo"
    if %errorlevel% == 1 (
        del database.sqlite
        call npm run setup
    )
) else (
    call npm run setup
)
echo     OK
echo.

:: Instalar dependencias del cliente
echo [4/4] Instalando dependencias del cliente...
cd ..\client
if exist node_modules (
    echo     Dependencias ya instaladas
) else (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: No se pudieron instalar las dependencias del cliente
        pause
        exit /b 1
    )
)
echo     OK
echo.

:: Compilar cliente
echo Compilando frontend...
call npm run build 2>nul
if %errorlevel% neq 0 (
    echo     ADVERTENCIA: No se pudo compilar automaticamente
    echo     Ejecuta manualmente: cd client ^&^& npm run build
)
echo.

echo ========================================
echo    INSTALACION COMPLETADA
echo ========================================
echo.
echo Para iniciar el servidor:
echo    cd server
echo    npm start
echo.
echo O usa el archivo INICIAR-SERVIDOR.bat
echo.
pause
