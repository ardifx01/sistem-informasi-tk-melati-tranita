// Types
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "GURU";
  };
}

//user
export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "GURU";
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// siswa
export interface Siswa {
  id: string;
  nis: string;
  nama: string;
  jenisKelamin: "L" | "P";
  tanggalLahir: string | Date;
  alamat: string;
  telepon: string;
  orangTua: string;
  kelasId: string;
  kelas: Kelas | string;
  tagihan?: Tagihan[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateSiswaRequest {
  nama: string;
  nis: string;
  jenisKelamin: "L" | "P";
  tanggalLahir: Date;
  alamat: string;
  telepon: string;
  orangTua: string;
  kelasId: string;
}

export interface UpdateSiswaRequest {
  nama?: string;
  nis?: string;
  jenisKelamin?: "L" | "P";
  tanggalLahir?: Date;
  alamat?: string;
  telepon?: string;
  orangTua?: string;
  kelasId?: string;
}

// kelas
export interface Kelas {
  id: string;
  nama: string;
  waliKelas: string;
  jumlahSiswa?: number;
  siswa?: Siswa[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// tagihan
export type StatusPembayaran = "BELUM_LUNAS" | "LUNAS" | "TERLAMBAT";

export interface Tagihan {
  id: string;
  siswaId: string;
  siswa: Siswa;
  keterangan: string;
  jumlahTagihan: number;
  tanggalJatuhTempo: string | Date;
  status: StatusPembayaran;
  pemasukan?: Pemasukan | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Tipe untuk membuat tagihan baru
export interface CreateTagihanRequest {
  siswaId: string;
  keterangan: string;
  jumlahTagihan: number;
  tanggalJatuhTempo: Date;
}

//kategori pemasukan dan pengeluaran
export type KategoriPemasukan = "UANG_SEKOLAH" | "UANG_PENDAFTARAN" | "LAINNYA";
export type KategoriPengeluaran =
  | "ATK"
  | "OPERASIONAL"
  | "GAJI_GURU"
  | "KEGIATAN_SISWA"
  | "PERAWATAN_ASET"
  | "LAINNYA";

// pemasukan
export interface Pemasukan {
  tagihan: any;
  id: string;
  tanggal: string | Date;
  jumlah: number;
  keterangan: string;
  kategori: KategoriPemasukan;
  siswaId: string;
  siswa: Siswa; // Relasi ke siswa yang membayar
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreatePemasukanRequest {
  jumlah: number;
  keterangan: string;
  kategori: KategoriPemasukan;
  tagihanId: string;
}

// pengeluaran
export interface Pengeluaran {
  id: string;
  tanggal: string | Date;
  jumlah: number;
  keterangan: string;
  kategori: KategoriPengeluaran;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreatePengeluaranRequest {
  tanggal: Date;
  jumlah: number;
  keterangan: string;
  kategori: KategoriPengeluaran;
}

// dashboard Stats
export interface DashboardStats {
  overview: {
    totalSiswa: number;
    totalKelas: number;
    totalUser: number;
    totalPemasukan: number;
    totalPengeluaran: number;
    saldoSaatIni: number;
    pemasukanBulanIni: number;
    pengeluaranBulanIni: number;
    totalSiswaBelumBayar: number;
  };
  genderDistribution: Array<{
    gender: "Laki-laki" | "Perempuan";
    count: number;
  }>;
  classDistribution: Array<{
    nama: string;
    count: number;
  }>;
  kategoriPengeluaranDistribution: Array<{
    kategori: KategoriPengeluaran;
    total: number;
  }>;
  recentTransactions: Array<{
    id: string;
    tanggal: string | Date;
    jumlah: number;
    keterangan: string;
    type: "pemasukan" | "pengeluaran";
  }>;
}
