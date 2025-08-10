"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit, CreditCard } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Tagihan, StatusPembayaran } from "@/lib/types";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/shared/DeleteDialog";
import { BayarTagihanDialog } from "./BayarTagihanDialog";
import { EditTagihanDialog } from "./EditTagihanDialog";
import { cn } from "@/lib/utils";
import { useSWRConfig } from "swr";
import { startOfDay } from "date-fns";
import { useRouter } from "next/navigation";

interface TagihanTableProps {
  data: Tagihan[];
  onDataChanged?: () => void;
  // Props baru untuk paginasi
  currentPage: number;
  totalPages: number;
  onPageChange: (direction: "next" | "prev") => void;
}

// Tipe baru untuk status yang dihitung secara dinamis
type DisplayStatus = StatusPembayaran | "TERLAMBAT";

// Fungsi untuk menentukan status dan warna badge secara dinamis
const getStatusInfo = (
  tagihan: Tagihan
): { status: DisplayStatus; className: string } => {
  // startOfDay memastikan kita membandingkan tanggal tanpa memperhitungkan waktu
  const isOverdue =
    startOfDay(new Date(tagihan.tanggalJatuhTempo)) < startOfDay(new Date()) &&
    tagihan.status === "BELUM_LUNAS";

  if (tagihan.status === "LUNAS") {
    return { status: "LUNAS", className: "bg-green-100 text-green-800" };
  }
  if (isOverdue) {
    return { status: "TERLAMBAT", className: "bg-red-100 text-red-800" };
  }
  // Defaultnya adalah BELUM_LUNAS
  return { status: "BELUM_LUNAS", className: "bg-yellow-100 text-yellow-800" };
};

export function TagihanTable({
  data,
  onDataChanged,
  currentPage,
  totalPages,
  onPageChange,
}: TagihanTableProps) {
  const [pembayaranTagihan, setPembayaranTagihan] = useState<Tagihan | null>(
    null
  );
  const [editTagihan, setEditTagihan] = useState<Tagihan | null>(null);
  const [deleteTagihan, setDeleteTagihan] = useState<Tagihan | null>(null);

  const [isBayarOpen, setIsBayarOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { cache, mutate } = useSWRConfig(); // Hook SWR untuk interaksi cache

  const handleBayar = (tagihan: Tagihan) => {
    setPembayaranTagihan(tagihan);
    setIsBayarOpen(true);
  };

  const handleEdit = (tagihan: Tagihan) => {
    setEditTagihan(tagihan);
    setIsEditOpen(true);
  };

  const handleDeleteRequest = (tagihan: Tagihan) => {
    setDeleteTagihan(tagihan);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTagihan) return;

    const tagihanListKey = "/api/keuangan/tagihan";
    const statsKey = "/api/dashboard/stats";
    const siswaListKey = "/api/siswa";

    // 1. Ambil data saat ini dari cache untuk rollback jika gagal
    const previousTagihanList = cache.get(tagihanListKey)?.data as
      | Tagihan[]
      | undefined;

    // 2. Buat data optimis & perbarui UI secara instan
    const optimisticData =
      previousTagihanList?.filter((t) => t.id !== deleteTagihan.id) || [];
    mutate(tagihanListKey, optimisticData, false);

    // Tutup dialog dan tampilkan notifikasi loading
    setIsDeleteOpen(false);
    toast.loading("Menghapus tagihan...");

    try {
      // 3. Kirim permintaan hapus ke API
      await api.deleteTagihan(deleteTagihan.id);

      // 4. Jika berhasil, ganti notifikasi & picu validasi ulang untuk semua data terkait
      toast.dismiss();
      toast.success(`Tagihan berhasil dihapus.`);

      // Revalidate (refresh) data dari server untuk memastikan konsistensi
      mutate(tagihanListKey);
      mutate(statsKey);
      mutate(siswaListKey);
    } catch (error: any) {
      // 5. Jika gagal, kembalikan UI ke kondisi semula (rollback)
      toast.dismiss();
      const errorMessage =
        error.response?.data?.error || "Gagal menghapus data tagihan.";
      toast.error(errorMessage);
      if (previousTagihanList) {
        mutate(tagihanListKey, previousTagihanList, false);
      }
    } finally {
      setDeleteTagihan(null);
      setIsDeleting(false);
    }
  };

  const handleActionSuccess = () => {
    setIsBayarOpen(false);
    setIsEditOpen(false);
    onDataChanged?.();
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Siswa</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Jatuh Tempo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((tagihan) => {
                const { status, className } = getStatusInfo(tagihan);
                return (
                  <TableRow key={tagihan.id}>
                    <TableCell className="font-medium">
                      {tagihan.siswa?.nama || "N/A"}
                    </TableCell>
                    <TableCell>
                      {tagihan.siswa?.kelas &&
                      typeof tagihan.siswa.kelas === "object"
                        ? tagihan.siswa.kelas.nama
                        : "N/A"}
                    </TableCell>
                    <TableCell>{tagihan.keterangan}</TableCell>
                    <TableCell>
                      Rp {tagihan.jumlahTagihan.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      {formatDate(tagihan.tanggalJatuhTempo, "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-transparent font-semibold",
                          className
                        )}
                      >
                        {status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {status !== "LUNAS" && (
                            <DropdownMenuItem
                              onClick={() => handleBayar(tagihan)}
                            >
                              <CreditCard className="mr-2 h-4 w-4" />
                              Bayar Tagihan
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleEdit(tagihan)}
                            disabled={!!tagihan.pemasukan}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteRequest(tagihan)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            disabled={!!tagihan.pemasukan}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada data tagihan yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {/* --- BAGIAN PAGINASI BARU --- */}
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

      <BayarTagihanDialog
        tagihan={pembayaranTagihan}
        open={isBayarOpen}
        onOpenChange={setIsBayarOpen}
        onPembayaranSuccess={handleActionSuccess}
      />

      <EditTagihanDialog
        tagihan={editTagihan}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onTagihanUpdated={handleActionSuccess}
      />

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Hapus Tagihan"
        description={`Apakah Anda yakin ingin menghapus tagihan "${deleteTagihan?.keterangan}"?`}
        loading={isDeleting}
      />
    </>
  );
}
