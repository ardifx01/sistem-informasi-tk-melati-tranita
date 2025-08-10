"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { mutate } from "swr"; // <-- 1. Impor mutate

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { createSingleTagihanSchema } from "@/lib/validation";

type FormValues = z.infer<typeof createSingleTagihanSchema>;

interface AddSingleTagihanDialogProps {
  siswaId: string;
  siswaNama: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagihanAdded?: () => void;
}

export function AddSingleTagihanDialog({
  siswaId,
  siswaNama,
  open,
  onOpenChange,
  onTagihanAdded,
}: AddSingleTagihanDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(createSingleTagihanSchema),
    defaultValues: {
      keterangan: "",
      jumlahTagihan: 0,
      tanggalJatuhTempo: new Date(),
      siswaId: siswaId,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // API call tidak berubah
      await api.createTagihan(values);
      toast.success(`Tagihan baru untuk ${siswaNama} berhasil dibuat!`);

      // --- 2. PERBARUI DATA SECARA REAL-TIME ---
      // Memicu refresh data di halaman-halaman yang relevan
      mutate(`/api/siswa/${siswaId}`); // Untuk halaman detail siswa ini
      mutate("/api/keuangan/tagihan"); // Untuk halaman manajemen tagihan
      mutate("/api/dashboard/stats"); // Untuk statistik di dashboard

      form.reset();
      onOpenChange(false);
      onTagihanAdded?.();
    } catch (error) {
      toast.error("Gagal membuat tagihan.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Tagihan Baru</DialogTitle>
          <DialogDescription>
            Membuat tagihan spesifik untuk siswa: <strong>{siswaNama}</strong>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="keterangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan Tagihan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Uang Kegiatan Karyawisata"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jumlahTagihan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Tagihan (Rp)</FormLabel>
                  <FormControl>
                    <CurrencyInput
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
              name="tanggalJatuhTempo"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Jatuh Tempo</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
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
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Membuat..." : "Buat Tagihan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
