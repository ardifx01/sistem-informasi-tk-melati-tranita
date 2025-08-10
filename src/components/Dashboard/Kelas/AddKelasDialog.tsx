"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createKelasSchema } from "@/lib/validation";
import { useSWRConfig } from "swr";
import { Kelas } from "@/lib/types";

// Tipe untuk nilai form, diambil dari skema Zod
type KelasFormValues = z.infer<typeof createKelasSchema>;

interface AddKelasDialogProps {
  onKelasAdded?: () => void;
}

export function AddKelasDialog({ onKelasAdded }: AddKelasDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate, cache } = useSWRConfig();

  const form = useForm<KelasFormValues>({
    resolver: zodResolver(createKelasSchema),
    defaultValues: {
      nama: "",
      waliKelas: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: KelasFormValues) => {
    const kelasListKey = "/api/kelas";
    const statsKey = "/api/dashboard/stats";

    // 2. Ambil data saat ini dari cache untuk rollback
    const previousKelasList = cache.get(kelasListKey)?.data as
      | Kelas[]
      | undefined;

    // 3. Buat data optimis (tambahkan data baru ke daftar yang ada)
    const optimisticKelas = {
      id: "temp-" + Date.now(), // ID sementara
      ...values,
      jumlahSiswa: 0, // Nilai default untuk tampilan
    };
    const optimisticData = previousKelasList
      ? [...previousKelasList, optimisticKelas]
      : [optimisticKelas];

    // 4. Perbarui UI secara instan
    mutate(kelasListKey, optimisticData, false);
    toast.loading("Menambahkan kelas baru...");
    setOpen(false);

    try {
      // 5. Kirim permintaan ke API
      await api.createKelas(values);

      // 6. Jika berhasil, ganti notifikasi dan picu validasi ulang
      toast.dismiss();
      toast.success("Kelas baru berhasil ditambahkan!");

      // Revalidate (refresh) data dari server untuk memastikan konsistensi
      mutate(kelasListKey);
      mutate(statsKey);

      form.reset();
      onKelasAdded?.();
    } catch (error: any) {
      // 7. Jika gagal, kembalikan UI ke kondisi semula (rollback)
      toast.dismiss();
      const errorMessage =
        error.response?.data?.error || "Gagal menambahkan kelas.";
      toast.error(errorMessage);
      if (previousKelasList) {
        mutate(kelasListKey, previousKelasList, false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kelas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Kelas Baru</DialogTitle>
          <DialogDescription>
            Masukkan informasi untuk kelas baru.
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
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Tambah Kelas"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
