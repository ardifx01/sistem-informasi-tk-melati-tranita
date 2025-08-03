"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Impor useRouter untuk navigasi
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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { api } from "@/lib/api";
import type { Siswa as SiswaType } from "@/lib/types";
import { DeleteDialog } from "@/components/Layout/DeleteDialog";
import { EditSiswaDialog } from "./EditSiswaDialog";
import { toast } from "sonner";

// Perbarui tipe lokal untuk menyertakan jumlahTunggakan
interface SiswaWithTunggakan extends SiswaType {
  jumlahTunggakan: number;
}

interface SiswaTableProps {
  data: SiswaWithTunggakan[];
  onDataChanged?: () => void;
}

export function SiswaTable({ data, onDataChanged }: SiswaTableProps) {
  const router = useRouter(); // Inisialisasi router
  const [editSiswa, setEditSiswa] = useState<SiswaType | null>(null);
  const [deleteSiswa, setDeleteSiswa] = useState<SiswaType | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (siswa: SiswaType) => {
    setEditSiswa(siswa);
    setIsEditOpen(true);
  };

  const handleDeleteRequest = (siswa: SiswaType) => {
    setDeleteSiswa(siswa);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteSiswa) return;

    setIsDeleting(true);
    try {
      await api.deleteSiswa(deleteSiswa.id);
      toast.success(`Siswa "${deleteSiswa.nama}" berhasil dihapus.`);
      onDataChanged?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Gagal menghapus siswa.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeleteSiswa(null);
    }
  };

  // Fungsi untuk navigasi ke halaman detail siswa
  const handleView = (id: string) => {
    router.push(`/dashboard/siswa/${id}`);
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    setEditSiswa(null);
    onDataChanged?.();
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NIS</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Jenis Kelamin</TableHead>
              <TableHead>Status Pembayaran</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((siswa) => (
                <TableRow key={siswa.id}>
                  <TableCell className="font-medium">{siswa.nis}</TableCell>
                  <TableCell>{siswa.nama}</TableCell>
                  <TableCell>
                    {typeof siswa.kelas === "string"
                      ? siswa.kelas
                      : siswa.kelas?.nama || "-"}
                  </TableCell>
                  <TableCell>
                    {siswa.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        siswa.jumlahTunggakan > 0 ? "destructive" : "default"
                      }
                      className={
                        siswa.jumlahTunggakan === 0
                          ? "bg-green-500 hover:bg-green-600"
                          : ""
                      }
                    >
                      {siswa.jumlahTunggakan > 0
                        ? `${siswa.jumlahTunggakan} Tunggakan`
                        : "Lunas"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* Item "Lihat Detail" sekarang aktif */}
                        <DropdownMenuItem onClick={() => handleView(siswa.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(siswa)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteRequest(siswa)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada data siswa yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editSiswa && (
        <EditSiswaDialog
          siswa={editSiswa}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSiswaUpdated={handleEditSuccess}
        />
      )}

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Hapus Siswa"
        description={`Apakah Anda yakin ingin menghapus data siswa bernama "${deleteSiswa?.nama}"? Tindakan ini tidak dapat diurungkan.`}
        loading={isDeleting}
      />
    </>
  );
}
