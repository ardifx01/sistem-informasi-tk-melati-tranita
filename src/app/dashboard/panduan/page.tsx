"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CreditCard,
  DollarSign,
  HandCoins,
  Users,
  School,
  FileText,
  Workflow,
  Lightbulb,
} from "lucide-react";

// Data untuk item panduan di dalam accordion
const panduanItems = [
  {
    value: "item-1",
    title: "Manajemen Keuangan",
    icon: DollarSign,
    content: [
      {
        subtitle: "Membuat Tagihan Bulanan (SPP)",
        description:
          "Fitur ini digunakan untuk membuat tagihan SPP secara massal untuk satu atau semua kelas sekaligus.",
        steps: [
          "Buka menu Keuangan > Tagihan.",
          "Klik tombol 'Buat Tagihan'.",
          "Pilih target: 'Semua Kelas' atau kelas spesifik.",
          "Isi keterangan (contoh: SPP Oktober 2025), jumlah, dan tanggal jatuh tempo.",
          "Klik 'Buat Tagihan' untuk men-generate tagihan secara otomatis untuk semua siswa yang dipilih.",
        ],
      },
      {
        subtitle: "Mencatat Pembayaran Siswa",
        description:
          "Setelah tagihan dibuat, catat pembayaran saat siswa melunasi tagihannya.",
        steps: [
          "Buka menu Keuangan > Tagihan.",
          "Cari tagihan siswa yang berstatus 'Belum Lunas' atau 'Terlambat'.",
          "Klik ikon titik tiga (...) di ujung kanan baris, lalu pilih 'Bayar Tagihan'.",
          "Konfirmasi detail pembayaran, lalu klik 'Konfirmasi Pembayaran'. Status tagihan akan otomatis berubah menjadi 'Lunas'.",
        ],
      },
      {
        subtitle: "Mencatat Pengeluaran Sekolah",
        description: "Catat semua biaya operasional sekolah di sini.",
        steps: [
          "Buka menu Keuangan > Pengeluaran.",
          "Klik tombol 'Tambah Pengeluaran'.",
          "Isi formulir dengan detail tanggal, jumlah, kategori, dan keterangan.",
          "Klik 'Simpan' untuk mencatat transaksi.",
        ],
      },
    ],
  },
  {
    value: "item-2",
    title: "Manajemen Siswa & Kelas",
    icon: Users,
    content: [
      {
        subtitle: "Mengelola Data Siswa",
        description:
          "Halaman ini adalah pusat data untuk semua siswa yang terdaftar.",
        steps: [
          "Buka menu Manajemen > Siswa.",
          "Gunakan tombol 'Tambah Siswa' untuk mendaftarkan siswa baru. Tagihan SPP pertama akan dibuat secara otomatis.",
          "Gunakan filter dan pencarian untuk menemukan siswa dengan cepat.",
          "Klik ikon titik tiga (...) untuk 'Lihat Detail', 'Edit', atau 'Hapus' data siswa.",
        ],
      },
      {
        subtitle: "Mengelola Data Kelas",
        description: "Kelola daftar kelas yang ada di sekolah.",
        steps: [
          "Buka menu Manajemen > Kelas.",
          "Klik 'Tambah Kelas' untuk membuat kelas baru (contoh: A, B1).",
          "Jumlah siswa di setiap kelas akan dihitung secara otomatis.",
          "Anda tidak dapat menghapus kelas jika masih ada siswa yang terdaftar di dalamnya.",
        ],
      },
    ],
  },
  {
    value: "item-3",
    title: "Laporan & Ekspor",
    icon: FileText,
    content: [
      {
        subtitle: "Mengunduh Laporan",
        description:
          "Anda dapat mengunduh laporan dalam format Excel atau PDF dari berbagai halaman.",
        steps: [
          "Pergi ke halaman yang ingin Anda ekspor (misal: Keuangan > Pemasukan).",
          "Klik tombol 'Unduh Laporan'.",
          "Di dalam dialog, pilih jenis laporan: 'Bulanan' atau 'Tahunan'.",
          "Pilih periode yang diinginkan (bulan atau tahun).",
          "Pilih format (Excel/PDF) untuk mengunduh, atau 'Pratinjau & Cetak' untuk melihatnya terlebih dahulu.",
        ],
      },
    ],
  },
];

export default function PanduanPage() {
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [reminderType, setReminderType] = useState<"bulanan" | "tahunan">(
    "bulanan"
  );

  useEffect(() => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const month = today.getMonth(); // 0 = Januari, 11 = Desember

    // Tampilkan pengingat jika tanggal 25 ke atas
    if (dayOfMonth >= 25) {
      setShowBackupReminder(true);
      // Jika bulan Desember, set pengingat menjadi tahunan
      if (month === 11) {
        setReminderType("tahunan");
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panduan Aplikasi</h1>
        <p className="text-muted-foreground">
          Tata cara penggunaan fitur-fitur utama dalam sistem.
        </p>
      </div>

      {/* Pengingat Backup Dinamis */}
      {showBackupReminder && (
        <Alert className="border-yellow-500 bg-yellow-50 text-yellow-800">
          <Lightbulb className="h-5 w-5 !text-yellow-600" />
          <AlertTitle className="font-bold">
            Pengingat Backup Data{" "}
            {reminderType === "tahunan" ? "Tahunan" : "Bulanan"}
          </AlertTitle>
          <AlertDescription>
            Ini adalah akhir {reminderType === "tahunan" ? "tahun" : "bulan"}.
            Kami sangat menyarankan Anda untuk mengunduh laporan keuangan
            sebagai cadangan data. Buka halaman
            <b> Ringkasan Keuangan</b> dan gunakan fitur 'Unduh Laporan'.
          </AlertDescription>
        </Alert>
      )}

      <Alert className="border-blue-500 bg-blue-50 text-blue-800">
        <Workflow className="h-5 w-5 !text-blue-600" />
        <AlertTitle className="font-bold">Alur Kerja Utama Keuangan</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              <b>Buat Tagihan:</b> Setiap awal bulan, buat tagihan SPP untuk
              semua siswa melalui menu 'Tagihan'.
            </li>
            <li>
              <b>Catat Pembayaran:</b> Saat siswa membayar, lunasi tagihan
              mereka melalui menu 'Tagihan'. Ini akan otomatis membuat catatan
              'Pemasukan'.
            </li>
            <li>
              <b>Catat Pengeluaran:</b> Catat semua biaya operasional melalui
              menu 'Pengeluaran'.
            </li>
            <li>
              <b>Pantau:</b> Lihat ringkasan lengkap di 'Dashboard Utama' atau
              'Ringkasan Keuangan'.
            </li>
          </ol>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Panduan Detail per Fitur</CardTitle>
          <CardDescription>
            Klik pada setiap bagian untuk melihat detail langkah-langkahnya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {panduanItems.map((item) => (
              <AccordionItem value={item.value} key={item.title}>
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-6 w-6 text-primary" />
                    {item.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pl-4 pt-2">
                  {item.content.map((section) => (
                    <div key={section.subtitle}>
                      <h4 className="font-semibold">{section.subtitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                      <ol className="ml-4 mt-2 list-decimal space-y-1 text-sm">
                        {section.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
