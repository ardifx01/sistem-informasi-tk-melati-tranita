// app/dashboard/panduan/index.ts
import { DollarSign, Users, FileText, Tags, UserPlus } from "lucide-react";

// Alur kerja utama aplikasi (ringkasan singkat)
export const alurKerjaApp = [
  "Daftarkan akun pada halaman Register, lalu login dengan akun yang telah dibuat.",
  "Buat & daftarkan kelas pada halaman Manajemen Kelas.",
  "Tambahkan masing-masing siswa pada halaman Manajemen Siswa, sistem otomatis membuat tagihan pertama sesuai jumlah SPP.",
  "Buat kategori awal untuk pengeluaran & pemasukan pada halaman Manajemen Kategori.",
  "Setiap awal bulan, buat tagihan siswa secara massal atau per kelas.",
  "Setiap tagihan yang dibayarkan otomatis tercatat pada halaman Manajemen Pemasukan.",
  "Untuk mencatat pengeluaran, gunakan halaman Manajemen Pengeluaran.",
];

// Data accordion panduan detail
export const panduanItems = [
  {
    value: "item-1",
    title: "Registrasi & Login",
    icon: UserPlus,
    content: [
      {
        subtitle: "Membuat Akun",
        description:
          "Langkah awal untuk menggunakan aplikasi adalah mendaftar akun.",
        steps: [
          "Buka halaman Register.",
          "Isi data nama lengkap, email, dan password.",
          "Klik 'Daftar', lalu login menggunakan akun tersebut.",
        ],
      },
    ],
  },
  {
    value: "item-2",
    title: "Manajemen Keuangan",
    icon: DollarSign,
    content: [
      {
        subtitle: "Membuat Tagihan Bulanan (SPP)",
        description:
          "Fitur ini digunakan untuk membuat tagihan SPP secara massal. Nominal tagihan otomatis diambil dari SPP masing-masing siswa.",
        steps: [
          "Buka menu Keuangan > Tagihan.",
          "Klik tombol 'Buat Tagihan'.",
          "Pilih target: 'Semua Kelas' atau kelas tertentu.",
          "Isi keterangan (contoh: SPP Oktober 2025) dan tanggal jatuh tempo.",
          "Klik 'Buat Tagihan'.",
        ],
      },
      {
        subtitle: "Mencatat Pembayaran Siswa",
        description:
          "Setelah tagihan dibuat, catat pembayaran ketika siswa melunasi.",
        steps: [
          "Buka menu Keuangan > Tagihan.",
          "Cari tagihan dengan status 'Belum Lunas'.",
          "Klik aksi (...) > 'Bayar Tagihan'.",
          "Pilih kategori pembayaran, konfirmasi detail, klik 'Konfirmasi Pembayaran'.",
        ],
      },
      {
        subtitle: "Mencatat Pengeluaran",
        description:
          "Digunakan untuk mencatat semua biaya operasional sekolah.",
        steps: [
          "Buka menu Keuangan > Pengeluaran.",
          "Klik 'Tambah Pengeluaran'.",
          "Isi tanggal, jumlah, kategori, dan keterangan.",
          "Klik 'Simpan'.",
        ],
      },
    ],
  },
  {
    value: "item-3",
    title: "Manajemen Siswa & Kelas",
    icon: Users,
    content: [
      {
        subtitle: "Mengelola Data Siswa",
        description: "Pusat data semua siswa terdaftar.",
        steps: [
          "Buka menu Manajemen > Siswa.",
          "Klik 'Tambah Siswa', isi data & pilih tingkat SPP.",
          "Tagihan pertama bulan berjalan akan dibuat otomatis.",
        ],
      },
      {
        subtitle: "Mengelola Data Kelas",
        description: "Kelola daftar kelas yang ada.",
        steps: [
          "Buka menu Manajemen > Kelas.",
          "Klik 'Tambah Kelas' untuk menambahkan kelas baru.",
          "Kelas tidak dapat dihapus jika masih memiliki siswa.",
        ],
      },
    ],
  },
  {
    value: "item-4",
    title: "Manajemen Kategori",
    icon: Tags,
    content: [
      {
        subtitle: "Menambah & Mengelola Kategori",
        description:
          "Atur kategori pemasukan & pengeluaran sesuai kebutuhan sekolah.",
        steps: [
          "Buka menu Pengaturan > Kategori.",
          "Klik 'Tambah Kategori'.",
          "Isi nama kategori & pilih tipe (Pemasukan / Pengeluaran).",
        ],
      },
    ],
  },
  {
    value: "item-5",
    title: "Laporan & Ekspor",
    icon: FileText,
    content: [
      {
        subtitle: "Mengunduh Laporan",
        description: "Laporan dapat diunduh dalam format Excel atau PDF.",
        steps: [
          "Buka halaman Keuangan > Pemasukan atau Pengeluaran.",
          "Klik 'Unduh Laporan'.",
          "Pilih periode (bulanan/tahunan) & format (Excel/PDF).",
        ],
      },
    ],
  },
];
