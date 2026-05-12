@echo off
title VetCare Pro - Servidor
color 0B
cls

echo.
echo ========================================
echo    VETCARE PRO - INICIANDO SERVIDOR
echo ========================================
echo.

cd server

echo Iniciando servidor Node.js...
echo.
echo La aplicacion estara disponible en:
echo    http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

npm start

if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo iniciar el servidor
    echo.
    echo Verifica que:
    echo 1. Node.js este instalado
    echo 2. Ejecutaste INSTALAR.bat primero
    echo.
    pause
)
