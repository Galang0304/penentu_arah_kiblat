@echo off
:: Jalankan server lokal di port 3000 menggunakan Python
where python >nul 2>nul
if %errorlevel% neq 0 (
  echo Python belum terinstall. Silakan install Python terlebih dahulu.
  pause
  exit /b
)
python -m http.server 3000
pause 