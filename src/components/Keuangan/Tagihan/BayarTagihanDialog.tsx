"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Tagihan, KategoriPemasukan } from "@/lib/types";
import { CurrencyInput } from "@/components/shared/CurrencyInput";

// Skema validasi untuk form pembayaran
const createPemasukanSchema = z.object({
  jumlah: z.coerce.number().positive("Jumlah harus lebih dari 0"),
  keterangan: z.string().min(3, "Keterangan minimal 3 karakter."),
  kategori: z.enum(["UANG_SEKOLAH", "UANG_PENDAFTARAN", "LAINNYA"]),
  tagihanId: z.string(),
});

type PemasukanFormValues = z.infer<typeof createPemasukanSchema>;

// Opsi untuk kategori pemasukan
const kategoriOptions: { value: KategoriPemasukan; label: string }[] = [
  { value: "UANG_SEKOLAH", label: "Uang Sekolah (SPP)" },
  { value: "UANG_PENDAFTARAN", label: "Uang Pendaftaran" },
  { value: "LAINNYA", label: "Lainnya" },
];

interface BayarTagihanDialogProps {
  tagihan: Tagihan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPembayaranSuccess?: () => void;
}

export function BayarTagihanDialog({
  tagihan,
  open,
  onOpenChange,
  onPembayaranSuccess,
}: BayarTagihanDialogProps) {
  const form = useForm<PemasukanFormValues>({
    resolver: zodResolver(createPemasukanSchema),
    defaultValues: {
      jumlah: 0,
      keterangan: "",
      kategori: "UANG_SEKOLAH",
      tagihanId: "",
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (tagihan && open) {
      form.reset({
        jumlah: tagihan.jumlahTagihan,
        keterangan: tagihan.keterangan,
        kategori: "UANG_SEKOLAH",
        tagihanId: tagihan.id,
      });
    }
  }, [tagihan, open, form]);

  const onSubmit = async (values: PemasukanFormValues) => {
    try {
      await api.createPemasukan(values);
      toast.success("Pembayaran berhasil dicatat!");
      onOpenChange(false);
      onPembayaranSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Gagal mencatat pembayaran.";
      toast.error(errorMessage);
    }
  };

  if (!tagihan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Proses Pembayaran Tagihan</DialogTitle>
          <DialogDescription>
            Konfirmasi pembayaran untuk siswa:{" "}
            <strong>{tagihan.siswa.nama}</strong>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="p-4 border rounded-md bg-muted/50">
              <p className="font-semibold">{tagihan.keterangan}</p>
              <p className="text-2xl font-bold">
                Rp {tagihan.jumlahTagihan.toLocaleString("id-ID")}
              </p>
            </div>

            <FormField
              control={form.control}
              name="jumlah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Bayar (Rp)</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value ?? 0}
                      onChange={field.onChange}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* --- DROPDOWN KATEGORI BARU --- */}
            <FormField
              control={form.control}
              name="kategori"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori Pembayaran</FormLabel>
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
                  <FormLabel>Catatan Pembayaran</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Dibayar via transfer"
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
                {isSubmitting ? "Memproses..." : "Konfirmasi Pembayaran"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
