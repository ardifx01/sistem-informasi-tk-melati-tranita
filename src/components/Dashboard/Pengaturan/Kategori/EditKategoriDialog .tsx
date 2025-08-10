// File: components/Pengaturan/Kategori/EditKategoriDialog.tsx

"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { updateKategoriSchema } from "@/lib/validation";
import type { Kategori } from "@/lib/types";
import { mutate } from "swr";

type FormValues = z.infer<typeof updateKategoriSchema>;

interface EditKategoriDialogProps {
  kategori: Kategori | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditKategoriDialog({
  kategori,
  open,
  onOpenChange,
}: EditKategoriDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(updateKategoriSchema),
  });

  useEffect(() => {
    if (kategori) {
      form.reset({ nama: kategori.nama });
    }
  }, [kategori, form]);

  const onSubmit = async (values: FormValues) => {
    if (!kategori) return;
    try {
      await api.updateKategori(kategori.id, values);
      toast.success("Kategori berhasil diperbarui.");
      mutate("/api/kategori"); // Memicu refresh data
      onOpenChange(false);
    } catch (error) {
      toast.error("Gagal memperbarui kategori.");
    }
  };

  if (!kategori) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Kategori</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kategori</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
