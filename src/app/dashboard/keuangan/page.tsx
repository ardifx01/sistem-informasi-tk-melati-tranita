"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/Dashboard/StatCard";
import { TrenKeuangan } from "@/components/Dashboard/TrenKeuangan";
import { KategoriPengeluaranChart } from "@/components/Keuangan/Dashboard/KategoriPengeluaranChart";
import { RecentTransactions } from "@/components/Keuangan/Dashboard/RecentTransactions";
import { TunggakanTeratas } from "@/components/Keuangan/Dashboard/TunggakanTeratas";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  BanknoteArrowDown,
  BanknoteArrowUp,
  UserX,
  Download,
  Lightbulb,
} from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardStats, Pemasukan, Pengeluaran } from "@/lib/types";
import {
  ExportLaporanDialog,
  type ExportColumn,
} from "@/components/Layout/ExportLaporanDialog";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function KeuanganDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-72" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Skeleton className="h-[400px] w-full rounded-lg lg:col-span-3" />
        <Skeleton className="h-[400px] w-full rounded-lg lg:col-span-2" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}

const pemasukanColumns: ExportColumn<Pemasukan>[] = [
  {
    header: "Tanggal",
    accessor: (item) => formatDate(item.tanggal, "dd/MM/yyyy"),
  },
  {
    header: "Nama Siswa",
    accessor: (item) => item.tagihan?.siswa?.nama || "N/A",
  },
  {
    header: "Kelas",
    accessor: (item) => item.tagihan?.siswa?.kelas?.nama || "N/A",
  },
  { header: "Keterangan", accessor: (item) => item.keterangan },
  { header: "Kategori", accessor: (item) => item.kategori.replace("_", " ") },
  { header: "Jumlah", accessor: (item) => item.jumlah },
];

const pengeluaranColumns: ExportColumn<Pengeluaran>[] = [
  {
    header: "Tanggal",
    accessor: (item) => formatDate(item.tanggal, "dd/MM/yyyy"),
  },
  { header: "Keterangan", accessor: (item) => item.keterangan },
  { header: "Kategori", accessor: (item) => item.kategori.replace("_", " ") },
  { header: "Jumlah", accessor: (item) => item.jumlah },
];

export default function KeuanganDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [allPemasukan, setAllPemasukan] = useState<Pemasukan[]>([]);
  const [allPengeluaran, setAllPengeluaran] = useState<Pengeluaran[]>([]);

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

    const fetchAllData = async () => {
      try {
        // Ambil semua data yang dibutuhkan secara bersamaan
        const [statsData, pemasukanData, pengeluaranData] = await Promise.all([
          api.getDashboardStats(),
          api.getPemasukan(),
          api.getPengeluaran(),
        ]);
        setStats(statsData);
        setAllPemasukan(pemasukanData);
        setAllPengeluaran(pengeluaranData);
      } catch (error) {
        console.error("Error fetching financial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading) {
    return <KeuanganDashboardSkeleton />;
  }

  if (!stats) {
    return <div className="text-center">Gagal memuat data keuangan.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Keuangan
          </h1>
          <p className="text-muted-foreground">
            Ringkasan kondisi keuangan sekolah secara keseluruhan.
          </p>
        </div>

        <ExportLaporanDialog
          combinedData={{
            pemasukan: allPemasukan,
            pengeluaran: allPengeluaran,
          }}
          columns={{
            pemasukan: pemasukanColumns,
            pengeluaran: pengeluaranColumns,
          }}
          filename="Laporan Keuangan"
          title="Laporan Keuangan"
        >
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Unduh Laporan
          </Button>
        </ExportLaporanDialog>
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
            sebagai cadangan data. Gunakan fitur 'Unduh Laporan' untuk mengunduh
            laporan anda.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo Saat Ini"
          value={stats.overview.saldoSaatIni}
          icon={Wallet}
          description="Total kas yang tersedia"
          isCurrency
        />
        <StatCard
          title="Pemasukan Bulan Ini"
          value={stats.overview.pemasukanBulanIni}
          icon={BanknoteArrowUp}
          description="Total pemasukan bulan ini"
          isCurrency
          className="text-green-600"
        />
        <StatCard
          title="Pengeluaran Bulan Ini"
          value={stats.overview.pengeluaranBulanIni}
          icon={BanknoteArrowDown}
          description="Total pengeluaran bulan ini"
          isCurrency
          className="text-orange-600"
        />
        <StatCard
          title="Siswa Belum Bayar"
          value={stats.overview.totalSiswaBelumBayar}
          icon={UserX}
          description="Siswa dengan tunggakan"
          className="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TrenKeuangan />
        </div>
        <div className="lg:col-span-2">
          <KategoriPengeluaranChart
            data={stats.kategoriPengeluaranDistribution}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentTransactions data={stats.recentTransactions} />
        <TunggakanTeratas
          data={stats.tunggakanTeratas}
          tunggakanTeratas={[]}
          overview={{
            totalSiswa: 0,
            totalKelas: 0,
            totalUser: 0,
            totalPemasukan: 0,
            totalPengeluaran: 0,
            saldoSaatIni: 0,
            pemasukanBulanIni: 0,
            pengeluaranBulanIni: 0,
            totalSiswaBelumBayar: 0,
          }}
          genderDistribution={[]}
          classDistribution={[]}
          kategoriPengeluaranDistribution={[]}
          recentTransactions={[]}
        />
      </div>
    </div>
  );
}
