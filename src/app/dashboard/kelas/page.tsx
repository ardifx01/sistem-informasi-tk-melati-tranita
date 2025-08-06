"use client";

import { AddKelasDialog } from "@/components/Kelas/AddKelasDialog";
import { KelasTable } from "@/components/Kelas/KelasTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Kelas } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useSWR from "swr";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";

const fetcher = (url: string) => api.getKelas();

function KelasPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Kelas</h2>
          <p className="text-muted-foreground">
            Kelola data kelas dan wali kelas.
          </p>
        </div>
        <AddKelasDialog />
      </div>
      <Alert variant="info">
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Informasi</AlertTitle>
        <AlertDescription>
          Gunakan halaman ini untuk menambah atau mengedit kelas. Sebuah kelas
          tidak dapat dihapus jika masih ada siswa yang terdaftar di dalamnya.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas</CardTitle>
          <Skeleton className="mt-2 h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kelas</TableHead>
                  <TableHead>Wali Kelas</TableHead>
                  <TableHead>Jumlah Siswa</TableHead>
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

export default function KelasPage() {
  const {
    data: kelas,
    error,
    isLoading,
  } = useSWR<Kelas[]>("/api/kelas", fetcher);

  if (isLoading) {
    return <KelasPageSkeleton />;
  }

  if (error || !kelas) {
    return <div className="text-center">Gagal memuat data kelas.</div>;
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Kelas</h2>
          <p className="text-muted-foreground">
            Kelola data kelas dan wali kelas.
          </p>
        </div>
        <AddKelasDialog />
      </div>

      <Alert variant="info">
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Informasi</AlertTitle>
        <AlertDescription>
          Gunakan halaman ini untuk menambah atau mengedit kelas. Sebuah kelas
          tidak dapat dihapus jika masih ada siswa yang terdaftar di dalamnya.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas</CardTitle>
          <CardDescription>
            Total {kelas.length} kelas terdaftar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KelasTable data={kelas} />
        </CardContent>
      </Card>
    </div>
  );
}
