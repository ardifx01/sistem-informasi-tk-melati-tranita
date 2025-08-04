"use client";

import { useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { api } from "@/lib/api";
import type { Tagihan } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/shared/CurrencyInput";

// Skema validasi Zod untuk update tagihan
const updateTagihanSchema = z.object({
  keterangan: z.string().min(3, "Keterangan minimal 3 karakter."),
  jumlahTagihan: z.coerce.number().positive("Jumlah harus angka positif."),
  tanggalJatuhTempo: z.date({
    required_error: "Tanggal jatuh tempo harus diisi.",
  }),
});

type TagihanFormValues = z.infer<typeof updateTagihanSchema>;

interface EditTagihanDialogProps {
  tagihan: Tagihan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagihanUpdated?: () => void;
}

export function EditTagihanDialog({
  tagihan,
  open,
  onOpenChange,
  onTagihanUpdated,
}: EditTagihanDialogProps) {
  const form = useForm<TagihanFormValues>({
    resolver: zodResolver(updateTagihanSchema),
  });

  useEffect(() => {
    if (tagihan) {
      form.reset({
        keterangan: tagihan.keterangan,
        jumlahTagihan: tagihan.jumlahTagihan,
        tanggalJatuhTempo: new Date(tagihan.tanggalJatuhTempo),
      });
    }
  }, [tagihan, form]);

  const onSubmit = async (values: TagihanFormValues) => {
    if (!tagihan) return;

    try {
      await api.updateTagihan(tagihan.id, values);
      toast.success("Tagihan berhasil diperbarui!");
      onOpenChange(false);
      onTagihanUpdated?.();
    } catch (error) {
      toast.error("Gagal memperbarui tagihan.");
    }
  };

  if (!tagihan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tagihan</DialogTitle>
          <DialogDescription>
            Perbarui detail tagihan untuk siswa {tagihan.siswa.nama}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="keterangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
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
              name="jumlahTagihan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Tagihan (Rp)</FormLabel>
                  <FormControl>
                    {/* <Input type="number" placeholder="150000" {...field} /> */}
                    <CurrencyInput
                      placeholder="Contoh: 200.000"
                      value={field.value ?? 0}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage className="text-gray-400">
                    Jumlah tagihan otomatis saat tagihan dibuat
                  </FormMessage>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
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
