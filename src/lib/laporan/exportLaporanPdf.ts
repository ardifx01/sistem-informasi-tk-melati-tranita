import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ExportColumn<T> = {
  header: string;
  accessor: (row: T) => string | number;
};

type TableData<T> = {
  columns: ExportColumn<T>[];
  rows: T[];
  footer?: { label: string; value: string }[];
};

interface ExportLaporanPdfOptions<T> {
  filename: string;
  reportTitle: string;
  periode: string;
  tables: TableData<T>[];
  namaSekolah?: string;
}

export const exportLaporanPdf = <T>({
  filename,
  reportTitle,
  periode,
  tables,
  namaSekolah = "TK MELATI TRANITA",
}: ExportLaporanPdfOptions<T>) => {
  const doc = new jsPDF({ format: "a4", orientation: "portrait" });

  // === Header dokumen ===
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text(
    `${reportTitle} ${namaSekolah}`,
    doc.internal.pageSize.getWidth() / 2,
    20,
    { align: "center" }
  );

  doc.setFontSize(12);
  doc.setFont("times", "normal");
  doc.text(`Periode ${periode}`, doc.internal.pageSize.getWidth() / 2, 26, {
    align: "center",
  });

  let currentY = 35;

  // === Render tabel ===
  tables.forEach((table, index) => {
    if (index > 0) {
      currentY += 20;
      if (currentY > doc.internal.pageSize.height - 60) {
        doc.addPage();
        currentY = 20;
      }
    }

    const headersWithNo = ["No", ...table.columns.map((col) => col.header)];

    const bodyWithNo = table.rows.map((row, idx) => [
      idx + 1,
      ...table.columns.map((col) => col.accessor(row)),
    ]);

    // === Footer custom dari luar ===
    const customFooter =
      table.footer?.map((f) => [
        {
          content: f.label,
          colSpan: headersWithNo.length - 1,
        },
        f.value,
      ]) || [];

    // === Render tabel utama + footer ===
    autoTable(doc, {
      startY: currentY,
      head: [headersWithNo],
      body: bodyWithNo,
      foot: customFooter,
      theme: "grid", // penting -> biar semua ada border
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        halign: "center",
        fontStyle: "bold",
        lineWidth: 0.1, // border tipis
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        textColor: 50,
        halign: "left",
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      footStyles: {
        fillColor: [230, 230, 230], // abu-abu
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "right",
        lineWidth: 0.1, // tambahkan border di footer
        lineColor: [0, 0, 0],
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        font: "times",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 }, // Kolom No
        1: { halign: "center" }, // Kolom tanggal
        [headersWithNo.length - 1]: { halign: "right" }, // Kolom Jumlah
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        currentY = data.cursor?.y || currentY;
      },
    });
  });

  // === Tanda tangan ===
  const pageWidth = doc.internal.pageSize.width;
  let lastY = (doc as any).lastAutoTable?.finalY || 0;
  const tandaTanganY = lastY + 24;
  const offsetX = 50;

  doc.setFontSize(10);
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

  // Garis bawah
  const lineWidth = 30; // panjang garis
  doc.setLineWidth(0.5);

  // garis bawah Raja Arita
  doc.line(
    pageWidth / 2 - offsetX - lineWidth / 2,
    ketuaY + 2,
    pageWidth / 2 - offsetX + lineWidth / 2,
    ketuaY + 2
  );

  // garis bawah Suliyah Ningsih
  doc.line(
    pageWidth / 2 + offsetX - lineWidth / 2,
    bendaharaY + 2,
    pageWidth / 2 + offsetX + lineWidth / 2,
    bendaharaY + 2
  );

  doc.save(filename);
};
