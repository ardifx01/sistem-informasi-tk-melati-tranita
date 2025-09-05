import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { id as localeID } from "date-fns/locale";

// Tipe data untuk input
export type Pemasukan = {
  id?: string;
  tanggal: string | Date;
  keterangan: string;
  jumlah: number;
  kategori?: string;
};

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

export function processLaporanData({
  allPemasukan,
  allPengeluaran,
  filterType,
  selectedDate,
}: ProcessLaporanDataOptions): ProcessedLaporanData {
  // Tentukan rentang tanggal berdasarkan filter
  let startDate: Date, endDate: Date;

  if (filterType === "tahunan") {
    startDate = startOfYear(selectedDate);
    endDate = endOfYear(selectedDate);
  } else {
    startDate = startOfMonth(selectedDate);
    endDate = endOfMonth(selectedDate);
  }

  // Filter data pemasukan berdasarkan rentang tanggal
  const filteredPemasukan = allPemasukan.filter((p) => {
    const tgl = new Date(p.tanggal);
    return tgl >= startDate && tgl <= endDate;
  });

  // Filter data pengeluaran berdasarkan rentang tanggal
  const filteredPengeluaran = allPengeluaran.filter((p) => {
    const tgl = new Date(p.tanggal);
    return tgl >= startDate && tgl <= endDate;
  });

  // Hitung total-total
  const totalPemasukan = filteredPemasukan.reduce(
    (sum, item) => sum + item.jumlah,
    0
  );
  const totalPengeluaran = filteredPengeluaran.reduce(
    (sum, item) => sum + item.jumlah,
    0
  );
  const selisih = totalPemasukan - totalPengeluaran;

  return {
    pemasukan: filteredPemasukan,
    pengeluaran: filteredPengeluaran,
    totalPemasukan,
    totalPengeluaran,
    selisih,
  };
}

export function getFilenameSuffix(
  filterType: FilterType,
  selectedDate: Date
): string {
  return filterType === "tahunan"
    ? format(selectedDate, "yyyy")
    : format(selectedDate, "MMMM-yyyy", { locale: localeID });
}

export function getPeriodeText(
  filterType: FilterType,
  selectedDate: Date
): string {
  return filterType === "tahunan"
    ? format(selectedDate, "yyyy")
    : format(selectedDate, "MMMM yyyy", { locale: localeID });
}
