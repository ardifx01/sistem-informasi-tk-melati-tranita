"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Kelas } from "@/lib/types";
import { EditKelasDialog } from "./EditKelasDialog";
import { DeleteDialog } from "@/components/shared/DeleteDialog";
import { toast } from "sonner";
import { mutate } from "swr";

interface KelasTableProps {
  data: Kelas[];
  onDataChanged?: () => void;
}

export function KelasTable({ data, onDataChanged }: KelasTableProps) {
  const [editKelas, setEditKelas] = useState<Kelas | null>(null);
  const [deleteKelas, setDeleteKelas] = useState<Kelas | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (kelas: Kelas) => {
    setEditKelas(kelas);
    setIsEditOpen(true);
  };

  // Fungsi ini sudah benar, tugasnya hanya menyiapkan data dan membuka dialog konfirmasi.
  const handleDeleteRequest = (kelas: Kelas) => {
    setDeleteKelas(kelas);
    setIsDeleteOpen(true);
  };

  // Logika utama penghapusan dengan penanganan error yang lebih baik
  const confirmDelete = async () => {
    if (!deleteKelas) return;

    const previousKelas = data;

    const optimisticData = data.filter((s) => s.id !== deleteKelas.id);
    // Perbarui cache SWR tanpa memicu re-fetch

    mutate("/api/kelas", optimisticData, false);
    mutate("/api/siswa", optimisticData, false);

    // Tutup dialog segera
    setIsDeleteOpen(false);
    toast.loading("Menghapus kelas..."); // Tampilkan notifikasi loading

    try {
      await api.deleteKelas(deleteKelas.id);

      toast.dismiss(); // Hapus notifikasi loading
      toast.success(`Kelas "${deleteKelas.nama}" berhasil dihapus.`);

      mutate("/api/kelas");
      mutate("/api/siswa");
      onDataChanged?.(); // Memuat ulang data setelah sukses
    } catch (error: any) {
      // Ambil pesan error spesifik dari respons API
      toast.dismiss();
      const errorMessage =
        error.response?.data?.error || "Gagal menghapus kelas.";
      toast.error(errorMessage);
      mutate("/api/dashboard/stats", previousKelas, false); // Kembalikan data lama
      mutate("/api/keuangan/pengeluaran", previousKelas, false); // Kembalikan data lama
    } finally {
      setIsDeleting(false);
      setDeleteKelas(null);
    }
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    setEditKelas(null);
    onDataChanged?.();
  };

  return (
    <>
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
            {data.length > 0 ? (
              data.map((kelas) => (
                <TableRow key={kelas.id}>
                  <TableCell className="font-medium">
                    Kelas {kelas.nama}
                  </TableCell>
                  <TableCell>{kelas.waliKelas}</TableCell>
                  <TableCell>{kelas.jumlahSiswa}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(kelas)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteRequest(kelas)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          disabled={isDeleting && deleteKelas?.id === kelas.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isDeleting && deleteKelas?.id === kelas.id
                            ? "Menghapus..."
                            : "Hapus"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada data kelas yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editKelas && (
        <EditKelasDialog
          kelas={editKelas}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onKelasUpdated={handleEditSuccess}
        />
      )}

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Hapus Kelas"
        description={`Apakah Anda yakin ingin menghapus kelas "${deleteKelas?.nama}"? Tindakan ini tidak dapat diurungkan.`}
        loading={isDeleting}
      />
    </>
  );
}
