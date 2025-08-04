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
import type { Pengeluaran, KategoriPengeluaran } from "@/lib/types";
import { updatePengeluaranSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/Layout/CurrencyInput";

// Tipe untuk nilai form
type PengeluaranFormValues = z.infer<typeof updatePengeluaranSchema>;

const kategoriOptions: { value: KategoriPengeluaran; label: string }[] = [
  { value: "OPERASIONAL", label: "Operasional" },
  { value: "PERAWATAN_ASET", label: "Perawatan Aset" },
  { value: "KEGIATAN_SISWA", label: "Kegiatan Siswa" },
  { value: "ATK", label: "Alat Tulis Kantor" },
  { value: "GAJI_GURU", label: "Gaji Guru" },
  { value: "LAINNYA", label: "Lainnya" },
];

interface EditPengeluaranDialogProps {
  pengeluaran: Pengeluaran | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPengeluaranUpdated?: () => void;
}

export function EditPengeluaranDialog({
  pengeluaran,
  open,
  onOpenChange,
  onPengeluaranUpdated,
}: EditPengeluaranDialogProps) {
  const form = useForm<PengeluaranFormValues>({
    resolver: zodResolver(updatePengeluaranSchema),
  });

  const { isSubmitting } = form.formState;

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

    try {
      await api.updatePengeluaran(pengeluaran.id, values);
      toast.success("Data pengeluaran berhasil diperbarui!");
      onOpenChange(false);
      onPengeluaranUpdated?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Gagal memperbarui data.";
      toast.error(errorMessage);
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
                      {kategoriOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
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
