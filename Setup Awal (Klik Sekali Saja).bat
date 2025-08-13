@echo off
TITLE Setup Aplikasi Dashboard (Proses Awal)
ECHO.
ECHO =================================================================
ECHO   Memulai proses setup awal. Proses ini akan memakan waktu
ECHO   beberapa menit dan hanya perlu dijalankan satu kali saja.
ECHO.
ECHO   Pastikan Docker Desktop sudah berjalan sebelum melanjutkan.
ECHO   JANGAN TUTUP JENDELA INI SAMPAI PROSES SELESAI.
ECHO =================================================================
ECHO.

REM Perintah ini akan membangun dan menjalankan aplikasi untuk pertama kali
docker-compose up -d --build

ECHO.
ECHO Menunggu server siap selama 15 detik...
timeout /t 15 /nobreak > nul

ECHO Membuka aplikasi di browser...
start http://localhost:3000

ECHO.
ECHO Setup selesai! Untuk penggunaan selanjutnya, cukup klik file "Mulai Aplikasi.bat".
PAUSE