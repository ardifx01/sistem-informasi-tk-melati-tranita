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
} from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

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

export default function KeuanganDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching financial stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <KeuanganDashboardSkeleton />;
  }

  if (!stats) {
    return <div className="text-center">Gagal memuat data keuangan.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Keuangan
        </h1>
        <p className="text-muted-foreground">
          Ringkasan kondisi keuangan sekolah secara keseluruhan.
        </p>
      </div>

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
