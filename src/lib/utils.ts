import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: Date | string,
  formatString: string = "dd MMMM yyyy"
): string {
  if (!date) return ""; // Mengembalikan string kosong jika tanggal tidak valid

  const dateObject = typeof date === "string" ? new Date(date) : date;

  // Cek apakah objek tanggal valid setelah konversi
  if (isNaN(dateObject.getTime())) {
    return "Tanggal tidak valid";
  }

  // Gunakan format dengan locale Bahasa Indonesia
  return format(dateObject, formatString, { locale: id });
}

export const currentYear = new Date().getFullYear();

export const formatRupiah = (value: number) =>
  `Rp ${value.toLocaleString("id-ID")}`;

export const formatTanggal = (value: string | Date) =>
  format(new Date(value), "dd/MM/yy");

export const sumJumlah = <T extends Record<string, any>>(
  rows: T[],
  columnHeader = "Jumlah"
) => {
  // Utility untuk mencari kolom jumlah bila data sudah diproyeksi ke array object dengan header
  return rows.reduce((acc, r) => {
    const val = r[columnHeader];
    if (typeof val === "number") return acc + val;
    return acc;
  }, 0);
};

export const getExcelColumnLetter = (colIndex: number) => {
  let temp = "";
  let col = colIndex;
  while (col > 0) {
    const rem = (col - 1) % 26;
    temp = String.fromCharCode(65 + rem) + temp;
    col = Math.floor((col - 1) / 26);
  }
  return temp;
};
