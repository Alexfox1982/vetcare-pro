@echo off
title VetCare Pro - Modo Desarrollo
color 0E
cls

echo.
echo ========================================
echo    VETCARE PRO - MODO DESARROLLO
echo ========================================
echo.
echo Este modo reinicia automaticamente al hacer cambios
echo.

:: Iniciar servidor en nueva ventana
echo Iniciando servidor backend...
start "Servidor Backend" cmd /k "cd server && npm run dev"

:: Esperar un momento
timeout /t 3 /nobreak >nul

:: Iniciar cliente en nueva ventana
echo Iniciando cliente frontend...
start "Cliente Frontend" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo    SERVIDORES INICIADOS
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Cierra estas ventanas para detener
echo.
pause
