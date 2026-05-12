@echo off
title VetCare Pro - Backup de Datos
color 0A
cls

echo.
echo ========================================
echo    BACKUP DE BASE DE DATOS
echo ========================================
echo.

set "DB_PATH=C:\xampp\htdocs\vetcare-server\server\database.sqlite"
set "BACKUP_DIR=%USERPROFILE%\Documents\VetCare-Backups"

:: Verificar que existe la base de datos
if not exist "%DB_PATH%" (
    echo ERROR: No se encontro la base de datos en:
    echo %DB_PATH%
    echo.
    echo Asegurate de haber instalado VetCare Pro.
    pause
    exit /b 1
)

:: Crear carpeta de backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Generar nombre con fecha
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a-%%b)
set "BACKUP_FILE=vetcare-backup-%mydate%_%mytime%.sqlite"

echo Creando backup...
echo.
echo Origen: %DB_PATH%
echo Destino: %BACKUP_DIR%\%BACKUP_FILE%
echo.

copy /Y "%DB_PATH%" "%BACKUP_DIR%\%BACKUP_FILE%"

if %errorlevel% == 0 (
    echo.
    echo ========================================
    echo    BACKUP CREADO EXITOSAMENTE
echo ========================================
    echo.
    echo Ubicacion: %BACKUP_DIR%\%BACKUP_FILE%
    echo.
    echo Tamanio:
    for %%I in ("%BACKUP_DIR%\%BACKUP_FILE%") do echo   %%~zI bytes
    echo.
    
    choice /C SN /M "Deseas abrir la carpeta de backups"
    if %errorlevel% == 1 (
        explorer "%BACKUP_DIR%"
    )
) else (
    echo.
    echo ERROR: No se pudo crear el backup
    echo.
)

echo.
pause
