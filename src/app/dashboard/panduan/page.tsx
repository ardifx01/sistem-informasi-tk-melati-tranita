"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCard,
  DollarSign,
  HandCoins,
  Users,
  School,
  Workflow,
} from "lucide-react";

const panduanItems = [
  {
    icon: Workflow,
    title: "Alur Kerja Keuangan Dasar",
    steps: [
      "Setiap awal bulan, buat 'Tagihan' SPP untuk semua siswa.",
      "Saat siswa membayar, catat 'Pemasukan' dengan melunasi tagihan yang ada.",
      "Catat semua 'Pengeluaran' sekolah untuk biaya operasional.",
      "Pantau semua ringkasan di 'Dashboard Utama'.",
    ],
  },
  {
    icon: CreditCard,
    title: "Membuat Tagihan Bulanan (SPP)",
    steps: [
      "Buka menu Keuangan > Tagihan.",
      "Klik tombol 'Buat Tagihan'.",
      "Pilih target 'Semua Kelas' atau kelas spesifik.",
      "Isi keterangan (contoh: SPP September 2025), jumlah, dan tanggal jatuh tempo.",
      "Klik 'Buat Tagihan' untuk men-generate tagihan secara otomatis.",
    ],
  },
  {
    icon: DollarSign,
    title: "Mencatat Pembayaran Siswa",
    steps: [
      "Buka menu Keuangan > Tagihan.",
      "Cari tagihan siswa yang berstatus 'Belum Lunas' atau 'Terlambat'.",
      "Klik ikon titik tiga (...) di ujung kanan baris tagihan.",
      "Pilih 'Bayar Tagihan'.",
      "Konfirmasi detail pembayaran, lalu klik 'Konfirmasi Pembayaran'.",
    ],
  },
  {
    icon: HandCoins,
    title: "Mencatat Pengeluaran Sekolah",
    steps: [
      "Buka menu Keuangan > Pengeluaran.",
      "Klik tombol 'Tambah Pengeluaran'.",
      "Isi formulir dengan detail tanggal, jumlah, kategori, dan keterangan.",
      "Klik 'Simpan' untuk mencatat transaksi.",
    ],
  },
  {
    icon: Users,
    title: "Manajemen Data Siswa",
    steps: [
      "Buka menu Manajemen > Siswa.",
      "Gunakan tombol 'Tambah Siswa' untuk mendaftarkan siswa baru.",
      "Gunakan filter dan pencarian untuk menemukan siswa.",
      "Klik ikon titik tiga (...) untuk mengedit atau menghapus data siswa.",
    ],
  },
  {
    icon: School,
    title: "Manajemen Data Kelas",
    steps: [
      "Buka menu Manajemen > Kelas.",
      "Klik 'Tambah Kelas' untuk membuat kelas baru (contoh: A, B1).",
      "Jumlah siswa di setiap kelas akan dihitung secara otomatis.",
      "Anda dapat mengedit atau menghapus kelas dari menu aksi.",
    ],
  },
];

export default function PanduanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panduan Aplikasi</h1>
        <p className="text-muted-foreground">
          Tata cara penggunaan fitur-fitur utama dalam sistem.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {panduanItems.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <item.icon className="h-8 w-8 text-primary" />
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="ml-4 list-decimal space-y-2 text-sm text-muted-foreground">
                {item.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
