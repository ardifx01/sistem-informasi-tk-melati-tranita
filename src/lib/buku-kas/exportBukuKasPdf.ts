import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

// Tipe data gabungan untuk buku kas
export type BukuKasItem = {
  tanggal: Date;
  uraian: string;
  penerimaan: number;
  pengeluaran: number;
};

export interface ExportBukuKasPdfOptions {
  processedData: BukuKasItem[];
  totalPenerimaan: number;
  totalPengeluaran: number;
  sisaKas: number;
  periode: string;
  namaSekolah?: string;
}

export function exportBukuKasPdf({
  processedData,
  totalPenerimaan,
  totalPengeluaran,
  sisaKas,
  periode,
  namaSekolah = "TK Melati Tranita",
}: ExportBukuKasPdfOptions): void {
  const filename = `Buku_Kas_${periode}.pdf`;

  const doc = new jsPDF();

  // Header dokumen
  doc.setFontSize(16);
  doc.text(`Buku Kas - Periode ${periode}`, 14, 15);
  doc.setFontSize(12);
  doc.text(namaSekolah, 14, 22);

  // Tabel data
  autoTable(doc, {
    startY: 30,
    head: [["No", "Tanggal", "Uraian", "Penerimaan (Rp)", "Pengeluaran (Rp)"]],
    body: processedData.map((item, index) => [
      index + 1,
      format(item.tanggal, "dd/MM/yyyy"),
      item.uraian,
      item.penerimaan.toLocaleString("id-ID"),
      item.pengeluaran.toLocaleString("id-ID"),
    ]),
    foot: [
      [
        "",
        "",
        "Total",
        totalPenerimaan.toLocaleString("id-ID"),
        totalPengeluaran.toLocaleString("id-ID"),
      ],
      ["", "", "Sisa Kas", sisaKas.toLocaleString("id-ID"), ""],
    ],
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    footStyles: {
      fillColor: [236, 240, 241],
      textColor: 0,
      fontStyle: "bold",
    },
    didDrawPage: (data) => {
      // Tambahkan area tanda tangan di halaman terakhir
      const pageCount = doc.getNumberOfPages();
      if (data.pageNumber === pageCount) {
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(10);

        // Tanggal dan tempat
        doc.text(
          `Pekanbaru, ${format(new Date(), "dd MMMM yyyy", {
            locale: localeID,
          })}`,
          140,
          pageHeight - 55
        );

        // Area tanda tangan
        doc.text("Mengetahui,", 14, pageHeight - 40);
        doc.text("Ketua Yayasan", 14, pageHeight - 15);
        doc.text("Bendahara Sekolah", 140, pageHeight - 15);

        // Garis untuk tanda tangan
        doc.line(14, pageHeight - 20, 80, pageHeight - 20); // Ketua Yayasan
        doc.line(140, pageHeight - 20, 200, pageHeight - 20); // Bendahara
      }
    },
  });

  doc.save(filename);
}
