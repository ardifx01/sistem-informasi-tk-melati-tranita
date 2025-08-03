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
  jenisKelamin: z.enum(["L", "P"]),
  tanggalLahir: z.coerce.date(),
  alamat: z
    .string()
    .min(5, { message: "Alamat harus memiliki minimal 5 karakter." }),
  telepon: z.string().min(10, { message: "Nomor telepon minimal 10 digit." }),
  orangTua: z.string().min(3, { message: "Nama orang tua harus diisi." }),
  kelasId: z.string().cuid({ message: "Kelas harus dipilih." }),
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

// kategori pemasukan enum validasi
const KategoriPemasukanEnum = z.enum(
  ["UANG_SEKOLAH", "UANG_PENDAFTARAN", "LAINNYA"],
  {
    required_error: "Kategori pemasukan harus dipilih.",
  }
);

//pemasukan schema
export const createPemasukanSchema = z.object({
  jumlah: z.coerce.number().positive("Jumlah harus lebih dari 0"),
  keterangan: z.string().min(3, "Keterangan minimal 3 karakter."),
  kategori: z.enum(["UANG_SEKOLAH", "UANG_PENDAFTARAN", "LAINNYA"]),
  tagihanId: z.string().cuid({ message: "Tagihan ID tidak valid." }),
});

export const updatePemasukanSchema = createPemasukanSchema.partial();

// kategori pengeluaran enum validasi
const KategoriPengeluaranEnum = z.enum(
  [
    "ATK",
    "OPERASIONAL",
    "GAJI_GURU",
    "KEGIATAN_SISWA",
    "PERAWATAN_ASET",
    "LAINNYA",
  ],
  {
    required_error: "Kategori pengeluaran harus dipilih.",
  }
);

// pengeluaran schema
export const createPengeluaranSchema = z.object({
  tanggal: z.date({ required_error: "Tanggal pengeluaran harus diisi." }),
  jumlah: z
    .number({ required_error: "Jumlah tidak boleh kosong." })
    .int()
    .positive({ message: "Jumlah harus angka positif." }),
  keterangan: z.string().min(3, { message: "Keterangan minimal 3 karakter." }),
  kategori: KategoriPengeluaranEnum,
});

export const updatePengeluaranSchema = createPengeluaranSchema.partial();

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
