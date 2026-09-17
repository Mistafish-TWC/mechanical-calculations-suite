@echo off
title Tool 6: Duct Loss Estimator - Localhost Server
echo ======================================================================
echo   Launching Mechanical System Calculations Suite on Localhost...
echo   Target: Tool 6 (Duct Loss Estimator & Chained Schedule)
echo ======================================================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0start_server.ps1" -Port 8080
pause
