"use client";

import { useState, useEffect, useMemo } from "react";
import { AddTagihanDialog } from "@/components/Keuangan/Tagihan/AddTagihanDialog";
import { TagihanTable } from "@/components/Keuangan/Tagihan/TagihanTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { api } from "@/lib/api";
import type { Tagihan, Kelas } from "@/lib/types";
import { getMonth, getYear } from "date-fns";
import { RotateCcw } from "lucide-react";

const ITEMS_PER_PAGE = 30; // Menetapkan batas data per halaman

function TagihanPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-4 w-48" />
          <div className="flex items-center gap-4 pt-4">
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
  const [allTagihan, setAllTagihan] = useState<Tagihan[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk filter
  const [selectedBulan, setSelectedBulan] = useState<string>("all");
  const [selectedKelas, setSelectedKelas] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // State baru untuk paginasi
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tagihanData, kelasData] = await Promise.all([
        api.getTagihan(),
        api.getKelas(),
      ]);
      setAllTagihan(tagihanData);
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
    allTagihan.forEach((t) => {
      const date = new Date(t.tanggalJatuhTempo);
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
    let filteredData = allTagihan;
    if (selectedStatus !== "all") {
      filteredData = filteredData.filter(
        (tagihan) => tagihan.status === selectedStatus
      );
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
    return filteredData;
  }, [selectedBulan, selectedKelas, selectedStatus, allTagihan]);

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
    setSelectedBulan("all");
    setSelectedKelas("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  // Reset halaman ke 1 setiap kali filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBulan, selectedKelas, selectedStatus]);

  if (loading) {
    return <TagihanPageSkeleton />;
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
        <AddTagihanDialog onTagihanAdded={loadData} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tagihan</CardTitle>
          <CardDescription>
            Menampilkan {filteredTagihan.length} dari {allTagihan.length} total
            tagihan.
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
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="BELUM_LUNAS">Belum Lunas</SelectItem>
                <SelectItem value="LUNAS">Lunas</SelectItem>
                <SelectItem value="TERLAMBAT">Terlambat</SelectItem>
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
