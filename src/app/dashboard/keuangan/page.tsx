"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/Dashboard/Utama/StatCard";
import { TrenKeuangan } from "@/components/Dashboard/Keuangan/Dashboard/TrenKeuangan";
import { KategoriPengeluaranChart } from "@/components/Dashboard/Keuangan/Dashboard/KategoriPengeluaranChart";
import { RecentTransactions } from "@/components/Dashboard/Keuangan/Dashboard/RecentTransactions";
import { TunggakanTeratas } from "@/components/Dashboard/Keuangan/Dashboard/TunggakanTeratas";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Wallet,
  BanknoteArrowDown,
  BanknoteArrowUp,
  UserX,
  Download,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardStats, Pemasukan, Pengeluaran } from "@/lib/types";
import {
  ExportLaporanDialog,
  type ExportColumn,
} from "@/components/shared/ExportLaporanDialog";
import { formatDate } from "@/lib/utils";
import useSWR from "swr";
import { RefreshButton } from "@/components/shared/RefreshButton";

// Komponen Skeleton
function KeuanganDashboardSkeleton() {
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
        </div>{" "}
        <div className="flex items-center gap-4">
          <RefreshButton
            mutateKeys={[
              "/api/dashboard/stats",
              "/api/keuangan/pemasukan",
              "/api/keuangan/pengeluaran",
            ]}
          />
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>{" "}
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

// Definisi kolom untuk ekspor
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

// Fungsi fetcher untuk SWR
const statsFetcher = (url: string) => api.getDashboardStats();
const pemasukanFetcher = (url: string) => api.getPemasukan();
const pengeluaranFetcher = (url: string) => api.getPengeluaran();

export default function KeuanganDashboardPage() {
  // Menggunakan SWR untuk mengambil semua data yang dibutuhkan
  const {
    data: stats,
    error: statsError,
    isLoading: isLoadingStats,
  } = useSWR<DashboardStats>("/api/dashboard/stats", statsFetcher);

  const {
    data: allPemasukan,
    error: pemasukanError,
    isLoading: isPemasukanLoading,
  } = useSWR<Pemasukan[]>("/api/keuangan/pemasukan", pemasukanFetcher);

  const {
    data: allPengeluaran,
    error: pengeluaranError,
    isLoading: isLoadingPengeluaran,
  } = useSWR<Pengeluaran[]>("/api/keuangan/pengeluaran", pengeluaranFetcher);

  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [reminderType, setReminderType] = useState<"bulanan" | "tahunan">(
    "bulanan"
  );

  useEffect(() => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const month = today.getMonth();

    if (dayOfMonth >= 25) {
      setShowBackupReminder(true);
      if (month === 11) {
        setReminderType("tahunan");
      }
    }
  }, []);

  const isLoading =
    isLoadingStats || isPemasukanLoading || isLoadingPengeluaran;
  const hasError = statsError || pemasukanError || pengeluaranError;

  if (isLoading) {
    return <KeuanganDashboardSkeleton />;
  }

  if (hasError || !stats || !allPemasukan || !allPengeluaran) {
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
        <div className="flex gap-4 items-center">
          <RefreshButton
            mutateKeys={[
              "/api/dashboard/stats",
              "/api/keuangan/pemasukan",
              "/api/keuangan/pengeluaran",
            ]}
          />
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
      </div>

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
            sebagai cadangan data.
          </AlertDescription>
        </Alert>
      )}

      {stats.overview.saldoSaatIni < 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Peringatan: Saldo Minus!</AlertTitle>
          <AlertDescription>
            Total pengeluaran telah melebihi total pemasukan. Mohon periksa
            kembali transaksi Anda.
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
          className="text-violet-600 border-violet-600"
        />
        <StatCard
          title="Pemasukan Bulan Ini"
          value={stats.overview.pemasukanBulanIni}
          icon={BanknoteArrowUp}
          description="Total pemasukan bulan ini"
          isCurrency
          className="text-green-600 border-green-600"
        />
        <StatCard
          title="Pengeluaran Bulan Ini"
          value={stats.overview.pengeluaranBulanIni}
          icon={BanknoteArrowDown}
          description="Total pengeluaran bulan ini"
          isCurrency
          className="text-orange-600 border-orange-600"
        />
        <StatCard
          title="Siswa Belum Bayar"
          value={stats.overview.totalSiswaBelumBayar}
          icon={UserX}
          description="Siswa dengan tunggakan"
          className="text-red-600 border-red-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TunggakanTeratas data={stats.tunggakanTeratas} />
        </div>
        <div className="lg:col-span-2">
          <KategoriPengeluaranChart
            data={stats.kategoriPengeluaranDistribution}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 ">
        <TrenKeuangan />
      </div>

      <div className="grid grid-cols-1 ">
        <RecentTransactions data={stats.recentTransactions} />
      </div>
    </div>
  );
}
