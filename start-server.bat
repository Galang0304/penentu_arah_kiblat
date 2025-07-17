@echo off
:: Jalankan server lokal di port 3000 menggunakan http-server
where http-server >nul 2>nul
if %errorlevel% neq 0 (
  echo http-server belum terinstall. Install dulu dengan: npm install -g http-server
  pause
  exit /b
)
http-server -p 3000
pause 