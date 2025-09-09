"use client";

export const dynamic = "force-dynamic";

import { StatCard } from "@/components/Dashboard/Utama/StatCard";
import { TrenKeuangan } from "@/components/Dashboard/Utama/TrenKeuangan";
import { RecentTransactions } from "@/components/Dashboard/Keuangan/Dashboard/RecentTransactions";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Wallet,
  BanknoteArrowUp,
  UserX,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import useSWR from "swr";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SiswaChart } from "@/components/Dashboard/Utama/SiswaChart";
import { GenderRatioChart } from "@/components/Dashboard/Utama/GenderRatioChart";

// Komponen Skeleton untuk tampilan loading
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
      {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Skeleton className="h-[400px] w-full rounded-lg lg:col-span-3" />
        <Skeleton className="h-[400px] w-full rounded-lg lg:col-span-2" />
      </div> */}
      <div className="grid grid-cols-1 gap-6">
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

const fetcher = (url: string) => api.getDashboardStats();

export default function DashboardPage() {
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR<DashboardStats>("/api/dashboard/stats", fetcher, {
    refreshInterval: 30000,
  });

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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error: {error.message}</p>
        <p>
          Gagal memuat data dashboard. Coba muat ulang halaman atau coba lagi
          nanti.
        </p>
      </div>
    );
  }

  if (!stats || !stats.overview || !stats.recentTransactions) {
    return (
      <div className="text-center p-8">
        <p className="text-yellow-600">
          Data tidak lengkap atau belum tersedia.
        </p>
        <p>Coba muat ulang halaman atau hubungi administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Utama</h1>
          <p className="text-muted-foreground">
            Ringkasan umum data siswa, kelas dan keuangan sekolah.
          </p>
        </div>
        <RefreshButton mutateKeys="/api/dashboard/stats" />
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
            Kami sangat menyarankan Anda untuk mengunduh laporan keuangan Anda .
          </AlertDescription>
        </Alert>
      )}

      {stats.overview.saldoSaatIni < 0 && (
        <Alert variant="destructive" className="bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-bold">
            Peringatan: Saldo Minus!
          </AlertTitle>
          <AlertDescription>
            Total pengeluaran telah melebihi total pemasukan. Mohon periksa
            kembali transaksi Anda.
          </AlertDescription>
        </Alert>
      )}

      {/* Kartu Statistik Utama (Paling Penting) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Siswa"
          value={stats.overview.totalSiswa || 0}
          icon={Users}
          description="Jumlah siswa aktif terdaftar"
          className="text-yellow-600 border-yellow-600 bg-yellow-50"
        />
        <StatCard
          title="Siswa Belum Bayar"
          value={stats.overview.totalSiswaBelumBayar || 0}
          icon={UserX}
          description="Siswa dengan tunggakan"
          className="text-red-600 border-red-600 bg-red-100"
        />
        <StatCard
          title="Pemasukan Tahun Ini"
          value={stats.overview.pemasukanTahunIni || 0}
          icon={BanknoteArrowUp}
          description="Total pemasukan tahun ini"
          isCurrency
          className="text-green-600 border-green-600 bg-green-50"
        />
        <StatCard
          title="Pengeluaran Tahun Ini"
          value={stats.overview.pengeluaranTahunIni || 0}
          icon={Wallet}
          description="Total pengeluaran tahun ini"
          isCurrency
          className="text-violet-600 border-violet-600 bg-violet-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SiswaChart />
        </div>
        <div className="lg:col-span-2">
          <GenderRatioChart />
        </div>
      </div>

      {/* Grafik Tren Keuangan (Gambaran Besar) */}
      <div className="grid grid-cols-1 gap-6">
        <TrenKeuangan />
      </div>

      {/* Tabel Transaksi Terbaru (Aktivitas Terkini) */}
      <div>
        <RecentTransactions data={stats.recentTransactions || []} />
      </div>
    </div>
  );
}
