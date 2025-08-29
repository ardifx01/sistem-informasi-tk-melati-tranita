import { z } from "zod";

// User schemas
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ADMIN", "GURU"]).default("ADMIN"),
});

//jenis kelamin enum validasi
const JenisKelaminEnum = z.enum(["L", "P"], {
  required_error: "Jenis kelamin harus diisi.",
});

// Siswa schemas
export const createSiswaSchema = z.object({
  nama: z
    .string()
    .min(3, { message: "Nama harus memiliki minimal 3 karakter." }),
  nis: z.string().min(1, { message: "NIS tidak boleh kosong." }),
  jenisKelamin: JenisKelaminEnum,
  tanggalLahir: z.coerce.date(),
  alamat: z
    .string()
    .min(5, { message: "Alamat harus memiliki minimal 5 karakter." }),
  telepon: z.string().min(10, { message: "Nomor telepon minimal 10 digit." }),
  orangTua: z.string().min(3, { message: "Nama orang tua harus diisi." }),
  kelasId: z.string().cuid({ message: "Kelas harus dipilih." }),
  jumlahSpp: z.coerce
    .number({ required_error: "Tingkat SPP harus dipilih." })
    .positive("Tingkat SPP harus dipilih."),
});

export const updateSiswaSchema = createSiswaSchema.partial();

// Kelas schemas
export const createKelasSchema = z.object({
  nama: z.string().min(1, { message: "Nama kelas tidak boleh kosong." }),
  waliKelas: z
    .string()
    .min(3, { message: "Nama wali kelas minimal 3 karakter." }),
});

export const updateKelasSchema = createKelasSchema.partial();

//pemasukan schema
export const createPemasukanSchema = z.object({
  jumlah: z.coerce.number().positive("Jumlah harus lebih dari 0"),
  keterangan: z.string().min(3, "Keterangan minimal 3 karakter."),
  kategori: z.string({ required_error: "Kategori harus dipilih." }),
  tagihanId: z.string().cuid({ message: "Tagihan ID tidak valid." }),
});

export const updatePemasukanSchema = createPemasukanSchema.partial();

// pengeluaran schema
export const createPengeluaranSchema = z.object({
  tanggal: z.coerce.date({
    required_error: "Tanggal pengeluaran harus diisi.",
  }),
  jumlah: z.coerce
    .number({ required_error: "Jumlah tidak boleh kosong." })
    .int()
    .positive({ message: "Jumlah harus angka positif." }),
  keterangan: z.string().min(3, { message: "Keterangan minimal 3 karakter." }),
  kategori: z.string({ required_error: "Kategori harus dipilih." }),
});

export const updatePengeluaranSchema = createPengeluaranSchema.partial();

//single tagihan
export const createSingleTagihanSchema = z.object({
  keterangan: z.string().min(3, "Keterangan minimal 3 karakter."),
  jumlahTagihan: z.coerce.number().positive("Jumlah harus angka positif."),
  tanggalJatuhTempo: z.date({
    required_error: "Tanggal jatuh tempo harus diisi.",
  }),
  siswaId: z.string().cuid(),
});

//tagihan
export const createTagihanSchema = z.object({
  kelasId: z.string({ required_error: "Pilihan kelas harus diisi." }),
  jumlahTagihan: z.coerce.number().positive("Jumlah harus angka positif."),
  keterangan: z.string().min(3, "Keterangan minimal 3 karakter."),
  tanggalJatuhTempo: z.coerce.date({
    required_error: "Tanggal jatuh tempo harus diisi.",
  }),
});

export const updateTagihanSchema = createTagihanSchema.partial();

//kategori
export const createKategoriSchema = z.object({
  nama: z
    .string()
    .min(3, { message: "Nama kategori harus memiliki minimal 3 karakter." }),
  tipe: z
    .string()
    .nonempty({ message: "Tipe kategori harus dipilih." })
    .pipe(z.enum(["PEMASUKAN", "PENGELUARAN"])),
});

// Skema untuk memperbarui kategori (hanya nama yang bisa diubah)
export const updateKategoriSchema = createKategoriSchema.partial();

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type SiswaInput = z.infer<typeof createSiswaSchema>;
export type UpdateSiswaInput = z.infer<typeof updateSiswaSchema>;

export type KelasInput = z.infer<typeof createKelasSchema>;
export type UpdateKelasInput = z.infer<typeof updateKelasSchema>;

export type PemasukanInput = z.infer<typeof createPemasukanSchema>;
export type UpdatePemasukanInput = z.infer<typeof updatePemasukanSchema>;

export type PengeluaranInput = z.infer<typeof createPengeluaranSchema>;
export type UpdatePengeluaranInput = z.infer<typeof updatePengeluaranSchema>;

export type TagihanInput = z.infer<typeof createTagihanSchema>;
export type UpdateTagihanInput = z.infer<typeof updateTagihanSchema>;

export type KategoriInput = z.infer<typeof createKategoriSchema>;
export type UpdateKategoriInput = z.infer<typeof updateKategoriSchema>;
