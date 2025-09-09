import ExcelJS from "exceljs";
import { format } from "date-fns";

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
  schoolName?: string;
  signatures?: { ketua: string; bendahara: string };
}

export async function exportBukuKasExcel({
  processedData,
  totalPenerimaan,
  totalPengeluaran,
  sisaKas,
  periode,
  namaSheet = "Buku Kas",
  schoolName = "TK MELATI TRANITA",
  signatures = { ketua: "Raja Arita", bendahara: "Suliyah Ningsih" },
}: ExportBukuKasExcelOptions) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(namaSheet);

  worksheet.properties.defaultRowHeight = 20;
  worksheet.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Tanggal", key: "tanggal", width: 15 },
    { header: "Uraian", key: "uraian", width: 40 },
    { header: "Penerimaan (Rp)", key: "penerimaan", width: 20 },
    { header: "Pengeluaran (Rp)", key: "pengeluaran", width: 20 },
  ];

  // Judul
  worksheet.mergeCells("A1:E1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = `BUKU KAS ${schoolName}`;
  titleCell.alignment = { horizontal: "center" };
  titleCell.font = { name: "Times New Roman", size: 12, bold: true };

  worksheet.mergeCells("A2:E2");
  const periodeCell = worksheet.getCell("A2");
  periodeCell.value = `Periode ${periode}`;
  periodeCell.alignment = { horizontal: "center" };
  periodeCell.font = { name: "Times New Roman", size: 12 };

  // Header tabel
  worksheet.getRow(4).values = worksheet.columns.map((c) => c.header as string);
  worksheet.getRow(4).font = { name: "Times New Roman", size: 12, bold: true };
  worksheet.getRow(4).alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(4).eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Data
  processedData.forEach((item, index) => {
    const row = worksheet.addRow({
      no: index + 1,
      tanggal: format(item.tanggal, "dd/MM/yyyy"),
      uraian: item.uraian,
      penerimaan: item.penerimaan,
      pengeluaran: item.pengeluaran,
    });

    row.font = { name: "Times New Roman", size: 12 };
    row.alignment = { vertical: "middle" };

    row.getCell("no").alignment = { horizontal: "center" };
    row.getCell("tanggal").alignment = { horizontal: "center" };
    row.getCell("penerimaan").alignment = { horizontal: "right" };
    row.getCell("pengeluaran").alignment = { horizontal: "right" };
    row.getCell("penerimaan").numFmt = '"Rp"#,##0';
    row.getCell("pengeluaran").numFmt = '"Rp"#,##0';

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Footer Total
  const totalRow = worksheet.addRow({
    no: "",
    tanggal: "",
    uraian: "Total : ",
    penerimaan: totalPenerimaan,
    pengeluaran: totalPengeluaran,
  });

  // Style
  totalRow.font = { name: "Times New Roman", size: 12, bold: true };
  totalRow.alignment = { vertical: "middle" };

  // Merge No + Tanggal + Uraian
  totalRow.getCell("uraian").alignment = { horizontal: "right" };

  // Format angka
  totalRow.getCell("penerimaan").alignment = { horizontal: "right" };
  totalRow.getCell("penerimaan").numFmt = '"Rp"#,##0';
  totalRow.getCell("pengeluaran").alignment = { horizontal: "right" };
  totalRow.getCell("pengeluaran").numFmt = '"Rp"#,##0';

  // Border
  totalRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Footer Sisa Saldo
  const sisaRow = worksheet.addRow({
    no: "",
    tanggal: "",
    uraian: "Sisa Saldo : ",
    penerimaan: "",
    pengeluaran: sisaKas,
  });

  // Style
  sisaRow.font = { name: "Times New Roman", size: 12, bold: true };
  sisaRow.alignment = { vertical: "middle" };

  // Merge No + Tanggal + Uraian
  sisaRow.getCell("uraian").alignment = { horizontal: "right" };

  // 👉 Merge Penerimaan + Pengeluaran utk sisa saldo
  sisaRow.getCell("pengeluaran").alignment = { horizontal: "right" };
  sisaRow.getCell("pengeluaran").numFmt = '"Rp"#,##0';

  // Border
  sisaRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Tanda tangan
  let signRow = worksheet.lastRow!.number + 3;

  worksheet.mergeCells(`B${signRow}:C${signRow}`);
  worksheet.getCell(`B${signRow}`).value = "Ketua Yayasan";
  worksheet.getCell(`B${signRow}`).alignment = { horizontal: "center" };
  worksheet.getCell(`B${signRow}`).font = {
    name: "Times New Roman",
    size: 12,
  };

  worksheet.mergeCells(`D${signRow}:E${signRow}`);
  worksheet.getCell(`D${signRow}`).value = "Bendahara Sekolah";
  worksheet.getCell(`D${signRow}`).alignment = { horizontal: "center" };
  worksheet.getCell(`D${signRow}`).font = {
    name: "Times New Roman",
    size: 12,
  };

  signRow += 4;
  worksheet.mergeCells(`B${signRow}:C${signRow}`);
  worksheet.getCell(`B${signRow}`).value = "Raja Arita";
  worksheet.getCell(`B${signRow}`).alignment = { horizontal: "center" };
  worksheet.getCell(`B${signRow}`).font = {
    name: "Times New Roman",
    size: 12,
    bold: true,
  };

  worksheet.mergeCells(`D${signRow}:E${signRow}`);
  worksheet.getCell(`D${signRow}`).value = "Suliyah Ningsih";
  worksheet.getCell(`D${signRow}`).alignment = { horizontal: "center" };
  worksheet.getCell(`D${signRow}`).font = {
    name: "Times New Roman",
    size: 12,
    bold: true,
  };

  // Save file
  const filename = `Buku Kas ${periode}`;
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
