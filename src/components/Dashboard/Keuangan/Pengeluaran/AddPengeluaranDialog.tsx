"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, CalendarIcon } from "lucide-react";
import { format, isValid, parse } from "date-fns";
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
import { createPengeluaranSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import useSWR, { mutate } from "swr";
import { Input } from "@/components/ui/input";

// Tipe untuk nilai form
type PengeluaranFormValues = z.infer<typeof createPengeluaranSchema>;

interface AddPengeluaranDialogProps {
  onPengeluaranAdded?: () => void;
}

const kategoriFetcher = (url: string) => api.getKategori("PENGELUARAN");

export function AddPengeluaranDialog({
  onPengeluaranAdded,
}: AddPengeluaranDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    data: kategoriPengeluaran,
    error: kategoriError,
    isLoading: isKategoriLoading,
  } = useSWR(open ? "/api/kategori?tipe=PENGELUARAN" : null, kategoriFetcher);

  const form = useForm<PengeluaranFormValues>({
    resolver: zodResolver(createPengeluaranSchema),
    defaultValues: {
      jumlah: 0,
      keterangan: "",
      tanggal: new Date(),
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (kategoriError) {
      toast.error("Gagal memuat kategori pengeluaran.");
    }
  }, [kategoriError]);

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
              render={({ field }) => {
                // State lokal untuk menangani input string dari pengguna
                const [dateString, setDateString] = useState(
                  field.value
                    ? format(field.value, "dd/MM/yyyy", {
                        locale: localeID,
                      })
                    : ""
                );

                // Sinkronkan input string ketika nilai form berubah (misal dari kalender)
                useEffect(() => {
                  if (field.value) {
                    setDateString(
                      format(field.value, "dd/MM/yyyy", {
                        locale: localeID,
                      })
                    );
                  } else {
                    setDateString("");
                  }
                }, [field.value]);

                return (
                  <FormItem>
                    <FormLabel>Tanggal Transaksi</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="DD/MM/YYYY"
                          value={dateString}
                          onChange={(e) => setDateString(e.target.value)}
                          onBlur={() => {
                            // Coba parse tanggal saat pengguna meninggalkan input
                            const parsedDate = parse(
                              dateString,
                              "dd/MM/yyyy",
                              new Date()
                            );
                            if (isValid(parsedDate)) {
                              field.onChange(parsedDate); // Update state form jika valid
                            } else {
                              field.onChange(undefined); // Kosongkan jika tidak valid
                            }
                          }}
                        />
                      </FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            size="icon"
                            className="absolute right-0 top-0 h-full rounded-l-none"
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              if (date) {
                                setDateString(
                                  format(date, "dd/MM/yyyy", {
                                    locale: localeID,
                                  })
                                );
                              }
                            }}
                            // disabled={(date) =>
                            //   date > new Date() || date < new Date("1990-01-01")
                            // }
                            captionLayout="dropdown"
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
