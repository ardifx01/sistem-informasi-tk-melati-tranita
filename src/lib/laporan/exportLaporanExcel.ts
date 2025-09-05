import ExcelJS from "exceljs";

/**
 * parse nilai menjadi number (aman terhadap string "Rp 1.000.000")
 */
const toNumber = (v: any) => {
  if (typeof v === "number") return v;
  if (v == null) return 0;
  const n = parseFloat(String(v).replace(/[^\d.-]+/g, ""));
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

    const colCount = sheet.columns.length + 1; // +1 untuk kolom "No"

    // -------------------------
    // Row 1: Nama Sekolah
    // -------------------------
    worksheet.mergeCells(1, 1, 1, colCount);
    worksheet.getCell(1, 1).value = sheet.schoolName;
    worksheet.getCell(1, 1).alignment = { horizontal: "center" };
    worksheet.getCell(1, 1).font = { bold: true, size: 12 };

    // Row 2: kosong (jarak)
    worksheet.addRow([]);

    // Row 3: Judul
    worksheet.mergeCells(3, 1, 3, colCount);
    worksheet.getCell(3, 1).value = sheet.title;
    worksheet.getCell(3, 1).alignment = { horizontal: "center" };
    worksheet.getCell(3, 1).font = { bold: true, size: 12 };

    // Row 4: kosong (spasi 1 baris setelah judul)
    worksheet.addRow([]);

    // -------------------------
    // Header table (baris ke-5)
    // -------------------------
    const headers = ["No", ...sheet.columns.map((c) => c.header)];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };

    // Hitung index kolom "jumlah/uang/penerimaan/pengeluaran" di sheet.columns (0-based)
    const jumlahColumnIndex = sheet.columns.findIndex((col) =>
      ["jumlah", "uang", "penerimaan", "pengeluaran"].some((k) =>
        col.header.toLowerCase().includes(k)
      )
    );
    // kolom jumlah di excel (1-based) adalah: jumlahColumnIndex + 2 (karena ada kolom No di depan)
    const excelJumlahCol = jumlahColumnIndex >= 0 ? jumlahColumnIndex + 2 : -1;

    // beri border pada header agar menyatu dg table
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // jika ada kolom jumlah, header kolom jumlah rata kanan
    if (excelJumlahCol > 0) {
      headerRow.getCell(excelJumlahCol).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
    }

    // -------------------------
    // Body rows
    // -------------------------
    sheet.rows.forEach((row, idx) => {
      // prepare values: nomor + kolom
      const values: (string | number | null)[] = [idx + 1];
      for (let c = 0; c < sheet.columns.length; c++) {
        const raw = sheet.columns[c].accessor(row);
        if (c === jumlahColumnIndex) {
          // keep numeric value if possible
          const num = toNumber(raw);
          values.push(num);
        } else {
          values.push(raw == null ? "" : raw);
        }
      }

      const addedRow = worksheet.addRow(values);

      // styling tiap cell body
      addedRow.eachCell((cell, colNumber) => {
        // semua cell border (menggabungkan header-body)
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        // kolom No (excel col 1) center
        if (colNumber === 1) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }

        // kolom jumlah -> numeric & format rupiah, align right
        if (excelJumlahCol > 0 && colNumber === excelJumlahCol) {
          // jika nilai numeric, set numFmt; jika bukan numeric (NaN), biarkan text
          const v = cell.value;
          if (typeof v === "number") {
            cell.numFmt = '"Rp"#,##0';
            cell.alignment = { horizontal: "right", vertical: "middle" };
          } else {
            // non-numeric fallback (string)
            cell.alignment = { horizontal: "right", vertical: "middle" };
          }
        }
      });
    });

    // -------------------------
    // Row Total (merge)
    // -------------------------
    if (jumlahColumnIndex > -1) {
      const total = sheet.rows.reduce((sum, row) => {
        const raw = sheet.columns[jumlahColumnIndex].accessor(row);
        return sum + toNumber(raw);
      }, 0);

      const totalRowIndex = worksheet.lastRow!.number + 1;

      // merge cells dari kolom 1 sampai excelJumlahCol - 1 (sebelum kolom jumlah)
      if (excelJumlahCol > 1) {
        worksheet.mergeCells(
          totalRowIndex,
          1,
          totalRowIndex,
          excelJumlahCol - 1
        );
        const mergedCell = worksheet.getCell(totalRowIndex, 1);
        mergedCell.value = "Total";
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: "center", vertical: "middle" };
        // beri border pada merged cell (kiri sampai kol-1)
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

      // isi kolom jumlah (excelJumlahCol) dengan nilai numeric dan format Rupiah
      const jumlahCell = worksheet.getCell(totalRowIndex, excelJumlahCol);
      jumlahCell.value = total;
      jumlahCell.numFmt = '"Rp"#,##0';
      jumlahCell.font = { bold: true };
      jumlahCell.alignment = { horizontal: "right", vertical: "middle" };
      // border jumlah cell
      jumlahCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    // -------------------------
    // Auto width tiap kolom (tetap preserve kolom No kecil)
    // -------------------------
    (worksheet.columns as ExcelJS.Column[]).forEach((col, i) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value == null ? "" : String(cell.value);
        maxLength = Math.max(maxLength, cellValue.length);
      });
      if (i === 0) col.width = 6; // Kolom No
      else col.width = Math.max(10, Math.min(50, maxLength + 2));
    });

    // -------------------------
    // Tanda tangan (selalu 3 baris setelah footer)
    // -------------------------
    let signRow = worksheet.lastRow!.number + 3;
    // buat 2 blok tanda tangan di tengah (B-C) & (D-E)
    worksheet.mergeCells(`B${signRow}:C${signRow}`);
    worksheet.getCell(`B${signRow}`).value = "Ketua Yayasan";
    worksheet.getCell(`B${signRow}`).alignment = { horizontal: "center" };

    worksheet.mergeCells(`D${signRow}:E${signRow}`);
    worksheet.getCell(`D${signRow}`).value = "Bendahara Sekolah";
    worksheet.getCell(`D${signRow}`).alignment = { horizontal: "center" };

    signRow += 4;
    worksheet.mergeCells(`B${signRow}:C${signRow}`);
    worksheet.getCell(`B${signRow}`).value = "Raja Arita";
    worksheet.getCell(`B${signRow}`).alignment = { horizontal: "center" };
    worksheet.getCell(`B${signRow}`).font = { bold: true };

    worksheet.mergeCells(`D${signRow}:E${signRow}`);
    worksheet.getCell(`D${signRow}`).value = "Suliyah Ningsih";
    worksheet.getCell(`D${signRow}`).alignment = { horizontal: "center" };
    worksheet.getCell(`D${signRow}`).font = { bold: true };
  }

  // Save file (download)
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
