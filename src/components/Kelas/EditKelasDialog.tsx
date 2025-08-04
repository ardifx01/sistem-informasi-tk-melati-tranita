"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { Kelas } from "@/lib/types";
import { updateKelasSchema } from "@/lib/validations";
import { Label } from "../ui/label";

// Tipe untuk nilai form, diambil dari skema Zod
type KelasFormValues = z.infer<typeof updateKelasSchema>;

interface EditKelasDialogProps {
  kelas: Kelas | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKelasUpdated?: () => void;
}

export function EditKelasDialog({
  kelas,
  open,
  onOpenChange,
  onKelasUpdated,
}: EditKelasDialogProps) {
  const form = useForm<KelasFormValues>({
    resolver: zodResolver(updateKelasSchema),
    defaultValues: {
      nama: "",
      waliKelas: "",
    },
  });

  const { isSubmitting } = form.formState;

  // Mengisi form dengan data kelas yang ada saat dialog dibuka atau data kelas berubah
  useEffect(() => {
    if (kelas) {
      form.reset({
        nama: kelas.nama,
        waliKelas: kelas.waliKelas,
      });
    }
  }, [kelas, form]);

  const onSubmit = async (values: KelasFormValues) => {
    if (!kelas) return;

    try {
      await api.updateKelas(kelas.id, values);
      toast.success("Data kelas berhasil diperbarui!");
      onOpenChange(false);
      onKelasUpdated?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Gagal memperbarui data kelas.";
      toast.error(errorMessage);
    }
  };

  if (!kelas) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Kelas</DialogTitle>
          <DialogDescription>
            Ubah informasi untuk kelas {kelas.nama}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kelas</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: A, B1, B2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="waliKelas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Wali Kelas</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Ibu Budi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              {/* <Label>Jumlah Siswa</Label> */}
              {/* <Input value={kelas.jumlahSiswa || 0} disabled /> */}
              <p className="text-xs text-muted-foreground">
                Jumlah siswa akan otomatis tergenerate.
              </p>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
