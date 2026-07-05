@echo off
title Zimazao Website
color 0A
echo.
echo   ================================================
echo      ZIMAZAO  -  FARMER MARKETPLACE
echo   ================================================
echo.
echo   Starting your website... keep this window open.
echo   Your browser will open automatically.
echo.
cd /d "C:\Users\DNPWDCM06\Documents\Zimazao"
start "" /min cmd /c "timeout /t 45 /nobreak >nul & start http://localhost:5173"
node start.mjs
echo.
echo   The website has stopped. Press any key to close.
pause >nul
