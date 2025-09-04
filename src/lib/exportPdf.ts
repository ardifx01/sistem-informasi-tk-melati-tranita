// utils/pdfExport.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ExportColumn<T> = {
  header: string;
  accessor: (row: T) => string | number;
};

type TableData<T> = {
  title: string;
  columns: ExportColumn<T>[];
  rows: T[];
};

interface ExportPDFOptions<T> {
  filename: string;
  reportTitle: string;
  periode: string;
  tables: TableData<T>[];
}

export const exportPDF = <T>({
  filename,
  reportTitle,
  periode,
  tables,
}: ExportPDFOptions<T>) => {
  const doc = new jsPDF({ orientation: "landscape" });

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(reportTitle, 14, 18);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(`Periode: ${periode}`, 14, 26);

  let firstTable = true;

  tables.forEach((table, index) => {
    if (!firstTable) {
      doc.addPage();
    }
    firstTable = false;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40);
    doc.text(table.title, 14, 35);

    autoTable(doc, {
      startY: 42,
      head: [table.columns.map((col) => col.header)],
      body: table.rows.map((row) =>
        table.columns.map((col) => col.accessor(row))
      ),
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185], // biru elegan
        textColor: 255,
        halign: "center",
      },
      bodyStyles: {
        textColor: 50,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      margin: { left: 14, right: 14 },
    });
  });

  doc.save(filename);
};
