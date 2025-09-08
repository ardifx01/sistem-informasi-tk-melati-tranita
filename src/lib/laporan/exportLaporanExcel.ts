import ExcelJS from "exceljs";

/**
 * parse nilai menjadi number (aman terhadap string "Rp 1.000.000")
 */
const toNumber = (v: any) => {
  if (typeof v === "number") return v;
  if (v == null) return 0;
  let s = String(v).replace(/[^0-9,-]/g, ""); // hanya angka, koma, minus
  // buang titik ribuan
  s = s.replace(/\./g, "");
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? 0 : n;
};

export type ExportColumn<T> = {
  header: string;
  accessor: (row: T) => string | number | null | undefined;
};

type ExportSheet<T> = {
  name: string;
  title: string;
  schoolName: string;
  columns: ExportColumn<T>[];
  rows: T[];
};

interface ExportLaporanExcelOptions<T> {
  filename: string;
  sheets: ExportSheet<T>[];
}

// ✅ helper untuk set font default
function applyDefaultFont(row: ExcelJS.Row, bold = false) {
  row.eachCell((cell) => {
    cell.font = { name: "Times New Roman", size: 12, bold };
  });
}

/**
 * Export laporan ke Excel (.xlsx)
 */
export const exportLaporanExcel = async <T>({
  filename,
  sheets,
}: ExportLaporanExcelOptions<T>) => {
  const workbook = new ExcelJS.Workbook();

  for (const sheet of sheets) {
    const worksheet = workbook.addWorksheet(sheet.name);

    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: sheet.columns.length > 6 ? "landscape" : "portrait", // ✅ auto landscape jika kolom > 6
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      },
    };

    const colCount = sheet.columns.length + 1; // +1 untuk kolom "No"

    // Row 1: Nama Sekolah
    worksheet.mergeCells(1, 1, 1, colCount);
    worksheet.getCell(1, 1).value = sheet.schoolName;
    worksheet.getCell(1, 1).alignment = { horizontal: "center" };
    worksheet.getCell(1, 1).font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
    };

    // Row 2: kosong
    worksheet.addRow([]);

    // Row 3: Judul
    worksheet.mergeCells(3, 1, 3, colCount);
    worksheet.getCell(3, 1).value = sheet.title;
    worksheet.getCell(3, 1).alignment = { horizontal: "center" };
    worksheet.getCell(3, 1).font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
    };

    // Row 4: kosong
    worksheet.addRow([]);

    // Header table
    const headers = ["No", ...sheet.columns.map((c) => c.header)];
    const headerRow = worksheet.addRow(headers);
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    applyDefaultFont(headerRow, true);

    // deteksi kolom tanggal & jumlah
    const tanggalColumnIndex = sheet.columns.findIndex((col) =>
      col.header.toLowerCase().includes("tanggal")
    );
    const excelTanggalCol =
      tanggalColumnIndex >= 0 ? tanggalColumnIndex + 2 : -1;

    const jumlahColumnIndex = sheet.columns.findIndex((col) =>
      ["jumlah", "uang", "penerimaan", "pengeluaran"].some((k) =>
        col.header.toLowerCase().includes(k)
      )
    );
    const excelJumlahCol = jumlahColumnIndex >= 0 ? jumlahColumnIndex + 2 : -1;

    // border header
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // jumlah header rata kanan
    if (excelJumlahCol > 0) {
      headerRow.getCell(excelJumlahCol).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
    }

    // Body rows
    sheet.rows.forEach((row, idx) => {
      const values: (string | number | null)[] = [idx + 1];
      for (let c = 0; c < sheet.columns.length; c++) {
        const raw = sheet.columns[c].accessor(row);
        if (c === jumlahColumnIndex) {
          values.push(toNumber(raw));
        } else {
          values.push(raw == null ? "" : raw);
        }
      }

      const addedRow = worksheet.addRow(values);
      applyDefaultFont(addedRow);

      addedRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        if (colNumber === 1) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }

        if (excelTanggalCol > 0 && colNumber === excelTanggalCol) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }

        if (excelJumlahCol > 0 && colNumber === excelJumlahCol) {
          if (typeof cell.value === "number") {
            cell.numFmt = '"Rp"#,##0';
          }
          cell.alignment = { horizontal: "right", vertical: "middle" };
        }

        // ✅ khusus kolom Kelas → center
        if (sheet.columns[colNumber - 2]?.header === "Kelas") {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }
      });
    });

    // Row Total
    if (jumlahColumnIndex > -1) {
      const total = sheet.rows.reduce((sum, row) => {
        const raw = sheet.columns[jumlahColumnIndex].accessor(row);
        return sum + toNumber(raw);
      }, 0);

      const totalRowIndex = worksheet.lastRow!.number + 1;

      if (excelJumlahCol > 1) {
        worksheet.mergeCells(
          totalRowIndex,
          1,
          totalRowIndex,
          excelJumlahCol - 1
        );
        const mergedCell = worksheet.getCell(totalRowIndex, 1);
        mergedCell.value = "Total";
        mergedCell.alignment = { horizontal: "center", vertical: "middle" };
        mergedCell.font = { name: "Times New Roman", size: 12, bold: true };

        for (let c = 1; c <= excelJumlahCol - 1; c++) {
          const cell = worksheet.getCell(totalRowIndex, c);
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      }

      const jumlahCell = worksheet.getCell(totalRowIndex, excelJumlahCol);
      jumlahCell.value = total;
      jumlahCell.numFmt = '"Rp"#,##0';
      jumlahCell.alignment = { horizontal: "right", vertical: "middle" };
      jumlahCell.font = { name: "Times New Roman", size: 12, bold: true };
      jumlahCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    // tanda tangan
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

    // lebar kolom
    headers.forEach((h, i) => {
      if (i === 0) worksheet.getColumn(i + 1).width = 6; // No
      else if (h.toLowerCase().includes("tanggal"))
        worksheet.getColumn(i + 1).width = 15;
      else if (h.toLowerCase().includes("kelas"))
        worksheet.getColumn(i + 1).width = 6;
      else if (h.toLowerCase().includes("nama siswa"))
        worksheet.getColumn(i + 1).width = 40;
      else if (h.toLowerCase().includes("jumlah"))
        worksheet.getColumn(i + 1).width = 20;
      else if (h.toLowerCase().includes("kategori"))
        worksheet.getColumn(i + 1).width = 25;
      else worksheet.getColumn(i + 1).width = 50;
    });
  }

  // Save file
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
};
