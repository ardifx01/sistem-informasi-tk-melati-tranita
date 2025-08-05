"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
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
import { MoreHorizontal, Edit, Trash2, Eye, ArrowUpDown } from "lucide-react";
import { api } from "@/lib/api";
import type { Siswa as SiswaType } from "@/lib/types";
import { DeleteDialog } from "@/components/shared/DeleteDialog";
import { EditSiswaDialog } from "./EditSiswaDialog";
import { toast } from "sonner";
import { mutate } from "swr";

interface SiswaWithTunggakan extends SiswaType {
  jumlahTunggakan: number;
}

type SortableKeys = "nis" | "nama" | "kelas";

interface SiswaTableProps {
  data: SiswaWithTunggakan[];
  onDataChanged?: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (direction: "next" | "prev") => void;
  startIndex: number; // Prop baru untuk nomor awal
}

export function SiswaTable({
  data,
  onDataChanged,
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
}: SiswaTableProps) {
  const router = useRouter();
  const [editSiswa, setEditSiswa] = useState<SiswaType | null>(null);
  const [deleteSiswa, setDeleteSiswa] = useState<SiswaType | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: SortableKeys;
    direction: "asc" | "desc";
  } | null>({ key: "nama", direction: "asc" });

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === "kelas") {
          aValue = typeof a.kelas === "object" ? a.kelas.nama : "";
          bValue = typeof b.kelas === "object" ? b.kelas.nama : "";
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: SortableKeys) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

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
      mutate("/api/kelas");
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
              <TableHead className="w-[50px]">No.</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("nis")}>
                  NIS <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("nama")}>
                  Nama <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("kelas")}>
                  Kelas <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Jenis Kelamin</TableHead>
              <TableHead>Status Pembayaran</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((siswa, index) => (
                <TableRow key={siswa.id}>
                  <TableCell className="font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>{siswa.nis}</TableCell>
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
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada data siswa yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={7}>
                <div className="flex items-center justify-end space-x-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange("prev")}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange("next")}
                      disabled={currentPage === totalPages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
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
