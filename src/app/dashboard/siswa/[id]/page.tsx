"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Cake, MapPin, Phone, School } from "lucide-react";
import { api } from "@/lib/api";
import type { Siswa } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { RiwayatTagihanTable } from "@/components/Siswa/RiwayatTagihanTable";
import BackButton from "../../../../components/Layout/BackButton";

// Komponen Skeleton untuk tampilan loading
function SiswaDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function SiswaDetailPage() {
  const params = useParams();
  const siswaId = params.id as string;

  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (siswaId) {
      const fetchSiswa = async () => {
        try {
          const data = await api.getSiswaById(siswaId);
          setSiswa(data);
        } catch (error) {
          console.error("Error fetching siswa details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSiswa();
    }
  }, [siswaId]);

  if (loading) {
    return <SiswaDetailSkeleton />;
  }

  if (!siswa) {
    return <div className="text-center">Siswa tidak ditemukan.</div>;
  }

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header Profil */}
      <BackButton className="mb-2">Kembali</BackButton>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
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

      {/* Kartu Detail */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kelas</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {typeof siswa.kelas === "object" ? siswa.kelas.nama : "-"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tanggal Lahir</CardTitle>
            <Cake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatDate(siswa.tanggalLahir)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Orang Tua/Wali
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{siswa.orangTua}</div>
          </CardContent>
        </Card>
      </div>

      {/* Riwayat Tagihan */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Tagihan</CardTitle>
        </CardHeader>
        <CardContent>
          <RiwayatTagihanTable tagihan={siswa.tagihan || []} />
        </CardContent>
      </Card>
    </div>
  );
}
