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
