"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { Pengeluaran } from "@/lib/types";
import { updatePengeluaranSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import useSWR, { useSWRConfig } from "swr";

// Tipe untuk nilai form
type PengeluaranFormValues = z.infer<typeof updatePengeluaranSchema>;

interface EditPengeluaranDialogProps {
  pengeluaran: Pengeluaran | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPengeluaranUpdated?: () => void;
}

const kategoriFetcher = (url: string) => api.getKategori("PENGELUARAN");

export function EditPengeluaranDialog({
  pengeluaran,
  open,
  onOpenChange,
  onPengeluaranUpdated,
}: EditPengeluaranDialogProps) {
  const { cache, mutate } = useSWRConfig(); // Hook SWR untuk interaksi cache
  const {
    data: kategoriPengeluaran,
    error: kategoriError,
    isLoading: isKategoriLoading,
  } = useSWR(open ? "/api/kategori?tipe=PENGELUARAN" : null, kategoriFetcher);

  const form = useForm<PengeluaranFormValues>({
    resolver: zodResolver(updatePengeluaranSchema),
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (kategoriError) {
      toast.error("Gagal memuat kategori pengeluaran.");
    }
  }, [kategoriError]);

  useEffect(() => {
    if (pengeluaran) {
      form.reset({
        ...pengeluaran,
        tanggal: new Date(pengeluaran.tanggal),
      });
    }
  }, [pengeluaran, form]);

  const onSubmit = async (values: PengeluaranFormValues) => {
    if (!pengeluaran) return;

    const pengeluaranKey = "/api/keuangan/pengeluaran";
    const statsKey = "/api/dashboard/stats";

    // 1. Ambil data saat ini dari cache untuk rollback jika gagal
    const previousData = cache.get(pengeluaranKey)?.data as
      | Pengeluaran[]
      | undefined;

    // 2. Buat data optimis (data baru yang akan ditampilkan di UI)
    const optimisticData =
      previousData?.map((item) =>
        item.id === pengeluaran.id
          ? { ...item, ...values, tanggal: values.tanggal || item.tanggal }
          : item
      ) || [];

    // 3. Perbarui UI secara instan tanpa memvalidasi ulang
    mutate(pengeluaranKey, optimisticData, false);
    toast.loading("Menyimpan perubahan...");
    onOpenChange(false);

    try {
      // 4. Kirim permintaan ke API
      await api.updatePengeluaran(pengeluaran.id, values);

      // 5. Jika berhasil, ganti notifikasi dan picu validasi ulang untuk semua data terkait
      toast.dismiss();
      toast.success("Data pengeluaran berhasil diperbarui!");
      mutate(pengeluaranKey);
      mutate(statsKey);

      onPengeluaranUpdated?.();
    } catch (error: any) {
      // 6. Jika gagal, kembalikan UI ke kondisi semula (rollback) dan tampilkan error
      toast.dismiss();
      const errorMessage =
        error.response?.data?.error || "Gagal memperbarui data.";
      toast.error(errorMessage);
      if (previousData) {
        mutate(pengeluaranKey, previousData, false);
      }
    }
  };

  if (!pengeluaran) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Pengeluaran</DialogTitle>
          <DialogDescription>
            Perbarui detail untuk transaksi: "{pengeluaran.keterangan}".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tanggal"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Transaksi</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: localeID })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        captionLayout="dropdown"
                        fromYear={2025}
                        toYear={new Date().getFullYear()} // Tahun saat ini
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jumlah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah (Rp)</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value ?? 0}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kategori"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isKategoriLoading ? (
                        <SelectItem value="isKategoriLoading" disabled>
                          Memuat kategori...
                        </SelectItem>
                      ) : (
                        (kategoriPengeluaran || []).map((kategori) => (
                          <SelectItem key={kategori.id} value={kategori.nama}>
                            {kategori.nama}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>{" "}
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keterangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detail pengeluaran"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
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
