@echo off
setlocal EnableDelayedExpansion
title VetCare Pro - Exportar para Servidor
color 0E
cls

echo.
echo ========================================
echo    EXPORTAR PARA SERVIDOR WEB
echo ========================================
echo.
echo Este script prepara tus archivos para
echo subirlos a un servidor web.
echo.

set "SOURCE_DIR=C:\xampp\htdocs\vetcare-server"
set "EXPORT_DIR=%USERPROFILE%\Desktop\vetcare-para-servidor"

:: Verificar que existe la instalacion
if not exist "%SOURCE_DIR%" (
    echo ERROR: No se encontro la instalacion en:
    echo %SOURCE_DIR%
    echo.
    echo Asegurate de haber instalado VetCare Pro primero.
    pause
    exit /b 1
)

echo Origen: %SOURCE_DIR%
echo Destino: %EXPORT_DIR%
echo.

:: Crear carpeta de exportacion
if exist "%EXPORT_DIR%" (
    echo La carpeta de exportacion ya existe.
    choice /C SN /M "Deseas sobrescribirla"
    if !errorlevel! == 2 (
        echo Exportacion cancelada.
        pause
        exit /b 0
    )
    rmdir /S /Q "%EXPORT_DIR%"
)

mkdir "%EXPORT_DIR%"

:: ============================================================
:: COPIAR ARCHIVOS NECESARIOS
:: ============================================================
echo.
echo [1/4] Copiando servidor...
xcopy /E /I /Y "%SOURCE_DIR%\server" "%EXPORT_DIR%\server" >nul 2>&1

:: Eliminar node_modules del servidor (se regenera)
if exist "%EXPORT_DIR%\server\node_modules" (
    rmdir /S /Q "%EXPORT_DIR%\server\node_modules"
)
if exist "%EXPORT_DIR%\server\package-lock.json" (
    del "%EXPORT_DIR%\server\package-lock.json"
)

echo [2/4] Copiando frontend compilado...
if exist "%SOURCE_DIR%\client\dist" (
    xcopy /E /I /Y "%SOURCE_DIR%\client\dist" "%EXPORT_DIR%\client\dist" >nul 2>&1
) else (
    echo.
    echo ADVERTENCIA: No se encontro client\dist
echo.
    echo El frontend no esta compilado.
    echo Debes compilarlo primero:
    echo   cd %SOURCE_DIR%\client
    echo   npm install
    echo   npm run build
    echo.
    pause
    exit /b 1
)

echo [3/4] Copiando documentacion...
copy /Y "%SOURCE_DIR%\README.md" "%EXPORT_DIR%\" >nul 2>&1
copy /Y "%SOURCE_DIR%\GUIA-SERVIDOR-PRODUCCION.txt" "%EXPORT_DIR%\" >nul 2>&1

:: Crear instrucciones de instalacion en servidor
echo [4/4] Creando instrucciones...
(
echo # VetCare Pro - Instalacion en Servidor
echo.
echo ## Requisitos
echo - Node.js 18+ instalado
echo - PM2 instalado: npm install -g pm2
echo.
echo ## Pasos de Instalacion
echo.
echo 1. Subir esta carpeta al servidor:
echo    /var/www/vetcare/
echo.
echo 2. Instalar dependencias:
echo    cd /var/www/vetcare/server
echo    npm install
echo.
echo 3. Configurar base de datos:
echo    - Si tienes database.sqlite, copiarlo aqui
echo    - Si no, ejecutar: npm run setup
echo.
echo 4. Iniciar con PM2:
echo    pm2 start server.js --name vetcare
echo    pm2 save
echo    pm2 startup
echo.
echo 5. Configurar Nginx como proxy inverso
echo    Ver GUIA-SERVIDOR-PRODUCCION.txt para detalles
echo.
echo ## Comandos Utiles
echo - pm2 status          : Ver estado
echo - pm2 logs vetcare    : Ver logs
echo - pm2 restart vetcare : Reiniciar
echo.
echo ## Usuarios de Demo
echo - admin@vetcare.com / 123456
echo - medico@vetcare.com / 123456
echo - secretaria@vetcare.com / 123456
echo - recepcionista@vetcare.com / 123456
echo.
echo ## Backup de Base de Datos
echo El archivo database.sqlite contiene todos los datos.
echo Simplemente copiarlo para hacer backup.
) > "%EXPORT_DIR%\INSTALAR-EN-SERVIDOR.txt"

:: ============================================================
:: COMPRIMIR
:: ============================================================
echo.
echo ========================================
echo    COMPRIMIENDO ARCHIVOS
echo ========================================
echo.

set "ZIP_FILE=%USERPROFILE%\Desktop\vetcare-para-servidor.zip"

:: Eliminar ZIP anterior si existe
if exist "%ZIP_FILE%" del "%ZIP_FILE%"

:: Crear ZIP usando PowerShell
echo Creando archivo ZIP...
powershell -Command "Compress-Archive -Path '%EXPORT_DIR%\*' -DestinationPath '%ZIP_FILE%' -Force"

if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo crear el ZIP
echo.
    echo Intenta comprimir manualmente la carpeta:
    echo %EXPORT_DIR%
    pause
    exit /b 1
)

:: ============================================================
:: RESUMEN
:: ============================================================
echo.
echo ========================================
echo    EXPORTACION COMPLETADA
echo ========================================
echo.
echo Archivo creado:
echo   %ZIP_FILE%
echo.
echo Contenido:
echo   - server/        (backend Node.js)
echo   - client/dist/   (frontend compilado)
echo   - Documentacion
echo.
echo INSTRUCCIONES PARA SUBIR AL SERVIDOR:
echo.
echo 1. Sube el archivo vetcare-para-servidor.zip a tu servidor
echo 2. Extrae en: /var/www/vetcare/
echo 3. Sigue las instrucciones en: INSTALAR-EN-SERVIDOR.txt
echo.
echo IMPORTANTE:
echo - Si tienes datos, tambien copia database.sqlite
echo - El archivo esta en: %SOURCE_DIR%\server\database.sqlite
echo.
echo ========================================
echo.

choice /C SN /M "Deseas abrir la carpeta de exportacion"
if %errorlevel% == 1 (
    explorer "%USERPROFILE%\Desktop"
)

echo.
pause
