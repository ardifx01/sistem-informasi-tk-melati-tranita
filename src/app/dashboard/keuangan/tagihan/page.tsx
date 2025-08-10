"use client";

import { useState, useEffect, useMemo } from "react";
import { AddTagihanDialog } from "@/components/Dashboard/Keuangan/Tagihan/AddTagihanDialog";
import { TagihanTable } from "@/components/Dashboard/Keuangan/Tagihan/TagihanTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "@/lib/api";
import type { Tagihan, Kelas } from "@/lib/types";
import { getMonth, getYear } from "date-fns";
import { Lightbulb, RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import useSWR from "swr";
import { RefreshButton } from "@/components/shared/RefreshButton";

const ITEMS_PER_PAGE = 30; // Menetapkan batas data per halaman

const tagihanFetcher = (url: string) => api.getTagihan();
const kelasFetcher = (url: string) => api.getKelas();

function TagihanPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manajemen Tagihan
          </h2>
          <p className="text-muted-foreground">
            Buat tagihan baru dan pantau status pembayaran siswa.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton
            mutateKeys={[
              "/api/kelas",
              "/api/keuangan/tagihan",
              "/api/keuangan/pemasukan",
              "/api/siswa",
              "/api/kelas",
            ]}
          />
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
      </div>
      <Alert variant="info">
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Alur Kerja Pembayaran</AlertTitle>
        <AlertDescription>
          Ini adalah pusat manajemen pembayaran. <b>Buat tagihan</b> di awal
          bulan untuk mencatat kewajiban membayar SPP siswa terlebih dahulu,
          kemudian <b>bayar tagihan</b> tersebut dari menu aksi di tabel.
          Setelah pembayaran berhasil, data akan otomatis tercatat di halaman{" "}
          <b>Riwayat Pemasukan</b>.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-4 w-48" />
          <div className="flex items-center gap-4 pt-4">
            <Skeleton className="h-10 w-56 rounded-md" />
            <Skeleton className="h-10 w-40 rounded-md" />
            <Skeleton className="h-10 w-40 rounded-md" />
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function TagihanPage() {
  const {
    data: allTagihan,
    error: tagihanError,
    isLoading: isTagihanLoading,
  } = useSWR<Tagihan[]>("/api/keuangan/tagihan", tagihanFetcher);
  const {
    data: kelas,
    error: kelasError,
    isLoading: isKelasLoading,
  } = useSWR<Kelas[]>("/api/kelas", kelasFetcher);

  // State untuk filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBulan, setSelectedBulan] = useState<string>("all");
  const [selectedKelas, setSelectedKelas] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // State baru untuk paginasi
  const [currentPage, setCurrentPage] = useState(1);

  const bulanOptions = useMemo(() => {
    if (!allTagihan) return [];
    const bulanSet = new Set<string>();
    allTagihan.forEach((p) => {
      const date = new Date(p.tanggalJatuhTempo);
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
  }, [allTagihan]);

  const filteredTagihan = useMemo(() => {
    if (!allTagihan) return [];

    let filteredData = allTagihan;
    if (selectedStatus !== "all") {
      if (selectedStatus === "LUNAS") {
        filteredData = filteredData.filter((t) => t.status === "LUNAS");
      } else if (selectedStatus === "BELUM_LUNAS") {
        // Menampilkan semua yang belum lunas (termasuk yang terlambat)
        filteredData = filteredData.filter((t) => t.status === "BELUM_LUNAS");
      }
    }
    if (selectedKelas !== "all") {
      filteredData = filteredData.filter(
        (tagihan) =>
          tagihan.siswa &&
          typeof tagihan.siswa.kelas === "object" &&
          tagihan.siswa.kelas.id === selectedKelas
      );
    }
    if (selectedBulan !== "all") {
      const [year, month] = selectedBulan.split("-").map(Number);
      filteredData = filteredData.filter((tagihan) => {
        const tanggalTagihan = new Date(tagihan.tanggalJatuhTempo);
        return (
          getYear(tanggalTagihan) === year && getMonth(tanggalTagihan) === month
        );
      });
    }
    if (searchTerm) {
      filteredData = filteredData.filter((p) =>
        p.siswa?.nama?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredData;
  }, [selectedBulan, selectedKelas, selectedStatus, allTagihan, searchTerm]);

  // --- LOGIKA PAGINASI BARU ---
  const totalPages = Math.ceil(filteredTagihan.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTagihan.slice(startIndex, endIndex);
  }, [currentPage, filteredTagihan]);

  // Handler untuk mengubah halaman
  const handlePageChange = (direction: "next" | "prev") => {
    setCurrentPage((prev) => {
      if (direction === "next" && prev < totalPages) return prev + 1;
      if (direction === "prev" && prev > 1) return prev - 1;
      return prev;
    });
  };

  // Handler untuk mereset semua filter
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedBulan("all");
    setSelectedKelas("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  // Reset halaman ke 1 setiap kali filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBulan, selectedKelas, selectedStatus, searchTerm]);

  if (isTagihanLoading || isKelasLoading) {
    return <TagihanPageSkeleton />;
  }

  if (tagihanError) {
    return <div className="text-center">Gagal memuat data tagihan</div>;
  }

  if (kelasError) {
    return <div className="text-center">Gagal memuat data kelas</div>;
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manajemen Tagihan
          </h2>
          <p className="text-muted-foreground">
            Buat tagihan baru dan pantau status pembayaran siswa.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton mutateKeys={["/api/kelas", "/api/keuangan/tagihan"]} />
          <AddTagihanDialog />
        </div>
      </div>
      <Alert variant="info">
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Alur Kerja Pembayaran</AlertTitle>
        <AlertDescription>
          Ini adalah pusat manajemen pembayaran. <b>Buat tagihan</b> di awal
          bulan untuk mencatat kewajiban membayar SPP siswa terlebih dahulu,
          kemudian <b>bayar tagihan</b> tersebut dari menu aksi di tabel.
          Setelah pembayaran berhasil, data akan otomatis tercatat di halaman{" "}
          <b>Riwayat Pemasukan</b>.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tagihan</CardTitle>
          <CardDescription>
            <div>
              <p>
                Menampilkan <strong>{filteredTagihan.length}</strong> dari{" "}
                <strong>{allTagihan?.length || 0}</strong> total tagihan.
              </p>
            </div>
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

            <Select value={selectedKelas} onValueChange={setSelectedKelas}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Kelas" />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                <SelectItem value="all">Semua Kelas</SelectItem>
                {kelas?.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="LUNAS">Lunas</SelectItem>
                <SelectItem value="BELUM_LUNAS">Belum Lunas</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="sm:ml-auto"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TagihanTable
            data={paginatedData}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </CardContent>
        <CardFooter>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-semibold">Keterangan:</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span>Lunas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
              <span>Belum Lunas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span>Terlambat</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
