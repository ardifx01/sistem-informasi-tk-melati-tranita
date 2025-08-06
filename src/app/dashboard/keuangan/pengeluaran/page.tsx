"use client";

import { useState, useEffect, useMemo } from "react";
import { AddPengeluaranDialog } from "@/components/Keuangan/Pengeluaran/AddPengeluaranDialog";
import { PengeluaranTable } from "@/components/Keuangan/Pengeluaran/PengeluaranTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Pengeluaran, KategoriPengeluaran } from "@/lib/types";
import { getMonth, getYear } from "date-fns";
import { Download, Lightbulb, RotateCcw } from "lucide-react";
import {
  ExportColumn,
  ExportLaporanDialog,
} from "@/components/shared/ExportLaporanDialog";
import { formatDate } from "@/lib/utils";
import useSWR from "swr";

const ITEMS_PER_PAGE = 30;

// Opsi untuk filter kategori
const kategoriOptions: { value: KategoriPengeluaran; label: string }[] = [
  { value: "OPERASIONAL", label: "Operasional" },
  { value: "PERAWATAN_ASET", label: "Perawatan Aset" },
  { value: "KEGIATAN_SISWA", label: "Kegiatan Siswa" },
  { value: "ATK", label: "Alat Tulis Kantor" },
  { value: "GAJI_GURU", label: "Gaji Guru" },
  { value: "LAINNYA", label: "Lainnya" },
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

const pengeluaranFetcher = (url: string) => api.getPengeluaran();

function PengeluaranPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>
      <Alert variant="info">
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Informasi</AlertTitle>
        <AlertDescription>
          Gunakan halaman ini untuk mencatat semua transaksi pengeluaran,
          seperti pembelian ATK, pembayaran listrik, atau gaji guru.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
          <div className="flex items-center gap-4 pt-4">
            <Skeleton className="h-10 w-48 rounded-md" />
            <Skeleton className="h-10 w-48 rounded-md" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function PengeluaranPage() {
  const {
    data: allPengeluaran,
    error: pengeluaranError,
    isLoading: isPengeluaranLoading,
  } = useSWR<Pengeluaran[]>("/api/keuangan/pengeluaran", pengeluaranFetcher);

  // State untuk filter
  const [selectedBulan, setSelectedBulan] = useState<string>("all");
  const [selectedKategori, setSelectedKategori] = useState<string>("all");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Membuat daftar bulan unik dari data pengeluaran
  const bulanOptions = useMemo(() => {
    if (!allPengeluaran) return [];

    const bulanSet = new Set<string>();
    allPengeluaran.forEach((p) => {
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
  }, [allPengeluaran]);

  // Logika untuk memfilter data
  const filteredPengeluaran = useMemo(() => {
    if (!allPengeluaran) return [];

    let filteredData = allPengeluaran;

    if (selectedBulan !== "all") {
      const [year, month] = selectedBulan.split("-").map(Number);
      filteredData = filteredData.filter((p) => {
        const tanggalPengeluaran = new Date(p.tanggal);
        return (
          getYear(tanggalPengeluaran) === year &&
          getMonth(tanggalPengeluaran) === month
        );
      });
    }

    if (selectedKategori !== "all") {
      filteredData = filteredData.filter(
        (p) => p.kategori === selectedKategori
      );
    }

    return filteredData;
  }, [selectedBulan, selectedKategori, allPengeluaran]);

  // Logic for pagination
  const totalPages =
    Math.ceil(filteredPengeluaran.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPengeluaran.slice(startIndex, endIndex);
  }, [currentPage, filteredPengeluaran]);

  const handlePageChange = (direction: "next" | "prev") => {
    setCurrentPage((prev) => {
      if (direction === "next" && prev < totalPages) return prev + 1;
      if (direction === "prev" && prev > 1) return prev - 1;
      return prev;
    });
  };

  const handleResetFilters = () => {
    setSelectedBulan("all");
    setSelectedKategori("all");
    setCurrentPage(1);
  };

  // Reset halaman ke 1 setiap kali filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBulan, selectedKategori]);

  if (isPengeluaranLoading) {
    return <PengeluaranPageSkeleton />;
  }

  if (pengeluaranError) {
    return <div className="text-center">Gagal memuat data pengeluaran</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manajemen Pengeluaran
          </h2>
          <p className="text-muted-foreground">
            Catat semua biaya operasional dan pengeluaran sekolah.
          </p>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <ExportLaporanDialog
            data={allPengeluaran}
            columns={pengeluaranColumns}
            filename="Laporan Pengeluaran"
            title="Laporan Pengeluaran"
          >
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Unduh Laporan
            </Button>
          </ExportLaporanDialog>
          <AddPengeluaranDialog />
        </div>
      </div>
      <Alert variant="info">
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Informasi</AlertTitle>
        <AlertDescription>
          Gunakan halaman ini untuk mencatat semua transaksi pengeluaran,
          seperti pembelian ATK, pembayaran listrik, atau gaji guru.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
          <CardDescription>
            Menampilkan<strong> {filteredPengeluaran.length} </strong> dari{" "}
            <strong> {allPengeluaran?.length || 0} </strong>total transaksi.
          </CardDescription>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
            <Select value={selectedBulan} onValueChange={setSelectedBulan}>
              <SelectTrigger className="w-full sm:w-[200px]">
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
            <Select
              value={selectedKategori}
              onValueChange={setSelectedKategori}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {kategoriOptions.map((kategori) => (
                  <SelectItem key={kategori.value} value={kategori.value}>
                    {kategori.label}
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
          <PengeluaranTable
            data={paginatedData}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
