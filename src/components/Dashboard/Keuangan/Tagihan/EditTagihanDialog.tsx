"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { format } from "date-fns";
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
import { cn } from "@/lib/utils";
import type { Tagihan, Siswa } from "@/lib/types";
import { updateTagihanSchema } from "@/lib/validation";

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
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Jatuh Tempo</FormLabel>
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
