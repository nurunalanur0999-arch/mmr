@echo off
setlocal
cd /d "%~dp0"
echo =============================================
echo  Bentley Outdoors - Local Website Launcher
echo =============================================
where py >nul 2>nul
if %errorlevel%==0 goto use_py
where python >nul 2>nul
if %errorlevel%==0 goto use_python
echo Python was not found. Opening the site directly instead.
echo If the page looks incomplete, install Python 3 and run this file again.
start "" "%~dp0index.html"
pause
exit /b 0

:use_py
py serve_website.py
goto end

:use_python
python serve_website.py

:end
pause
