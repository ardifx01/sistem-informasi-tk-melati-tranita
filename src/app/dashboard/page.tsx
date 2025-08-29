"use client";

export const dynamic = "force-dynamic";

import { StatCard } from "@/components/Dashboard/Utama/StatCard";
import { TrenKeuangan } from "@/components/Dashboard/Keuangan/Dashboard/TrenKeuangan";
import { RecentTransactions } from "@/components/Dashboard/Keuangan/Dashboard/RecentTransactions";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Wallet, BanknoteArrowUp, UserX } from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import useSWR from "swr";
import { RefreshButton } from "@/components/shared/RefreshButton";

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
    refreshInterval: 30000, // Opsional: otomatis refresh setiap 30 detik
  });

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

      {/* Kartu Statistik Utama (Paling Penting) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Siswa"
          value={stats.overview.totalSiswa || 0} // PERBAIKAN: Default value
          icon={Users}
          description="Jumlah siswa aktif terdaftar"
          className="text-gray-900 border-gray-900"
        />
        <StatCard
          title="Siswa Belum Bayar"
          value={stats.overview.totalSiswaBelumBayar || 0} // PERBAIKAN: Default value
          icon={UserX}
          description="Siswa dengan tunggakan"
          className="text-red-600 border-red-600"
        />
        <StatCard
          title="Pemasukan Bulan Ini"
          value={stats.overview.pemasukanBulanIni || 0} // PERBAIKAN: Default value
          icon={BanknoteArrowUp}
          description="Total pemasukan bulan ini"
          isCurrency
          className="text-green-600 border-green-600"
        />
        <StatCard
          title="Saldo Kas Saat Ini"
          value={stats.overview.saldoSaatIni || 0} // PERBAIKAN: Default value
          icon={Wallet}
          description="Total kas yang tersedia"
          isCurrency
          className="text-violet-600 border-violet-600"
        />
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
