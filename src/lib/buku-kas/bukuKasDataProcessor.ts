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
  tanggal: string | Date;
  keterangan: string;
  jumlah: number;
};

export type Pengeluaran = {
  tanggal: string | Date;
  keterangan: string;
  jumlah: number;
};

// Tipe data gabungan untuk buku kas
export type BukuKasItem = {
  tanggal: Date;
  uraian: string;
  penerimaan: number;
  pengeluaran: number;
};

export type FilterType = "bulanan" | "tahunan";

export interface ProcessedBukuKasData {
  processedData: BukuKasItem[];
  totalPenerimaan: number;
  totalPengeluaran: number;
  sisaKas: number;
}

export interface ProcessBukuKasDataOptions {
  allPemasukan: Pemasukan[];
  allPengeluaran: Pengeluaran[];
  filterType: FilterType;
  selectedDate: Date;
}

export function processBukuKasData({
  allPemasukan,
  allPengeluaran,
  filterType,
  selectedDate,
}: ProcessBukuKasDataOptions): ProcessedBukuKasData {
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

  // Transform pemasukan ke format BukuKasItem
  const mappedPemasukan: BukuKasItem[] = filteredPemasukan.map((p) => ({
    tanggal: new Date(p.tanggal),
    uraian: p.keterangan,
    penerimaan: p.jumlah,
    pengeluaran: 0,
  }));

  // Transform pengeluaran ke format BukuKasItem
  const mappedPengeluaran: BukuKasItem[] = filteredPengeluaran.map((p) => ({
    tanggal: new Date(p.tanggal),
    uraian: p.keterangan,
    penerimaan: 0,
    pengeluaran: p.jumlah,
  }));

  // Gabungkan dan urutkan berdasarkan tanggal
  const processedData = [...mappedPemasukan, ...mappedPengeluaran].sort(
    (a, b) => a.tanggal.getTime() - b.tanggal.getTime()
  );

  // Hitung total-total
  const totalPenerimaan = processedData.reduce(
    (sum, item) => sum + item.penerimaan,
    0
  );
  const totalPengeluaran = processedData.reduce(
    (sum, item) => sum + item.pengeluaran,
    0
  );
  const sisaKas = totalPenerimaan - totalPengeluaran;

  return {
    processedData,
    totalPenerimaan,
    totalPengeluaran,
    sisaKas,
  };
}

export function getFilenameSuffix(
  filterType: FilterType,
  selectedDate: Date
): string {
  return filterType === "tahunan"
    ? format(selectedDate, "yyyy")
    : format(selectedDate, "MMMM yyyy", { locale: localeID });
}
