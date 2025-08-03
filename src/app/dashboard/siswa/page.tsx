"use client";

import { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { api, type Siswa as SiswaType, type Kelas } from "@/lib/api";

// Tipe data yang diterima dari API, sekarang menyertakan jumlah tunggakan
interface SiswaWithTunggakan extends SiswaType {
  jumlahTunggakan: number;
  kelas: Kelas; // Pastikan tipe kelas adalah objek, bukan string
}

// Komponen Skeleton khusus untuk halaman ini
function SiswaPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Siswa</h2>
          <p className="text-muted-foreground">
            Kelola data siswa, kelas, dan status pembayaran.
          </p>
        </div>
        <AddSiswaDialog />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
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

export default function SiswaPage() {
  const [siswa, setSiswa] = useState<SiswaWithTunggakan[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [filteredSiswa, setFilteredSiswa] = useState<SiswaWithTunggakan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("all"); // State untuk filter kelas

  const loadData = async () => {
    setLoading(true);
    try {
      // Ambil data siswa dan kelas secara bersamaan
      const [siswaData, kelasData] = await Promise.all([
        api.getSiswa(),
        api.getKelas(), // Pastikan Anda memiliki fungsi ini di lib/api.ts
      ]);
      setSiswa(siswaData as SiswaWithTunggakan[]);
      setFilteredSiswa(siswaData as SiswaWithTunggakan[]);
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

  useEffect(() => {
    let filtered = siswa;

    // 1. Filter berdasarkan kelas yang dipilih
    if (selectedKelas !== "all") {
      filtered = filtered.filter((s) => s.kelasId === selectedKelas);
    }

    // 2. Kemudian, filter berdasarkan kata kunci pencarian
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.nis.includes(searchTerm)
      );
    }

    setFilteredSiswa(filtered);
  }, [searchTerm, selectedKelas, siswa]);

  if (loading) {
    return <SiswaPageSkeleton />;
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
        <AddSiswaDialog onSiswaAdded={loadData} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
          <CardDescription>
            Total {filteredSiswa.length} dari {siswa.length} siswa ditampilkan.
          </CardDescription>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
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
                {kelas.map((k) => (
                  <SelectItem key={k.id} value={k.id} className="font-semibold">
                    Kelas {k.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <SiswaTable data={filteredSiswa} onDataChanged={loadData} />
        </CardContent>
      </Card>
    </div>
  );
}
