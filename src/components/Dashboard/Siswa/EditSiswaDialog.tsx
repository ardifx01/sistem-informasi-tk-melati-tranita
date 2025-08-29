"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { Siswa, Kelas } from "@/lib/types";
import { updateSiswaSchema } from "@/lib/validation";
import { useSWRConfig } from "swr";

const sppOptions = [
  { value: 175000, label: "Rp 175.000" },
  { value: 150000, label: "Rp 150.000" },
  { value: 100000, label: "Rp 100.000" },
  { value: 350000, label: "Rp 350.000" },
];

// Tipe untuk nilai form, diambil dari skema Zod
type SiswaFormValues = z.infer<typeof updateSiswaSchema>;

interface EditSiswaDialogProps {
  siswa: Siswa | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSiswaUpdated?: () => void;
}

export function EditSiswaDialog({
  siswa,
  open,
  onOpenChange,
  onSiswaUpdated,
}: EditSiswaDialogProps) {
  const { cache, mutate } = useSWRConfig();
  const [kelas, setKelas] = useState<Kelas[]>([]);

  const form = useForm<SiswaFormValues>({
    resolver: zodResolver(updateSiswaSchema),
    defaultValues: {
      nama: "",
      nis: "",
      jenisKelamin: undefined,
      alamat: "",
      telepon: "",
      orangTua: "",
      kelasId: "",
      tanggalLahir: undefined,
      jumlahSpp: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  // Memuat data kelas saat dialog dibuka
  useEffect(() => {
    const loadKelas = async () => {
      try {
        const data = await api.getKelas();
        setKelas(data);
      } catch (error) {
        toast.error("Gagal memuat daftar kelas.");
      }
    };
    if (open) {
      loadKelas();
    }
  }, [open]);

  // Mengisi form dengan data siswa yang ada saat dialog dibuka atau siswa berubah
  useEffect(() => {
    if (siswa) {
      form.reset({
        ...siswa,
        tanggalLahir: new Date(siswa.tanggalLahir), // Pastikan tanggalLahir adalah objek Date
      });
    }
  }, [siswa, form]);

  const onSubmit = async (values: SiswaFormValues) => {
    if (!siswa) return;

    const siswaListKey = "/api/siswa";
    const siswaDetailKey = `/api/siswa/${siswa.id}`;
    const statsKey = "/api/dashboard/stats";

    // 1. Ambil data saat ini dari cache untuk rollback
    const previousSiswaList = cache.get(siswaListKey)?.data as
      | Siswa[]
      | undefined;

    // 2. Buat data optimis
    const optimisticData =
      previousSiswaList?.map((item) =>
        item.id === siswa.id
          ? {
              ...item,
              ...values,
              tanggalLahir: values.tanggalLahir || item.tanggalLahir,
            }
          : item
      ) || [];

    // 3. Perbarui UI secara instan
    mutate(siswaListKey, optimisticData, false);
    toast.loading("Menyimpan perubahan...");
    onOpenChange(false);

    try {
      // 4. Kirim permintaan ke API
      await api.updateSiswa(siswa.id, values);

      // 5. Jika berhasil, ganti notifikasi dan picu validasi ulang
      toast.dismiss();
      toast.success("Data siswa berhasil diperbarui!");
      mutate(siswaListKey);
      mutate(siswaDetailKey);
      mutate(statsKey);

      onSiswaUpdated?.();
    } catch (error: any) {
      // 6. Jika gagal, kembalikan UI ke kondisi semula (rollback)
      toast.dismiss();
      const errorMessage =
        error.response?.data?.error || "Gagal memperbarui data siswa.";
      toast.error(errorMessage);
      if (previousSiswaList) {
        mutate(siswaListKey, previousSiswaList, false);
      }
    }
  };

  if (!siswa) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Data Siswa</DialogTitle>
          <DialogDescription>
            Perbarui informasi untuk siswa bernama {siswa.nama}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama lengkap siswa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />{" "}
              <FormField
                control={form.control}
                name="nis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIS</FormLabel>
                    <FormControl>
                      <Input placeholder="Nomor Induk Siswa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kelasId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kelas</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kelas" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {kelas.map((k) => (
                          <SelectItem key={k.id} value={k.id}>
                            {k.nama}
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
                name="tanggalLahir"
                render={({ field }) => {
                  const [dateString, setDateString] = useState(
                    field.value
                      ? format(new Date(field.value), "dd/MM/yyyy")
                      : ""
                  );

                  useEffect(() => {
                    if (field.value) {
                      setDateString(
                        format(new Date(field.value), "dd/MM/yyyy")
                      );
                    } else {
                      setDateString("");
                    }
                  }, [field.value]);

                  return (
                    <FormItem>
                      <FormLabel>Tanggal Lahir</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="DD/MM/YYYY"
                            value={dateString}
                            onChange={(e) => setDateString(e.target.value)}
                            onBlur={() => {
                              const parsedDate = parse(
                                dateString,
                                "dd/MM/yyyy",
                                new Date()
                              );
                              if (isValid(parsedDate)) {
                                field.onChange(parsedDate);
                              } else {
                                field.onChange(undefined);
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
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                field.onChange(date);
                                if (date) {
                                  setDateString(format(date, "dd/MM/yyyy"));
                                }
                              }}
                              // disabled={(date) =>
                              //   date > new Date() ||
                              //   date < new Date("1990-01-01")
                              // }
                              initialFocus
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jenisKelamin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Kelamin</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jumlahSpp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tingkat SPP</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tingkatan SPP" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sppOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value.toString()}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="orangTua"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Orang Tua/Wali</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama orang tua atau wali"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telepon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="Nomor telepon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="alamat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Alamat lengkap siswa"
                      className="resize-none min-h-[50px]"
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
