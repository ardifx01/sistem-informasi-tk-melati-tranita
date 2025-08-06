"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, CalendarIcon } from "lucide-react";
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
import type { KategoriPengeluaran } from "@/lib/types";
import { createPengeluaranSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { mutate } from "swr";

// Tipe untuk nilai form
type PengeluaranFormValues = z.infer<typeof createPengeluaranSchema>;

// Opsi untuk kategori pengeluaran
const kategoriOptions: { value: KategoriPengeluaran; label: string }[] = [
  { value: "OPERASIONAL", label: "Operasional" },
  { value: "PERAWATAN_ASET", label: "Perawatan Aset" },
  { value: "KEGIATAN_SISWA", label: "Kegiatan Siswa" },
  { value: "ATK", label: "Alat Tulis Kantor" },
  { value: "GAJI_GURU", label: "Gaji Guru" },
  { value: "LAINNYA", label: "Lainnya" },
];

interface AddPengeluaranDialogProps {
  onPengeluaranAdded?: () => void;
}

export function AddPengeluaranDialog({
  onPengeluaranAdded,
}: AddPengeluaranDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<PengeluaranFormValues>({
    resolver: zodResolver(createPengeluaranSchema),
    defaultValues: {
      jumlah: 0,
      keterangan: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: PengeluaranFormValues) => {
    try {
      await api.createPengeluaran(values);
      toast.success("Data pengeluaran baru berhasil ditambahkan!");

      // Beri tahu SWR untuk memuat ulang data yang relevan
      mutate("/api/dashboard/stats");
      mutate("/api/keuangan/pengeluaran");

      form.reset();
      setOpen(false);
      onPengeluaranAdded?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Gagal menambahkan pengeluaran.";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pengeluaran
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Pengeluaran Baru</DialogTitle>
          <DialogDescription>
            Catat biaya operasional atau pengeluaran lainnya.
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
                        // captionLayout="dropdown"
                        // fromYear={2025}
                        // toYear={new Date().getFullYear()} // Tahun saat ini
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
                      placeholder="Contoh: 50.000"
                      value={field.value}
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori pengeluaran" />
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
                      placeholder="Contoh: Pembelian spidol dan kertas A4"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
