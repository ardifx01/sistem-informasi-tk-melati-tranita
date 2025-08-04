# Sistem Informasi Manajemen Sekolah - TK Melati Tranita

![Logo TK Melati Tranita](https://placehold.co/100x100/e2e8f0/334155?text=Logo)

Sebuah aplikasi dashboard modern yang dirancang untuk membantu administrasi TK Melati Tranita dalam mengelola data siswa dan keuangan sekolah secara efisien. Aplikasi ini dibangun dengan tumpukan teknologi modern untuk memastikan performa, keamanan, dan kemudahan penggunaan.

---

## ✨ Fitur Utama

- **Dashboard Utama & Keuangan:** Ringkasan eksekutif data siswa dan kondisi keuangan sekolah dalam satu tampilan informatif.
- **Manajemen Siswa:** Kelola data lengkap siswa, termasuk informasi pribadi, kelas, dan riwayat akademik.
- **Manajemen Kelas:** Pengelolaan data kelas dan wali kelas dengan mudah.
- **Sistem Keuangan Berbasis Tagihan:**
  - **Manajemen Tagihan:** Buat tagihan SPP secara massal untuk satu atau semua kelas.
  - **Pelacakan Status:** Pantau status pembayaran setiap tagihan (`LUNAS`, `BELUM LUNAS`, `TERLAMBAT`) secara _real-time_.
  - **Riwayat Pemasukan & Pengeluaran:** Catat dan lihat semua transaksi keuangan yang terjadi.
- **Pencarian Global:** Temukan data siswa dengan cepat dari halaman mana pun menggunakan nama atau NIS.
- **Laporan & Ekspor:** Unduh laporan keuangan (bulanan atau tahunan) dalam format Excel dan PDF, atau cetak langsung dari pratinjau.
- **Panduan Penggunaan:** Halaman bantuan terintegrasi yang menjelaskan alur kerja aplikasi.

---

## 🚀 Teknologi yang Digunakan

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (di-host di [Supabase](https://supabase.com/))
- **Validasi:** [Zod](https://zod.dev/)
- **Manajemen Form:** [React Hook Form](https://react-hook-form.com/)
- **Grafik & Chart:** [Recharts](https://recharts.org/)
- **Notifikasi:** [Sonner](https://sonner.emilkowal.ski/)

---

## 📖 Alur Kerja Aplikasi

Berikut adalah alur kerja dasar untuk menggunakan fitur-fitur utama aplikasi:

### Alur Keuangan

Sistem ini menggunakan alur berbasis tagihan untuk akurasi maksimal.

1.  **Buat Tagihan (Awal Bulan):**

    - Buka **Keuangan → Tagihan**.
    - Klik **"Buat Tagihan"** untuk men-generate SPP bulanan untuk satu atau semua kelas. Semua tagihan baru akan berstatus `BELUM LUNAS`.

2.  **Catat Pembayaran:**

    - Tetap di halaman **Tagihan**.
    - Cari tagihan siswa yang akan membayar, klik menu aksi (...) lalu pilih **"Bayar Tagihan"**.
    - Konfirmasi pembayaran. Status tagihan akan otomatis menjadi `LUNAS` dan catatan akan muncul di riwayat **Pemasukan**.

3.  **Catat Pengeluaran:**
    - Buka **Keuangan → Pengeluaran**.
    - Klik **"Tambah Pengeluaran"** untuk mencatat biaya operasional seperti ATK atau gaji.

### Manajemen Siswa

1.  **Tambah Kelas Dahulu:** Pastikan kelas sudah dibuat di menu **Manajemen → Kelas**.
2.  **Tambah Siswa Baru:** Buka **Manajemen → Siswa** dan klik **"Tambah Siswa"**. Saat siswa baru berhasil dibuat, tagihan SPP pertama untuk bulan berjalan akan dibuat secara otomatis.

### Laporan

1.  **Buka Halaman Laporan:** Pergi ke halaman yang laporannya ingin diunduh (misal: **Keuangan → Pemasukan** atau **Dashboard Keuangan**).
2.  **Klik "Unduh Laporan":** Sebuah dialog akan muncul.
3.  **Pilih Periode & Format:** Pilih jenis laporan (Bulanan/Tahunan), tentukan periodenya, lalu pilih format (Excel/PDF) atau pratinjau untuk mencetak.

---

## 🏁 Memulai

Proyek ini dapat dijalankan dalam dua mode: mode pengembangan untuk _developer_ dan mode _deployment_ lokal untuk klien (admin sekolah).

### 1. Untuk Developer (Setup Lokal)

Langkah-langkah ini ditujukan untuk developer yang ingin menjalankan proyek di lingkungan pengembangan.

**Prasyarat:**

- Node.js (v18 atau lebih baru)
- pnpm (atau npm/yarn)
- Akses ke database PostgreSQL (misalnya, buat proyek gratis di [Supabase](https://supabase.com/) untuk development).

**Instalasi:**

1.  **Clone repository ini:**

    ```bash
    git clone [https://github.com/kamaldev10/sistem-informasi-tk-melati-tranita.git](https://github.com/kamaldev10/sistem-informasi-tk-melati-tranita.git)
    cd sistem-informasi-tk-melati-tranita
    ```

2.  **Install dependensi:**

    ```bash
    pnpm install
    ```

3.  **Setup variabel lingkungan:**

    - Salin file `.env.example` menjadi `.env`.
    - Buka file `.env` dan isi variabel `DATABASE_URL` dengan _connection string_ dari database PostgreSQL development Anda.

    ```env
    DATABASE_URL="postgresql://user:password@host:port/database"
    ```

4.  **Jalankan migrasi database:**
    Perintah ini akan membuat semua tabel di database Anda sesuai dengan skema Prisma.

    ```bash
    npx prisma migrate dev
    ```

5.  **Jalankan server development:**
    ```bash
    pnpm dev
    ```
    Aplikasi sekarang akan berjalan di `http://localhost:3000`.

### 2. Untuk Klien (Deployment Lokal dengan Docker)

Langkah-langkah ini ditujukan untuk pengguna akhir (admin sekolah) yang ingin menjalankan aplikasi di satu komputer tanpa perlu instalasi teknis.

**Prasyarat:**

- **Docker Desktop:** Unduh dan instal dari [situs resmi Docker](https://www.docker.com/products/docker-desktop/).

**Cara Menjalankan Aplikasi:**

1.  **Unduh Folder Proyek:** Dapatkan folder proyek lengkap dari developer.

2.  **Buka Terminal:**

    - **Windows:** Buka folder proyek, klik kanan di area kosong sambil menahan tombol `Shift`, lalu pilih "Open PowerShell window here" atau "Buka di Terminal".
    - **Mac:** Buka aplikasi Terminal, ketik `cd `, lalu seret folder proyek ke jendela Terminal dan tekan `Enter`.

3.  **Jalankan Perintah:**
    Ketik satu perintah berikut di terminal dan tekan `Enter`.

    ```bash
    docker-compose up -d
    ```

    Perintah ini akan secara otomatis membangun dan menjalankan aplikasi beserta databasenya di latar belakang. Proses ini mungkin memakan waktu beberapa menit saat pertama kali dijalankan.

4.  **Akses Aplikasi:**
    Buka browser Anda (seperti Chrome atau Firefox) dan kunjungi alamat:
    **`http://localhost:3000`**

Aplikasi Anda sudah siap digunakan. Anda tidak perlu menjalankan perintah apa pun lagi, kecuali jika komputer di-_restart_. Jika komputer di-_restart_, cukup ulangi langkah 2 dan 3.

---

## ☁️ Deployment ke Vercel (Online)

Aplikasi ini dioptimalkan untuk _deployment_ di [Vercel](https://vercel.com/).

1.  **Hubungkan Repository Git:** Impor proyek Anda ke Vercel dari akun GitHub/GitLab/Bitbucket Anda.

2.  **Konfigurasi Environment Variables:**

    - Di dashboard proyek Vercel, pergi ke **Settings > Environment Variables**.
    - Tambahkan variabel `DATABASE_URL` dengan nilai _connection string_ dari database PostgreSQL **produksi** Anda.

3.  **Atur Perintah Build:**

    - Di **Settings > General**, cari bagian **Build & Development Settings**.
    - Pastikan **Build Command** diatur menjadi:

    ```bash
    npx prisma migrate deploy && next build
    ```

    Perintah ini memastikan database produksi Anda selalu diperbarui dengan skema terbaru sebelum aplikasi di-_build_.

4.  **Deploy:**
    Vercel akan secara otomatis melakukan _deployment_ setiap kali Anda melakukan `git push` ke _branch_ utama.\\

---

## 📁 Struktur Project

```
prisma/                         # Database
    ├── schema.prisma           # Database schema
    ├── migrations/             # Database migrations
    └── seed.ts                 # Seed Sample data
public/
└── icons/                      # public assets eg. favicon, icons, image
src/
├── app/
│   ├── api/                    # Folder API (Penting untuk ditambahkan)
│   │   ├── auth/
│   │   │   └── login/route.ts
│   │   │   └── register/route.ts
│   │   └── dashboard/
│   │   │   └── stats/route.ts
│   │   └── kelas/
│   │   │   └── [id]/route.ts
│   │   │   └── route.ts
│   │   └── keuangan/
│   │   │   └── pemasukan/route.ts
│   │   │   └── pengeluaran/route.ts
│   │   │   └── tagihan/route.ts
│   │   └── siswa/
│   │   │   └── [id]/route.ts
│   │   │   └── kelas/[kelasId]/route.ts
│   │   │   └── search/route.ts
│   │   │   └── route.ts
│   │
│   ├── auth/
│   ├── dashboard/
│
├── components/
│   ├── Auth/
│   ├── Dashboard/
│   ├── Kelas/
│   ├── Keuangan/
│   ├── Siswa/
│   │
│   ├── Layout/                 # Hanya untuk komponen tata letak utama
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   │
│   ├── shared/                 # komponen reusable non-layout
│   │   ├── CurrencyInput.tsx
│   │   ├── DeleteDialog.tsx
│   │   ├── ExportLaporanDialog.tsx
│   │   └── LaporanPreviewDialog.tsx
│   │
│   └── ui/
│       └── (komponen shadcn/ui)
│
└── lib/
    ├── api.ts                  # api helper
    ├── auth.ts                 # auth
    ├── contexts/               # React Contexts
    │   └── AuthContext.tsx
    ├── db.ts                   # db utils eg.prisma
    ├── types.ts                # declaration types
    ├── utils.ts                # helper
    └── validation.ts           # validation schema (zod)
```

<!-- ## 🔐 Login Credentials

Setelah database di-seed, gunakan akun berikut untuk login:

**Admin:**

- Email: `admin@sekolah.com`
- Password: `password123`

**Guru:**

- Email: `guru@sekolah.com`
- Password: `password123` -->

<!-- OLD BOY -->
<!-- # 🏫 SMKN 9 KOLAKA - Dashboard Manajemen Sekolah

Dashboard manajemen sekolah modern dengan sistem CRUD lengkap, built dengan Next.js 14 + TypeScript + Prisma.

## 🚀 Cara Install & Jalankan

### 1. Clone Repository

```bash
git clone https://github.com/isaabdllah/Dashboard-Sekolah---Next-JS.git
cd Dashboard-Sekolah---Next-JS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Setup database (SQLite)
npx prisma db push

# Isi database dengan data sample
npx prisma db seed
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi! 🎉

## 📱 Fitur yang Tersedia

### 🔑 Authentication

- **Login**: `/auth/login` - Login dengan kredensial di atas
- **Register**: `/auth/register` - Daftar akun baru

### 📊 Dashboard

- **Dashboard Utama**: `/dashboard` - Statistik dan charts real-time
- **Manajemen Siswa**: `/dashboard/siswa` - CRUD siswa lengkap
- **Manajemen Kelas**: `/dashboard/kelas` - CRUD kelas lengkap
- **Pelanggaran**: `/dashboard/pelanggaran` - Tracking pelanggaran siswa

## ✨ Cara Menggunakan

### 1. Login/Register

1. Buka `/auth/login`
2. Masukkan email dan password admin
3. Klik "Masuk"

### 2. Dashboard

- Lihat statistik real-time
- Charts menampilkan data dari database
- Klik "🔄 Refresh Data" untuk update charts

### 3. ALur Awal Aplikasi

- Tambah Kelas pada halaman manajemen kelas terlebih dahulu
- Lalu tambahkan siswa
- Buat tagihan untuk penginputan pembayaran Spp tiap awal bulan

### 3. Manajemen Siswa

- **Tambah**: Klik "Tambah Siswa" → isi form → simpan
- **Edit**: Klik ⋮ di tabel → "Edit" → ubah data → simpan
- **Hapus**: Klik ⋮ di tabel → "Hapus" → konfirmasi
- **Search**: Gunakan search box untuk cari siswa

### 4. Manajemen Kelas

- **Tambah**: Klik "Tambah Kelas" → isi form → simpan
- **Edit**: Klik ⋮ di tabel → "Edit" → ubah data → simpan
- **Hapus**: Klik ⋮ di tabel → "Hapus" → konfirmasi

### 5. Pelanggaran

- **Tambah**: Klik "Tambah Pelanggaran" → pilih siswa dari dropdown → isi form
- **Edit**: Klik ⋮ di tabel → "Edit" → ubah data → simpan
- **Detail**: Klik nama siswa untuk lihat detail pelanggaran

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **UI**: Tailwind CSS + Shadcn/UI
- **Charts**: Recharts
- **Auth**: JWT + bcryptjs

## 🔧 Commands

```bash
# Development
npm run dev          # Jalankan dev server
npm run build        # Build untuk production
npm start           # Jalankan production server

# Database
npx prisma studio    # Buka database viewer
npx prisma db seed   # Isi ulang sample data
npx prisma migrate dev  # Buat migration baru
```

## 🗄️ Database Sample

Setelah seed, database berisi:

- **2 Users** (1 Admin, 1 Guru)
- **5 Kelas** (TKJ, GP, MPLB, TAB, TEI)
- **5 Siswa** dengan data lengkap
- **5 Pelanggaran** dengan berbagai jenis dan tingkat

### 🏫 Jurusan SMK:

- **TKJ**: Teknik Komputer dan Jaringan
- **GP**: Geologi Pertambangan
- **MPLB**: Manajemen Perkantoran dan Layanan Bisnis
- **TAB**: Teknik Gambar Bangunan
- **TEI**: Teknik Elektronika Industri

## 🐛 Troubleshooting

### Error: Module not found

```bash
# Hapus node_modules dan install ulang
rm -rf node_modules package-lock.json
npm install
```

### Database error

```bash
# Reset database
npx prisma db push --force-reset
npx prisma db seed
```

### Port sudah digunakan

```bash
# Gunakan port lain
npm run dev -- -p 3001
```

## 📝 Cara Kontribusi

1. Fork repository ini
2. Buat branch fitur baru: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m "Tambah fitur xyz"`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

## 💡 Tips Development

- Database viewer: `npx prisma studio`
- Lihat API responses di browser DevTools
- Gunakan TypeScript untuk type safety
- Test CRUD operations di berbagai browser
- Cek responsive design di mobile

---

**SMKN 9 KOLAKA - Dashboard Manajemen Sekolah** 🎓 -->
