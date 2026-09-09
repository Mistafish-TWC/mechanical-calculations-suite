@echo off
title Mechanical Calculation Suite - Local Preview Server
cd /d "%~dp0"
echo ======================================================================
echo    Mechanical System Calculations Suite (Commercial Edition)
echo    Localhost Preview Server - Starting Up...
echo ======================================================================
echo.

:: Try Python first
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python detected. Starting suite_server.py...
    start "" "http://localhost:8080/Mechanical_Suite_Dashboard.html"
    python suite_server.py
    goto end
)

:: Try Python Launcher (py)
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python launcher (py) detected. Starting suite_server.py...
    start "" "http://localhost:8080/Mechanical_Suite_Dashboard.html"
    py suite_server.py
    goto end
)

:: Fallback to native Windows PowerShell HTTP Server (no python needed)
echo [INFO] Python not found in system PATH.
echo [OK] Starting native Windows PowerShell HTTP server...
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0start_server.ps1"
if %ERRORLEVEL% EQU 0 goto end

:: Fallback if PowerShell script execution is restricted
echo [INFO] Opening directly in browser via local file access...
start "" "%~dp0Mechanical_Suite_Dashboard.html"

:end
pause
