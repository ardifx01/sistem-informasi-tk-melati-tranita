// File: components/Pengaturan/Kategori/KategoriTable.tsx

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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Kategori } from "@/lib/types";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/shared/DeleteDialog";
import { EditKategoriDialog } from "./EditKategoriDialog ";
import { useSWRConfig } from "swr";

interface KategoriTableProps {
  data: Kategori[];
}

export function KategoriTable({ data }: KategoriTableProps) {
  const { mutate } = useSWRConfig();
  const [editItem, setEditItem] = useState<Kategori | null>(null);
  const [deleteItem, setDeleteItem] = useState<Kategori | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEdit = (item: Kategori) => {
    setEditItem(item);
    setIsEditOpen(true);
  };

  const handleDeleteRequest = (item: Kategori) => {
    setDeleteItem(item);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    const previousData = data;
    const optimisticData = data.filter((item) => item.id !== deleteItem.id);
    mutate("/api/kategori", optimisticData, false);

    setIsDeleteOpen(false);
    toast.loading("Menghapus kategori...");

    try {
      await api.deleteKategori(deleteItem.id);
      toast.dismiss();
      toast.success("Kategori berhasil dihapus.");
      mutate("/api/kategori");
    } catch (error) {
      toast.dismiss();
      toast.error("Gagal menghapus kategori.");
      mutate("/api/kategori", previousData, false);
    } finally {
      setDeleteItem(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.tipe === "PEMASUKAN" ? "default" : "secondary"
                      }
                      className={
                        item.tipe === "PEMASUKAN"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {item.tipe}
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
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteRequest(item)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <EditKategoriDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        kategori={editItem}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Hapus Kategori"
        description={`Yakin ingin menghapus kategori "${deleteItem?.nama}"?`}
      />
    </>
  );
}
