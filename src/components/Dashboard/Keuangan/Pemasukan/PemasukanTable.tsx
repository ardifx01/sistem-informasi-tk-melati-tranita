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
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, ArrowUpDown } from "lucide-react";
import { api } from "@/lib/api";
import { type Pemasukan } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { DeleteDialog } from "@/components/shared/DeleteDialog";
import { toast } from "sonner";
import { mutate } from "swr";

// Menentukan tipe data yang bisa di-sort
type SortableKeys = "tanggal" | "nama" | "jumlah" | "kategori";

interface PemasukanTableProps {
  data: Pemasukan[];
  onDataChanged?: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (direction: "next" | "prev") => void;
}

export function PemasukanTable({
  data,
  onDataChanged,
  currentPage,
  totalPages,
  onPageChange,
}: PemasukanTableProps) {
  const [deleteItem, setDeleteItem] = useState<Pemasukan | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State baru untuk sorting
  const [sortConfig, setSortConfig] = useState<{
    key: SortableKeys;
    direction: "asc" | "desc";
  } | null>({ key: "tanggal", direction: "desc" });

  // Fungsi untuk mengurutkan data
  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === "nama") {
          aValue = a.tagihan?.siswa?.nama || "";
          bValue = b.tagihan?.siswa?.nama || "";
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

  const handleDeleteRequest = (item: Pemasukan) => {
    setDeleteItem(item);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    const previousItem = data;

    const optimisticData = data.filter((s) => s.id !== deleteItem.id);
    // Perbarui cache SWR tanpa memicu re-fetch

    mutate("/api/dashboard/stats", optimisticData, false);
    mutate("/api/keuangan/pemasukan", optimisticData, false);

    // Tutup dialog segera
    setIsDeleteOpen(false);
    toast.loading("Menghapus pemasukan..."); // Tampilkan notifikasi loading
    try {
      await api.deletePemasukan(deleteItem.id);

      toast.dismiss();
      toast.success(`Pembayaran ${deleteItem.keterangan} berhasil dibatalkan.`);
      mutate("/api/dashboard/stats");
      mutate("/api/keuangan/pemasukan");

      onDataChanged?.();
    } catch (error: any) {
      toast.dismiss();
      const errorMessage =
        error.response?.data?.error || "Gagal menghapus data pembayaran.";
      toast.error(errorMessage);
      mutate("/api/dashboard/stats", previousItem, false);
      mutate("/api/keuangan/pemasukan", previousItem, false);
    } finally {
      setIsDeleting(false);
      setDeleteItem(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("tanggal")}>
                  Tanggal Bayar
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("nama")}>
                  Siswa
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("kategori")}>
                  Kategori
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>

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
                    {item.tagihan?.siswa?.nama || "Siswa Dihapus"}
                  </TableCell>
                  <TableCell>
                    {item.tagihan?.siswa?.kelas?.nama || "-"}
                  </TableCell>
                  <TableCell>{item.keterangan}</TableCell>
                  <TableCell>{item.kategori}</TableCell>
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
                        <DropdownMenuItem
                          onClick={() => handleDeleteRequest(item)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Batalkan Pembayaran
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
                  Tidak ada data pemasukan yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6}>
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
        title="Batalkan Pembayaran"
        description={`Apakah Anda yakin ingin membatalkan pembayaran untuk "${deleteItem?.keterangan}"? Status tagihan terkait akan dikembalikan menjadi BELUM LUNAS.`}
        loading={isDeleting}
      />
    </>
  );
}
