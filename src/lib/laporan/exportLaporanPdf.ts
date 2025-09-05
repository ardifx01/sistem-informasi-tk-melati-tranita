import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatRupiah } from "../utils";

export type ExportColumn<T> = {
  header: string;
  accessor: (row: T) => string | number;
};

type TableData<T> = {
  columns: ExportColumn<T>[];
  rows: T[];
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

  // Header dokumen
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text(
    `${reportTitle} ${namaSekolah}`,
    doc.internal.pageSize.getWidth() / 2,
    20,
    {
      align: "center",
    }
  );

  doc.setFontSize(12);
  doc.setFont("times", "normal");
  doc.text(`Periode ${periode}`, doc.internal.pageSize.getWidth() / 2, 26, {
    align: "center",
  });

  let currentY = 35;

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
      ...table.columns.map((col) => {
        const val = col.accessor(row);
        return col.header.toLowerCase().includes("jumlah")
          ? formatRupiah(val)
          : val;
      }),
    ]);

    // render table utama
    autoTable(doc, {
      startY: currentY,
      head: [headersWithNo],
      body: bodyWithNo,
      theme: "grid",
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        halign: "center",
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: 50,
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        font: "times",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 }, // Kolom No
        1: { halign: "center" }, // Kolom tanggal
        4: { halign: "right" }, //kolom jumlah
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        currentY = data.cursor?.y || currentY;
      },
    });

    // cari kolom jumlah
    const jumlahColumnIndex = table.columns.findIndex((col) =>
      col.header.toLowerCase().includes("jumlah")
    );

    if (jumlahColumnIndex > -1) {
      // hitung total
      const total = table.rows.reduce((sum, row) => {
        const value = table.columns[jumlahColumnIndex].accessor(row);
        return (
          sum +
          (typeof value === "number" ? value : parseFloat(value as string) || 0)
        );
      }, 0);

      // siapkan row total
      const totalRow = headersWithNo.map((_, idx) => {
        if (idx === 0) return ""; // kolom No
        if (idx === jumlahColumnIndex) return "Total";
        if (idx === jumlahColumnIndex + 1) return formatRupiah(total);
        return "";
      });

      // render row total
      autoTable(doc, {
        startY: currentY,
        head: [],
        body: [totalRow],
        theme: "plain",
        bodyStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
          halign: "right",
        },
        margin: { left: 14, right: 14 },
        styles: {
          fontSize: 10,
          font: "times",
        },
        columnStyles: {
          0: { halign: "center" }, // kolom No
          [jumlahColumnIndex]: { halign: "right" }, // label Total
          [jumlahColumnIndex + 1]: { halign: "right" }, // nilai total
        },
        didDrawPage: (data) => {
          currentY = data.cursor?.y || currentY;
        },
      });
    }
  });

  // Tanda tangan
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  let lastY = (doc as any).lastAutoTable?.finalY || 0;

  // Tambahkan jarak 2 spasi (anggap spasi = 12pt)
  const tandaTanganY = lastY + 24;

  // Atur posisi tanda tangan lebih ke tengah
  const offsetX = 50; // jarak dari tengah

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont("times", "normal");

  // Label jabatan
  doc.text("Ketua Yayasan", pageWidth / 2 - offsetX, tandaTanganY, {
    align: "center",
  });
  doc.text("Bendahara Sekolah", pageWidth / 2 + offsetX, tandaTanganY, {
    align: "center",
  });

  // Nama di bawahnya
  doc.setFont("times", "bold");
  doc.text("Raja Arita", pageWidth / 2 - offsetX, tandaTanganY + 25, {
    align: "center",
  });
  doc.text("Suliyah Ningsih", pageWidth / 2 + offsetX, tandaTanganY + 25, {
    align: "center",
  });

  doc.save(filename);
};
