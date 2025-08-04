"use client";

import { useState, useEffect, useMemo } from "react";
import { PemasukanTable } from "@/components/Keuangan/Pemasukan/PemasukanTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Pemasukan, Kelas } from "@/lib/types";
import { getMonth, getYear } from "date-fns";
import { Search, RotateCcw, Download } from "lucide-react";
import {
  ExportLaporanDialog,
  type ExportColumn,
} from "@/components/Layout/ExportLaporanDialog";
import { formatDate } from "@/lib/utils";

const ITEMS_PER_PAGE = 30; // Batas data per halaman

// Definisikan kolom untuk ekspor laporan pemasukan
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

function PemasukanPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <Skeleton className="h-10 w-full sm:w-64" />
            <Skeleton className="h-10 w-full sm:w-48" />
            <Skeleton className="h-10 w-full sm:w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function PemasukanPage() {
  const [allPemasukan, setAllPemasukan] = useState<Pemasukan[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk filter dan pencarian
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBulan, setSelectedBulan] = useState<string>("all");
  const [selectedKelas, setSelectedKelas] = useState<string>("all");

  // State untuk paginasi
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pemasukanData, kelasData] = await Promise.all([
        api.getPemasukan(),
        api.getKelas(),
      ]);
      setAllPemasukan(pemasukanData);
      setKelas(kelasData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const bulanOptions = useMemo(() => {
    const bulanSet = new Set<string>();
    allPemasukan.forEach((p) => {
      const date = new Date(p.tanggal);
      const bulanKey = `${getYear(date)}-${getMonth(date)}`;
      bulanSet.add(bulanKey);
    });
    return Array.from(bulanSet)
      .map((key) => {
        const [year, month] = key.split("-");
        const date = new Date(parseInt(year), parseInt(month));
        return {
          value: key,
          label: date.toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          }),
        };
      })
      .sort((a, b) => b.value.localeCompare(a.value));
  }, [allPemasukan]);

  const filteredPemasukan = useMemo(() => {
    let filteredData = allPemasukan;

    if (selectedKelas !== "all") {
      filteredData = filteredData.filter(
        (p) => p.tagihan?.siswa?.kelas?.id === selectedKelas
      );
    }
    if (selectedBulan !== "all") {
      const [year, month] = selectedBulan.split("-").map(Number);
      filteredData = filteredData.filter((p) => {
        const tanggalPemasukan = new Date(p.tanggal);
        return (
          getYear(tanggalPemasukan) === year &&
          getMonth(tanggalPemasukan) === month
        );
      });
    }
    if (searchTerm) {
      filteredData = filteredData.filter((p) =>
        p.tagihan?.siswa?.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredData;
  }, [selectedBulan, selectedKelas, searchTerm, allPemasukan]);

  const totalPages = Math.ceil(filteredPemasukan.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPemasukan.slice(startIndex, endIndex);
  }, [currentPage, filteredPemasukan]);

  const handlePageChange = (direction: "next" | "prev") => {
    setCurrentPage((prev) => {
      if (direction === "next" && prev < totalPages) return prev + 1;
      if (direction === "prev" && prev > 1) return prev - 1;
      return prev;
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedBulan("all");
    setSelectedKelas("all");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBulan, selectedKelas, searchTerm]);

  if (loading) {
    return <PemasukanPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Riwayat Pemasukan
          </h2>
          <p className="text-muted-foreground">
            Catatan semua transaksi pemasukan yang telah terjadi.
          </p>
        </div>
        {/* --- PENGGUNAAN KOMPONEN EKSPOR --- */}
        <ExportLaporanDialog
          data={allPemasukan}
          columns={pemasukanColumns}
          filename="Laporan Pemasukan"
          title="Laporan Pemasukan"
        >
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Unduh Laporan
          </Button>
        </ExportLaporanDialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
          <CardDescription>
            Menampilkan {filteredPemasukan.length} dari {allPemasukan.length}{" "}
            total transaksi.
          </CardDescription>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedBulan} onValueChange={setSelectedBulan}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Bulan" />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                <SelectItem value="all">Semua Bulan</SelectItem>
                {bulanOptions.map((bulan) => (
                  <SelectItem key={bulan.value} value={bulan.value}>
                    {bulan.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedKelas} onValueChange={setSelectedKelas}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Kelas" />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                <SelectItem value="all">Semua Kelas</SelectItem>
                {kelas.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="sm:ml-auto"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <PemasukanTable
            data={paginatedData}
            onDataChanged={loadData}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
