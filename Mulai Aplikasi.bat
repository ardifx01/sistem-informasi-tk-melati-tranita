@echo off
TITLE Memulai Aplikasi Dashboard
ECHO Memulai server... Mohon tunggu sebentar.
docker-compose start

ECHO.
ECHO Menunggu server siap selama 10 detik...
timeout /t 10 /nobreak > nul

ECHO Membuka aplikasi di browser...
start http://localhost:3000

ECHO.
ECHO Aplikasi sudah berjalan!
PAUSE
