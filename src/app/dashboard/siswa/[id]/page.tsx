"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User,
  Cake,
  MapPin,
  Phone,
  School,
  Edit,
  Plus,
  Banknote,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Siswa } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { RiwayatTagihanTable } from "@/components/Dashboard/Siswa/RiwayatTagihanTable";
import { EditSiswaDialog } from "@/components/Dashboard/Siswa/EditSiswaDialog";
import { AddSingleTagihanDialog } from "@/components/Dashboard/Siswa/AddSingleTagihanDialog";
import useSWR, { mutate } from "swr";

// Komponen Skeleton untuk tampilan loading
function SiswaDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton for Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-md" />
          {/* <Skeleton className="h-10 w-36 rounded-md" /> */}
        </div>
      </div>

      {/* Skeleton for Info Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Siswa</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full " />
            <Skeleton className="h-12 w-full " />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Keuangan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Skeleton for History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Tagihan</CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-72" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

const fetcher = (url: string) => api.getSiswaById(url.split("/").pop()!);

export default function SiswaDetailPage() {
  const params = useParams();
  const siswaId = params.id as string;

  const {
    data: siswa,
    error,
    isLoading,
    mutate: mutateSiswa,
  } = useSWR<Siswa>(`/api/siswa/${siswaId}`, fetcher);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddTagihanOpen, setIsAddTagihanOpen] = useState(false);

  // Kalkulasi ringkasan keuangan
  const financialSummary = useMemo(() => {
    if (!siswa?.tagihan)
      return { totalTagihan: 0, totalTerbayar: 0, sisaTunggakan: 0 };

    const totalTagihan = siswa.tagihan.reduce(
      (sum, t) => sum + t.jumlahTagihan,
      0
    );
    const totalTerbayar = siswa.tagihan
      .filter((t) => t.status === "LUNAS" && t.pemasukan)
      .reduce((sum, t) => sum + (t.pemasukan?.jumlah || 0), 0);

    return {
      totalTagihan,
      totalTerbayar,
      sisaTunggakan: totalTagihan - totalTerbayar,
    };
  }, [siswa]);

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleUpdateSuccess = () => {
    // Memuat ulang data siswa dan juga daftar siswa di halaman sebelumnya
    mutateSiswa();
    mutate("/api/siswa");
    setIsEditOpen(false);
    setIsAddTagihanOpen(false);
  };

  if (isLoading) {
    return <SiswaDetailSkeleton />;
  }

  if (error || !siswa) {
    return (
      <div className="text-center">
        Siswa tidak ditemukan atau gagal memuat data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Profil & Aksi */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={`https://ui-avatars.com/api/?name=${siswa.nama}&background=random&size=128`}
            />
            <AvatarFallback>{getInitials(siswa.nama)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{siswa.nama}</h1>
            <p className="text-muted-foreground">NIS: {siswa.nis}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Siswa
          </Button>
          {/* <Button onClick={() => setIsAddTagihanOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Buat Tagihan Baru
          </Button> */}
        </div>
      </div>

      {/* Kartu Detail & Ringkasan Keuangan */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Siswa</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <School className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Kelas</p>
                <p className="font-semibold">
                  {typeof siswa.kelas === "object" ? siswa.kelas.nama : "-"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Cake className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Tanggal Lahir</p>
                <p className="font-semibold">
                  {formatDate(siswa.tanggalLahir)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Orang Tua/Wali</p>
                <p className="font-semibold">{siswa.orangTua}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Telepon</p>
                <p className="font-semibold">{siswa.telepon}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Alamat</p>
                <p className="font-semibold">{siswa.alamat}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Banknote className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Jumlah Spp</p>
                <p className="font-semibold">Rp {siswa.jumlahSpp}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Keuangan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Tagihan</p>
              <p className="text-2xl font-bold">
                Rp {financialSummary.totalTagihan.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Terbayar</p>
              <p className="text-2xl font-bold text-green-600">
                Rp {financialSummary.totalTerbayar.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sisa Tunggakan</p>
              <p className="text-2xl font-bold text-red-600">
                Rp {financialSummary.sisaTunggakan.toLocaleString("id-ID")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Riwayat Tagihan */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Tagihan</CardTitle>
          <CardDescription>
            Daftar semua tagihan dan status pembayarannya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RiwayatTagihanTable tagihan={siswa.tagihan || []} />
        </CardContent>
      </Card>

      {/* Dialog-dialog Aksi */}
      <EditSiswaDialog
        siswa={siswa}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSiswaUpdated={handleUpdateSuccess}
      />
      <AddSingleTagihanDialog
        siswaId={siswa.id}
        siswaNama={siswa.nama}
        open={isAddTagihanOpen}
        onOpenChange={setIsAddTagihanOpen}
        onTagihanAdded={handleUpdateSuccess}
      />
    </div>
  );
}
