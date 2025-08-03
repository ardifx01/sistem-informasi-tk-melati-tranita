"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/Dashboard/StatCard";
import { TrenKeuangan } from "@/components/Dashboard/TrenKeuangan";
import { SiswaChart } from "@/components/Dashboard/SiswaChart";
import { GenderRatioChart } from "@/components/Dashboard/GenderRatioChart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Wallet,
  BanknoteArrowDown,
  BanknoteArrowUp,
  UserX,
} from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import { KategoriPengeluaranChart } from "@/components/Keuangan/KategoriPengeluaranChart";
import { RecentTransactions } from "@/components/Keuangan/RecentTransaction";

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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Skeleton className="h-[400px] w-full rounded-lg lg:col-span-3" />
        <Skeleton className="h-[400px] w-full rounded-lg lg:col-span-2" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!stats) {
    return <div className="text-center">Gagal memuat data dashboard.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Utama</h1>
        <p className="text-muted-foreground">
          Ringkasan data siswa dan kondisi keuangan sekolah.
        </p>
      </div>

      {/* Kartu Statistik Utama */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Siswa"
          value={stats.overview.totalSiswa}
          icon={Users}
          description="Jumlah siswa aktif terdaftar"
          className="text-gray-600 border-gray-600"
        />
        <StatCard
          title="Siswa Belum Bayar"
          value={stats.overview.totalSiswaBelumBayar}
          icon={UserX}
          description="Siswa dengan tunggakan"
          className="text-red-600 border-red-600"
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
          title="Saldo Kas Saat Ini"
          value={stats.overview.saldoSaatIni}
          icon={Wallet}
          description="Total kas yang tersedia"
          className="text-violet-600 border-vioet-600"
          isCurrency
        />
      </div>

      {/* Grafik Keuangan */}
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

      {/* Grafik Siswa */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SiswaChart />
        <GenderRatioChart />
      </div>

      {/* Tabel Transaksi Terbaru */}
      <div>
        <RecentTransactions data={stats.recentTransactions} />
      </div>
    </div>
  );
}
