"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { format, isValid, parse } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { api } from "@/lib/api";
import type { Tagihan, Siswa } from "@/lib/types";
import { updateTagihanSchema } from "@/lib/validation";
import { currentYear } from "@/lib/utils";

type TagihanFormValues = z.infer<typeof updateTagihanSchema>;

interface EditTagihanDialogProps {
  tagihan: Tagihan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagihanUpdated: () => void;
}

export function EditTagihanDialog({
  tagihan,
  open,
  onOpenChange,
  onTagihanUpdated,
}: EditTagihanDialogProps) {
  const { cache, mutate } = useSWRConfig();

  const form = useForm<TagihanFormValues>({
    resolver: zodResolver(updateTagihanSchema),
  });

  useEffect(() => {
    if (tagihan && open) {
      form.reset({
        keterangan: tagihan.keterangan,
        jumlahTagihan: tagihan.jumlahTagihan,
        tanggalJatuhTempo: new Date(tagihan.tanggalJatuhTempo),
      });
    }
  }, [tagihan, open, form]);

  const onSubmit = async (values: TagihanFormValues) => {
    if (!tagihan) return;

    const tagihanListKey = "/api/keuangan/tagihan";
    const siswaDetailKey = `/api/siswa/${tagihan.siswaId}`;
    const statsKey = "/api/dashboard/stats";

    const previousTagihanList = cache.get(tagihanListKey)?.data as
      | Tagihan[]
      | undefined;
    const previousSiswaDetail = cache.get(siswaDetailKey)?.data as
      | Siswa
      | undefined;

    const optimisticTagihanList = previousTagihanList?.map((t) =>
      t.id === tagihan.id
        ? {
            ...t,
            ...values,
            tanggalJatuhTempo: values.tanggalJatuhTempo || new Date(),
          }
        : t
    );

    let optimisticSiswaDetail: Siswa | undefined;
    if (previousSiswaDetail) {
      optimisticSiswaDetail = {
        ...previousSiswaDetail,
        tagihan: previousSiswaDetail.tagihan?.map((t) =>
          t.id === tagihan.id
            ? {
                ...t,
                ...values,
                tanggalJatuhTempo: values.tanggalJatuhTempo || new Date(),
              }
            : t
        ),
      };
    }

    if (optimisticTagihanList)
      mutate(tagihanListKey, optimisticTagihanList, false);
    if (optimisticSiswaDetail)
      mutate(siswaDetailKey, optimisticSiswaDetail, false);

    toast.loading("Memperbarui tagihan...");

    try {
      await api.updateTagihan(tagihan.id, values);

      toast.dismiss();
      toast.success("Tagihan berhasil diperbarui!");

      mutate(tagihanListKey);
      mutate(siswaDetailKey);
      mutate(statsKey);

      onOpenChange(false);
      onTagihanUpdated?.();
    } catch (error: any) {
      toast.dismiss();
      toast.error("Gagal memperbarui tagihan.");

      if (previousTagihanList)
        mutate(tagihanListKey, previousTagihanList, false);
      if (previousSiswaDetail)
        mutate(siswaDetailKey, previousSiswaDetail, false);
    }
  };

  if (!tagihan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tagihan</DialogTitle>
          <DialogDescription>
            Ubah detail tagihan untuk siswa:{" "}
            <strong>{tagihan.siswa?.nama || "Siswa"}</strong>.
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
                      placeholder="Contoh: SPP Bulan September"
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
              name="tanggalJatuhTempo"
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
                    <FormLabel>Tanggal Jatuh Tempo</FormLabel>
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
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
