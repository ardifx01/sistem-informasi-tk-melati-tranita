"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { AddKelasDialog } from "@/components/Kelas/AddKelasDialog";
import { KelasTable } from "@/components/Kelas/KelasTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, Kelas } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);

  const loadKelas = async () => {
    try {
      const data = await api.getKelas();
      setKelas(data);
    } catch (error) {
      console.error("Error loading kelas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKelas();
  }, []);

  if (loading) {
    return <KelasPageSkeleton />;
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
        <AddKelasDialog onKelasAdded={loadKelas} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas</CardTitle>
          <CardDescription>
            Total {kelas.length} kelas terdaftar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KelasTable data={kelas} onDataChanged={loadKelas} />
        </CardContent>
      </Card>
    </div>
  );
}
