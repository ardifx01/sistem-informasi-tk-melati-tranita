import ExcelJS from "exceljs";

type Column<T> = {
  header: string;
  accessor: (row: T) => any;
};

type SheetConfig<T> = {
  name: string; // nama sheet
  title: string; // judul di baris 1
  columns: Column<T>[]; // tanpa kolom No, akan ditambahkan otomatis
  rows: T[];
};

export async function exportExcel<T>(
  sheets: SheetConfig<T>[],
  fileName: string
) {
  const wb = new ExcelJS.Workbook();

  // Helper: convert index ke huruf kolom Excel
  const getExcelColumnLetter = (colIndex: number): string => {
    let dividend = colIndex;
    let columnName = "";
    let modulo: number;

    while (dividend > 0) {
      modulo = (dividend - 1) % 26;
      columnName = String.fromCharCode(65 + modulo) + columnName;
      dividend = Math.floor((dividend - modulo) / 26);
    }

    return columnName;
  };

  sheets.forEach((sheet) => {
    const ws = wb.addWorksheet(sheet.name);

    // ===== Judul (row 1) =====
    const titleRow = ws.addRow([sheet.title]);
    titleRow.font = { bold: true, size: 16 };
    titleRow.alignment = { horizontal: "center" };
    ws.mergeCells(1, 1, 1, sheet.columns.length + 1); // +1 karena ada kolom No
    ws.addRow([]); // spasi

    // ===== Header =====
    const headers = ["No", ...sheet.columns.map((c) => c.header)];
    const headerRow = ws.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // ===== Data Rows =====
    sheet.rows.forEach((item, idx) => {
      const rowValues = [
        idx + 1, // nomor otomatis
        ...sheet.columns.map((col) => col.accessor(item)),
      ];
      const row = ws.addRow(rowValues);

      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: "middle", horizontal: "left" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        // Jika kolom adalah "Jumlah" → format Rupiah
        const colHeader = headers[colNumber - 1]; // -1 karena headers array mulai dari 0
        if (colHeader === "Jumlah") {
          cell.numFmt = '"Rp"#,##0'; // Format Rupiah
          cell.alignment = { horizontal: "right" };
        }
      });
    });

    // ===== Total Row =====
    const jumlahIndex = sheet.columns.findIndex((c) => c.header === "Jumlah");
    if (jumlahIndex > -1) {
      const jumlahExcelIndex = jumlahIndex + 2; // +1 karena shift kolom No, +1 karena index mulai dari 0
      const totalValue = sheet.rows.reduce((sum, item) => {
        const val = sheet.columns[jumlahIndex].accessor(item);
        return (
          sum + (typeof val === "number" ? val : parseFloat(val as any) || 0)
        );
      }, 0);

      const totalRow = ws.addRow(
        headers.map((_, idx) =>
          idx === jumlahExcelIndex - 1
            ? "Total"
            : idx === jumlahExcelIndex
            ? totalValue
            : null
        )
      );

      // Merge cell dari kolom pertama sampai sebelum kolom Jumlah
      if (jumlahExcelIndex > 1) {
        ws.mergeCells(
          `${getExcelColumnLetter(1)}${totalRow.number}:${getExcelColumnLetter(
            jumlahExcelIndex - 1
          )}${totalRow.number}`
        );
      }

      // Styling Total Row
      totalRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "305496" },
        };
        cell.alignment = { horizontal: "right", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        // Kolom Jumlah di Total row juga Rupiah
        const colHeader = headers[colNumber - 1];
        if (colHeader === "Jumlah") {
          cell.numFmt = '"Rp"#,##0';
        }
      });
    }

    // ===== Auto Width =====
    (ws.columns as ExcelJS.Column[]).forEach((col, i) => {
      let maxLength = headers[i]?.length || 10;

      col.eachCell({ includeEmpty: true }, (cell) => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > maxLength) maxLength = len;
      });

      col.width = maxLength + 2;
    });
  });

  // ===== Download file =====
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
