"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api } from "@/lib/api";
import type { Pemasukan, Pengeluaran } from "@/lib/types";

// Tipe data untuk grafik
interface TrendData {
  bulan: string;
  pemasukan: number;
  pengeluaran: number;
}

// Props untuk komponen
interface TrenKeuanganProps {
  refreshKey?: number;
}

// Fungsi untuk memformat angka menjadi Rupiah
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

// Tooltip kustom untuk menampilkan data dengan format Rupiah
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="font-bold text-green-500">
              {formatRupiah(payload[0].value)}
            </span>
            <span className="font-bold text-red-500">
              {formatRupiah(payload[1].value)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function TrenKeuangan({ refreshKey }: TrenKeuanganProps) {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Ambil semua data pemasukan dan pengeluaran sekali jalan
        const [pemasukanData, pengeluaranData] = await Promise.all([
          api.getPemasukan(),
          api.getPengeluaran(),
        ]);

        const monthlyData: TrendData[] = [];
        const currentDate = new Date();

        for (let i = 11; i >= 0; i--) {
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
          );
          const monthName = date.toLocaleDateString("id-ID", {
            month: "short",
          });
          const year = date.getFullYear();
          const month = date.getMonth();

          // Hitung total pemasukan untuk bulan ini
          const totalPemasukan = pemasukanData
            .filter((item: Pemasukan) => {
              const itemDate = new Date(item.tanggal);
              return (
                itemDate.getFullYear() === year && itemDate.getMonth() === month
              );
            })
            .reduce((sum, item) => sum + item.jumlah, 0);

          // Hitung total pengeluaran untuk bulan ini
          const totalPengeluaran = pengeluaranData
            .filter((item: Pengeluaran) => {
              const itemDate = new Date(item.tanggal);
              return (
                itemDate.getFullYear() === year && itemDate.getMonth() === month
              );
            })
            .reduce((sum, item) => sum + item.jumlah, 0);

          monthlyData.push({
            bulan: monthName,
            pemasukan: totalPemasukan,
            pengeluaran: totalPengeluaran,
          });
        }

        setData(monthlyData);
      } catch (error) {
        console.error("Error fetching financial trend data:", error);
        // Data fallback jika terjadi error
        setData(
          Array(12)
            .fill(0)
            .map((_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - (11 - i));
              return {
                bulan: date.toLocaleDateString("id-ID", { month: "short" }),
                pemasukan: 0,
                pengeluaran: 0,
              };
            })
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  if (loading) {
    return (
      <Card className="col-auto">
        <CardHeader>
          <CardTitle>Tren Keuangan Tahunan</CardTitle>
          <CardDescription>Memuat data...</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            Memuat data grafik...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-auto">
      <CardHeader>
        <CardTitle>Tren Keuangan Tahunan</CardTitle>
        <CardDescription>
          Perbandingan pemasukan dan pengeluaran selama 12 bulan terakhir
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer className="p-3" width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="bulan"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${formatRupiah(value as number)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="pemasukan"
              stroke="#22c55e" // Hijau
              strokeWidth={2}
              dot={{ r: 4, fill: "#22c55e" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="pengeluaran"
              stroke="#ef4444" // Merah
              strokeWidth={2}
              dot={{ r: 4, fill: "#ef4444" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
