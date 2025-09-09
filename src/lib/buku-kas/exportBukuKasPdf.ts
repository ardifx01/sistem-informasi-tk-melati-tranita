import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

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
  namaSekolah = "TK MELATI TRANITA",
}: ExportBukuKasPdfOptions): void {
  const filename = `Buku Kas ${periode}.pdf`;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // === Header ===
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text(
    `BUKU KAS ${namaSekolah}`,
    doc.internal.pageSize.getWidth() / 2,
    20,
    {
      align: "center",
    }
  );

  doc.setFontSize(12);
  doc.setFont("times", "normal");
  doc.text(`Periode ${periode}`, doc.internal.pageSize.getWidth() / 2, 27, {
    align: "center",
  });

  // === Tabel ===
  autoTable(doc, {
    startY: 35,
    theme: "grid",
    head: [["No", "Tanggal", "Uraian", "Penerimaan (Rp)", "Pengeluaran (Rp)"]],
    body: processedData.map((item, index) => [
      index + 1,
      format(item.tanggal, "dd/MM/yyyy"),
      item.uraian,
      item.penerimaan ? item.penerimaan.toLocaleString("id-ID") : "-",
      item.pengeluaran ? item.pengeluaran.toLocaleString("id-ID") : "-",
    ]),
    foot: [
      [
        { content: "Total", colSpan: 3, styles: { halign: "right" } },
        {
          content: totalPenerimaan.toLocaleString("id-ID"),
          styles: { halign: "right" },
        },
        {
          content: totalPengeluaran.toLocaleString("id-ID"),
          styles: { halign: "right" },
        },
      ],
      [
        { content: "Sisa Kas", colSpan: 3, styles: { halign: "right" } },
        {
          content: sisaKas.toLocaleString("id-ID"),
          colSpan: 2,
          styles: { halign: "right" },
        },
      ],
    ],
    showFoot: "lastPage",
    styles: {
      font: "times",
      fontSize: 12,
      cellPadding: 3,
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      textColor: 50,
      halign: "left",
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 }, // No
      1: { halign: "center", cellWidth: 30 }, // Tanggal
      2: { halign: "left" }, // Uraian
      3: { halign: "right", cellWidth: 35 }, // Penerimaan
      4: { halign: "right", cellWidth: 35 }, // Pengeluaran
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      (doc as any).lastAutoTable = data.table;
    },
  });

  // === Tanda tangan di halaman terakhir ===
  const pageWidth = doc.internal.pageSize.getWidth();
  let lastY = (doc as any).lastAutoTable?.finalY || 0;
  const tandaTanganY = lastY + 30;
  const offsetX = 50;

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont("times", "normal");

  doc.text("Ketua Yayasan", pageWidth / 2 - offsetX, tandaTanganY, {
    align: "center",
  });
  doc.text("Bendahara Sekolah", pageWidth / 2 + offsetX, tandaTanganY, {
    align: "center",
  });

  doc.setFont("times", "bold");

  const ketuaY = tandaTanganY + 25;
  const bendaharaY = tandaTanganY + 25;

  // Nama
  doc.text("Raja Arita", pageWidth / 2 - offsetX, ketuaY, {
    align: "center",
  });
  doc.text("Suliyah Ningsih", pageWidth / 2 + offsetX, bendaharaY, {
    align: "center",
  });

  // Garis bawah nama
  const lineWidth = 40;
  doc.setLineWidth(0.5);

  doc.line(
    pageWidth / 2 - offsetX - lineWidth / 2,
    ketuaY + 2,
    pageWidth / 2 - offsetX + lineWidth / 2,
    ketuaY + 2
  );

  doc.line(
    pageWidth / 2 + offsetX - lineWidth / 2,
    bendaharaY + 2,
    pageWidth / 2 + offsetX + lineWidth / 2,
    bendaharaY + 2
  );

  doc.save(filename);
}
