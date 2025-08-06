"use client";

import { useState, useEffect, useMemo } from "react";
import { AddSiswaDialog } from "@/components/Siswa/AddSiswaDialog";
import { SiswaTable } from "@/components/Siswa/SiswaTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, Lightbulb } from "lucide-react";
import { api } from "@/lib/api";
import type { Siswa as SiswaType, Kelas } from "@/lib/types";
import useSWR from "swr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SiswaWithTunggakan extends SiswaType {
  jumlahTunggakan: number;
  kelas: Kelas;
}

const ITEMS_PER_PAGE = 20;

function SiswaPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      <Alert variant="info">
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Informasi</AlertTitle>
        <AlertDescription>
          Ini adalah halaman untuk mengelola semua data siswa. Saat Anda
          menambahkan siswa baru, sistem akan secara otomatis membuat tagihan
          SPP pertama untuk bulan berjalan.
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-4 w-48" />
          <div className="flex items-center gap-4 pt-4">
            <Skeleton className="h-10 flex-1 max-w-sm rounded-md" />
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Status Pembayaran</TableHead>
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead className="w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Definisikan fetcher untuk SWR
const siswaFetcher = () => api.getSiswa();
const kelasFetcher = (url: string) => api.getKelas();

export default function SiswaPage() {
  const {
    data: allSiswa,
    error: siswaError,
    isLoading: isSiswaLoading,
  } = useSWR("/api/siswa", siswaFetcher as () => Promise<SiswaWithTunggakan[]>);

  const {
    data: kelas,
    error: kelasError,
    isLoading: isKelasLoading,
  } = useSWR<Kelas[]>("/api/kelas", kelasFetcher);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSiswa = useMemo(() => {
    if (!allSiswa) return [];
    let filtered = allSiswa;
    if (selectedKelas !== "all") {
      filtered = filtered.filter((s) => s.kelasId === selectedKelas);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.nis.includes(searchTerm)
      );
    }
    return filtered;
  }, [searchTerm, selectedKelas, allSiswa]);

  const totalPages = Math.ceil(filteredSiswa.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = useMemo(() => {
    return filteredSiswa.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredSiswa, startIndex]);

  const handlePageChange = (direction: "next" | "prev") => {
    setCurrentPage((prev) => {
      if (direction === "next" && prev < totalPages) return prev + 1;
      if (direction === "prev" && prev > 1) return prev - 1;
      return prev;
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedKelas("all");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedKelas]);

  if (isSiswaLoading || isKelasLoading) {
    return <SiswaPageSkeleton />;
  }

  if (siswaError || kelasError) {
    return <div className="text-center">Gagal memuat data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Siswa</h2>
          <p className="text-muted-foreground">
            Kelola data siswa, kelas, dan status pembayaran.
          </p>
        </div>
        <AddSiswaDialog />
      </div>
      <Alert variant="info">
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Informasi</AlertTitle>
        <AlertDescription>
          Ini adalah halaman untuk mengelola semua data siswa. Saat Anda
          menambahkan siswa baru, sistem akan secara otomatis membuat tagihan
          SPP pertama untuk bulan berjalan.
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
          <CardDescription>
            Total {filteredSiswa.length} dari {allSiswa?.length || 0} siswa
            ditampilkan.
          </CardDescription>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari siswa (nama, NIS)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedKelas} onValueChange={setSelectedKelas}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {kelas?.map((k) => (
                  <SelectItem key={k.id} value={k.id} className="font-semibold">
                    Kelas {k.nama}
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
          <SiswaTable
            data={paginatedData}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            startIndex={startIndex}
          />
        </CardContent>
      </Card>
    </div>
  );
}
