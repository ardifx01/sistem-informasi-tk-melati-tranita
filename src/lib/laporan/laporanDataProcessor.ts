import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { id as localeID } from "date-fns/locale";
import { Pemasukan } from "../types";

// Tipe data
export type Pengeluaran = {
  id?: string;
  tanggal: string | Date;
  keterangan: string;
  jumlah: number;
  kategori?: string;
};

export type FilterType = "bulanan" | "tahunan";

export interface ProcessedLaporanData {
  pemasukan: Pemasukan[];
  pengeluaran: Pengeluaran[];
  totalPemasukan: number;
  totalPengeluaran: number;
  selisih: number;
}

export interface ProcessLaporanDataOptions {
  allPemasukan: Pemasukan[];
  allPengeluaran: Pengeluaran[];
  filterType: FilterType;
  selectedDate: Date;
}

// Untuk laporan tabel export Pemasukan
export interface LaporanPemasukanRow {
  tanggal: string;
  kelas: string;
  namaSiswa: string;
  keterangan: string;
  jumlah: string;
}

export interface LaporanPemasukanResult {
  rows: LaporanPemasukanRow[];
  total: number;
  totalFormatted: string;
}

// Helper Rupiah
const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

// Generate laporan pemasukan
export function generateLaporanPemasukan(
  pemasukanList: Pemasukan[]
): LaporanPemasukanResult {
  // urutkan berdasarkan kelas ASC lalu nama siswa ASC
  const sorted = [...pemasukanList].sort((a, b) => {
    const kelasA = a.tagihan?.siswa?.kelas?.nama || "";
    const kelasB = b.tagihan?.siswa?.kelas?.nama || "";

    if (kelasA === kelasB) {
      return (a.tagihan?.siswa?.nama || "").localeCompare(
        b.tagihan?.siswa?.nama || ""
      );
    }
    return kelasA.localeCompare(kelasB);
  });

  let total = 0;

  const rows: LaporanPemasukanRow[] = sorted.map((p) => {
    const siswa = p.tagihan?.siswa;
    const kelas = siswa?.kelas?.nama || "-";

    total += p.jumlah || 0;

    return {
      tanggal: format(new Date(p.tanggal), "dd/MM/yyyy", { locale: localeID }),
      kelas,
      namaSiswa: siswa?.nama || "-",
      keterangan: p.keterangan || "-",
      jumlah: p.jumlah ? formatRupiah(p.jumlah) : "",
    };
  });

  return {
    rows,
    total,
    totalFormatted: formatRupiah(total),
  };
}

// Untuk laporan tabel export Pengeluaran
export interface LaporanPengeluaranRow {
  tanggal: string;
  keterangan: string;
  kategori: string;
  jumlah: string;
}

export interface LaporanPengeluaranResult {
  rows: LaporanPengeluaranRow[];
  total: number;
  totalFormatted: string;
}

export function generateLaporanPengeluaran(
  pengeluaranList: Pengeluaran[]
): LaporanPengeluaranResult {
  let total = 0;

  const rows: LaporanPengeluaranRow[] = pengeluaranList.map((p) => {
    total += p.jumlah || 0;

    return {
      tanggal: format(new Date(p.tanggal), "dd/MM/yyyy", { locale: localeID }),
      keterangan: p.keterangan,
      kategori: p.kategori || "-",
      jumlah: formatRupiah(p.jumlah),
    };
  });

  return {
    rows,
    total,
    totalFormatted: formatRupiah(total),
  };
}

// Proses data laporan umum
export function processLaporanData({
  allPemasukan,
  allPengeluaran,
  filterType,
  selectedDate,
}: ProcessLaporanDataOptions): ProcessedLaporanData {
  // Tentukan rentang tanggal
  let startDate: Date, endDate: Date;
  if (filterType === "tahunan") {
    startDate = startOfYear(selectedDate);
    endDate = endOfYear(selectedDate);
  } else {
    startDate = startOfMonth(selectedDate);
    endDate = endOfMonth(selectedDate);
  }

  // Filter pemasukan
  const filteredPemasukan = allPemasukan.filter((p) => {
    const tgl = new Date(p.tanggal);
    return tgl >= startDate && tgl <= endDate;
  });

  // Urutkan berdasarkan kelas (nama kelas ASC, lalu nama siswa ASC)
  const sortedPemasukan = filteredPemasukan.sort((a, b) => {
    const kelasA = a.tagihan?.siswa?.kelas?.nama || "";
    const kelasB = b.tagihan?.siswa?.kelas?.nama || "";

    if (kelasA === kelasB) {
      return (a.tagihan?.siswa?.nama || "").localeCompare(
        b.tagihan?.siswa?.nama || ""
      );
    }
    return kelasA.localeCompare(kelasB);
  });

  // Filter pengeluaran
  const filteredPengeluaran = allPengeluaran.filter((p) => {
    const tgl = new Date(p.tanggal);
    return tgl >= startDate && tgl <= endDate;
  });

  // Hitung total pemasukan & pengeluaran
  const totalPemasukan = sortedPemasukan.reduce(
    (sum, item) => sum + (item.jumlah || 0),
    0
  );
  const totalPengeluaran = filteredPengeluaran.reduce(
    (sum, item) => sum + (item.jumlah || 0),
    0
  );
  const selisih = totalPemasukan - totalPengeluaran;

  return {
    pemasukan: sortedPemasukan,
    pengeluaran: filteredPengeluaran,
    totalPemasukan,
    totalPengeluaran,
    selisih,
  };
}

// Helper untuk filename/label
export function getFilenameSuffix(
  filterType: FilterType,
  selectedDate: Date
): string {
  return filterType === "tahunan"
    ? format(selectedDate, "yyyy")
    : format(selectedDate, "MMMM yyyy", { locale: localeID });
}
