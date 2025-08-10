"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lightbulb, RotateCcw } from "lucide-react";
import useSWR from "swr";
import { api } from "@/lib/api";
import type { Kategori } from "@/lib/types";
import { KategoriTable } from "@/components/Dashboard/Pengaturan/Kategori/KategoriTable";
import { AddKategoriDialog } from "@/components//Dashboard/Pengaturan/Kategori/AddKategoriDialog";
import { Skeleton } from "@/components/ui/skeleton";

const kategoriFetcher = (url: string) => api.getKategori();

function KategoriPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Manajemen Kategori
            </h2>
            <p className="text-muted-foreground">
              Kelola kategori untuk transaksi pemasukan dan pengeluaran.
            </p>
          </div>{" "}
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>
      <Alert variant="info">
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Informasi</AlertTitle>
        <AlertDescription>
          Kategori yang Anda buat di sini akan muncul sebagai pilihan saat
          mencatat transaksi pemasukan atau pengeluaran.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
          <div className="pt-4">
            <Skeleton className="h-10 w-48 rounded-md" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function KategoriPage() {
  const {
    data: kategori,
    error,
    isLoading,
  } = useSWR<Kategori[]>("/api/kategori", kategoriFetcher);
  const [filterTipe, setFilterTipe] = useState("all");

  const filteredKategori = useMemo(() => {
    if (!kategori) return [];
    if (filterTipe === "all") return kategori;
    return kategori.filter((k) => k.tipe === filterTipe);
  }, [kategori, filterTipe]);

  if (isLoading) {
    return <KategoriPageSkeleton />;
  }

  if (error || !kategori) {
    return <div className="text-center">Gagal memuat data kategori.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manajemen Kategori
          </h2>
          <p className="text-muted-foreground">
            Kelola kategori untuk transaksi pemasukan dan pengeluaran.
          </p>
        </div>
        <AddKategoriDialog />
      </div>

      <Alert variant="info">
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Informasi</AlertTitle>
        <AlertDescription>
          Kategori yang Anda buat di sini akan muncul sebagai pilihan saat
          mencatat transaksi pemasukan atau pengeluaran.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
          <CardDescription>
            Total {filteredKategori.length} dari {kategori.length} kategori
            ditampilkan.
          </CardDescription>
          <div className="flex items-center gap-2 pt-4">
            <Button
              variant={filterTipe === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterTipe("all")}
            >
              Semua Tipe
            </Button>
            <Button
              variant={filterTipe === "PENGELUARAN" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterTipe("PENGELUARAN")}
            >
              Pengeluaran
            </Button>
            <Button
              variant={filterTipe === "PEMASUKAN" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterTipe("PEMASUKAN")}
            >
              Pemasukan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <KategoriTable data={filteredKategori} />
        </CardContent>
      </Card>
    </div>
  );
}
