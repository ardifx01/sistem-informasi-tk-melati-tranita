"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

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
import { api } from "@/lib/api";
import type { Kelas, Siswa } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSWRConfig } from "swr";
import { createTagihanSchema, type TagihanInput } from "@/lib/validation";

type TagihanFormValues = TagihanInput;

interface CreateTagihanApiResponse {
  message?: string;
  skipped?: number;
  count?: number;
}

interface AddTagihanDialogProps {
  onTagihanAdded?: () => void;
}

export function AddTagihanDialog({ onTagihanAdded }: AddTagihanDialogProps) {
  const { mutate } = useSWRConfig();
  const [open, setOpen] = useState(false);
  const [kelas, setKelas] = useState<Kelas[]>([]);

  const form = useForm<TagihanFormValues>({
    resolver: zodResolver(createTagihanSchema),
  });

  useEffect(() => {
    if (open) {
      api
        .getKelas()
        .then(setKelas)
        .catch(() => toast.error("Gagal memuat kelas."));
    }
  }, [open]);

  const onSubmit = async (values: TagihanFormValues) => {
    try {
      let siswaUntukTagihan: { id: string; jumlahSpp: number }[] = [];

      if (values.kelasId === "all") {
        siswaUntukTagihan = await api.getSiswa();
      } else {
        siswaUntukTagihan = await api.getSiswaByKelas(values.kelasId);
      }

      if (siswaUntukTagihan.length === 0) {
        toast.error("Tidak ada siswa yang ditemukan untuk dibuatkan tagihan.");
        return;
      }

      const tagihanBaru = siswaUntukTagihan.map((siswa) => ({
        siswaId: siswa.id,
        keterangan: values.keterangan,
        jumlahTagihan: siswa.jumlahSpp,
        tanggalJatuhTempo: values.tanggalJatuhTempo,
      }));

      const response = (await api.createTagihan(
        tagihanBaru
      )) as CreateTagihanApiResponse;
      // Cek apakah ada tagihan yang berhasil dibuat
      if (response.count && response.count > 0) {
        let successMessage =
          response.message ||
          `Berhasil membuat ${response.count} tagihan baru.`;
        if (response.skipped && response.skipped > 0) {
          successMessage += ` ${response.skipped} siswa dilewati.`;
        }
        toast.success(successMessage);
      } else {
        // Jika tidak ada yang dibuat, tampilkan sebagai peringatan
        toast.warning(
          response.message || "Tidak ada tagihan baru yang dibuat."
        );
      }

      // Memicu refresh data di halaman terkait
      mutate("/api/keuangan/tagihan");
      mutate("/api/siswa");
      mutate("/api/dashboard/stats");

      form.reset();
      setOpen(false);
      onTagihanAdded?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Gagal membuat tagihan.";
      toast.error(errorMessage);
      console.error("Error creating bulk tagihan:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Buat Tagihan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Tagihan Baru</DialogTitle>
          <DialogDescription>
            Buat tagihan secara massal untuk semua siswa di kelas yang dipilih.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="kelasId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Target</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih target tagihan..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* --- OPSI BARU --- */}
                      <SelectItem value="all">Semua Kelas</SelectItem>
                      {/* --- AKHIR OPSI BARU --- */}
                      {kelas.map((k) => (
                        <SelectItem key={k.id} value={k.id}>
                          Kelas {k.nama}
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
                  <FormLabel>Keterangan Tagihan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: SPP Bulan September 2025"
                      {...field}
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
                            format(field.value, "PPP")
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
            <DialogFooter>
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
