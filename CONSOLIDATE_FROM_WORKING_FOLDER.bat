@echo off
title Consolidate Files into mechanical-calculations-suite
cd /d "%~dp0"
echo ======================================================================
echo   Consolidating Latest Files to:
echo   mechanical-calculations-suite
echo ======================================================================
echo.

set "SOURCE=..\AI App Working Folder"

if not exist "%SOURCE%\tool6.js" (
    echo [ERROR] Source folder "%SOURCE%" not found or missing tool6.js!
    echo Please make sure this script is run inside the mechanical-calculations-suite folder.
    pause
    exit /b 1
)

echo [1/4] Creating safety backup of current files...
if not exist "_pre_consolidation_backup" mkdir "_pre_consolidation_backup"
if exist "tool6.js" copy /y "tool6.js" "_pre_consolidation_backup\tool6_old.js" >nul
if exist "tool6_duct_loss.html" copy /y "tool6_duct_loss.html" "_pre_consolidation_backup\tool6_duct_loss_old.html" >nul
echo       Backup created in: _pre_consolidation_backup\

echo.
echo [2/4] Copying latest tool6.js (226 KB, Continuous Aerodynamics, Loren Cook TEL, 10a/b/c fixes)...
copy /y "%SOURCE%\tool6.js" "tool6.js"

echo.
echo [3/4] Copying latest tool6_duct_loss.html (205 KB, Docked modal buttons, Rect straight sides)...
copy /y "%SOURCE%\tool6_duct_loss.html" "tool6_duct_loss.html"

echo.
echo [4/4] Copying start_server.bat...
copy /y "%SOURCE%\start_server.bat" "start_server.bat"

echo.
echo ======================================================================
echo   CONSOLIDATION COMPLETE!
echo.
echo   Files updated in mechanical-calculations-suite:
echo   - tool6.js
echo   - tool6_duct_loss.html
echo   - start_server.bat
echo.
echo   Preserved in mechanical-calculations-suite:
echo   - shared_project_library.js (Full 12 KB project library)
echo   - Tools 1-5, common.js, Duct Fittings, Git repository
echo ======================================================================
echo.
pause
