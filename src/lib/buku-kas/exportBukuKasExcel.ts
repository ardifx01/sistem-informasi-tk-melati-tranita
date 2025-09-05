import * as XLSX from "xlsx";
import { format } from "date-fns";

// Tipe data gabungan untuk buku kas
export type BukuKasItem = {
  tanggal: Date;
  uraian: string;
  penerimaan: number;
  pengeluaran: number;
};

export interface ExportBukuKasExcelOptions {
  processedData: BukuKasItem[];
  totalPenerimaan: number;
  totalPengeluaran: number;
  sisaKas: number;
  periode: string;
  namaSheet?: string;
}

export function exportBukuKasExcel({
  processedData,
  totalPenerimaan,
  totalPengeluaran,
  sisaKas,
  periode,
  namaSheet = "Buku Kas",
}: ExportBukuKasExcelOptions): void {
  const filename = `Buku_Kas_${periode}.xlsx`;

  // Header tabel
  const header = [
    "No",
    "Tanggal",
    "Uraian",
    "Penerimaan (Rp)",
    "Pengeluaran (Rp)",
  ];

  // Data body
  const body = processedData.map((item, index) => [
    index + 1,
    format(item.tanggal, "dd/MM/yyyy"),
    item.uraian,
    item.penerimaan,
    item.pengeluaran,
  ]);

  // Footer dengan total dan sisa kas
  const footer = [
    ["", "", "Total", totalPenerimaan, totalPengeluaran],
    ["", "", "Sisa Kas", sisaKas, ""],
  ];

  // Gabungkan semua data
  const dataToExport = [header, ...body, [], ...footer];

  // Buat worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(dataToExport);

  // Atur lebar kolom untuk keterbacaan yang lebih baik
  worksheet["!cols"] = [
    { wch: 5 }, // No
    { wch: 12 }, // Tanggal
    { wch: 40 }, // Uraian
    { wch: 18 }, // Penerimaan
    { wch: 18 }, // Pengeluaran
  ];

  // Format currency untuk kolom angka (opsional - untuk tampilan yang lebih baik)
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let row = 1; row <= range.e.r; row++) {
    // Format kolom Penerimaan (kolom D)
    const penerimaanCell = XLSX.utils.encode_cell({ r: row, c: 3 });
    if (
      worksheet[penerimaanCell] &&
      typeof worksheet[penerimaanCell].v === "number"
    ) {
      worksheet[penerimaanCell].z = "#,##0";
    }

    // Format kolom Pengeluaran (kolom E)
    const pengeluaranCell = XLSX.utils.encode_cell({ r: row, c: 4 });
    if (
      worksheet[pengeluaranCell] &&
      typeof worksheet[pengeluaranCell].v === "number"
    ) {
      worksheet[pengeluaranCell].z = "#,##0";
    }
  }

  // Buat workbook dan tambahkan worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, namaSheet);

  // Simpan file
  XLSX.writeFile(workbook, filename);
}
