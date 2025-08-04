"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { Kelas } from "@/lib/types";
import { createSiswaSchema } from "@/lib/validation";

// Tipe untuk nilai form, diambil dari skema Zod
type SiswaFormValues = z.infer<typeof createSiswaSchema>;

interface AddSiswaDialogProps {
  onSiswaAdded?: () => void;
}

export function AddSiswaDialog({ onSiswaAdded }: AddSiswaDialogProps) {
  const [open, setOpen] = useState(false);
  const [kelas, setKelas] = useState<Kelas[]>([]);

  const form = useForm<SiswaFormValues>({
    resolver: zodResolver(createSiswaSchema),
    defaultValues: {
      nama: "",
      nis: "",
      jenisKelamin: undefined,
      alamat: "",
      telepon: "",
      orangTua: "",
      kelasId: "",
      tanggalLahir: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    const loadKelas = async () => {
      try {
        const data = await api.getKelas();
        setKelas(data);
      } catch (error) {
        console.error("Error loading kelas:", error);
        toast.error("Gagal memuat daftar kelas.");
      }
    };

    if (open) {
      loadKelas();
    }
  }, [open]);

  const onSubmit = async (values: SiswaFormValues) => {
    try {
      await api.createSiswa(values);
      toast.success("Siswa baru berhasil ditambahkan!");
      form.reset();
      setOpen(false);
      onSiswaAdded?.();
    } catch (error: any) {
      console.error("Error creating siswa:", error);
      const errorMessage =
        error.response?.data?.error || "Gagal menambahkan siswa.";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Siswa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Siswa Baru</DialogTitle>
          <DialogDescription>
            Lengkapi formulir di bawah ini untuk menambahkan siswa baru.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            />
            <div className="grid grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="kelasId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kelas</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jenisKelamin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Kelamin</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
                name="tanggalLahir"
                render={({ field }) => {
                  // State lokal untuk menangani input string dari pengguna
                  const [dateString, setDateString] = useState(
                    field.value ? format(field.value, "dd/MM/yyyy") : ""
                  );

                  // Sinkronkan input string ketika nilai form berubah (misal dari kalender)
                  useEffect(() => {
                    if (field.value) {
                      setDateString(format(field.value, "dd/MM/yyyy"));
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
                                  setDateString(format(date, "dd/MM/yyyy"));
                                }
                              }}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1990-01-01")
                              }
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
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-3">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Batal
                </Button>
              </DialogClose>
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
