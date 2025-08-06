"use client";

import { useState, useMemo } from "react";
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
import { MoreHorizontal, Edit, Trash2, ArrowUpDown } from "lucide-react";
import { api } from "@/lib/api";
import type { Pengeluaran } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { DeleteDialog } from "@/components/shared/DeleteDialog";
import { toast } from "sonner";
import { EditPengeluaranDialog } from "./EditPengeluaranDialog";
import { mutate } from "swr";

// Tipe data yang bisa di-sort
type SortableKeys = "tanggal" | "keterangan" | "kategori" | "jumlah";

interface PengeluaranTableProps {
  data: Pengeluaran[];
  onDataChanged?: () => void;
  // Props baru untuk paginasi
  currentPage: number;
  totalPages: number;
  onPageChange: (direction: "next" | "prev") => void;
}

export function PengeluaranTable({
  data,
  onDataChanged,
  currentPage,
  totalPages,
  onPageChange,
}: PengeluaranTableProps) {
  const [deleteItem, setDeleteItem] = useState<Pengeluaran | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editItem, setEditItem] = useState<Pengeluaran | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // State baru untuk sorting
  const [sortConfig, setSortConfig] = useState<{
    key: SortableKeys;
    direction: "asc" | "desc";
  }>({ key: "tanggal", direction: "desc" });

  // Fungsi untuk mengurutkan data
  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

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

  // Fungsi untuk mengubah konfigurasi sort
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

  const handleEdit = (pengeluaran: Pengeluaran) => {
    setEditItem(pengeluaran);
    setIsEditOpen(true);
  };

  const handleDeleteRequest = (item: Pengeluaran) => {
    setDeleteItem(item);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await api.deletePengeluaran(deleteItem.id);
      toast.success("Data pengeluaran berhasil dihapus.");

      // Beri tahu SWR untuk memuat ulang data yang relevan
      mutate("/api/dashboard/stats");
      mutate("/api/keuangan/pengeluaran");

      onDataChanged?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Gagal menghapus data.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeleteItem(null);
    }
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    setEditItem(null);
    onDataChanged?.();
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("tanggal")}>
                  Tanggal
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => requestSort("jumlah")}>
                  Jumlah
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {formatDate(item.tanggal, "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.keterangan}
                  </TableCell>
                  <TableCell>{item.kategori.replace("_", " ")}</TableCell>
                  <TableCell className="text-right">
                    Rp {item.jumlah.toLocaleString("id-ID")}
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
                        {/* PERBAIKAN: onClick sekarang ada di DropdownMenuItem */}
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteRequest(item)}
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
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada data pengeluaran yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>
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

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Hapus Pengeluaran"
        description={`Apakah Anda yakin ingin menghapus transaksi "${deleteItem?.keterangan}"?`}
        loading={isDeleting}
      />
      <EditPengeluaranDialog
        pengeluaran={editItem}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onPengeluaranUpdated={handleEditSuccess}
      />
    </>
  );
}
