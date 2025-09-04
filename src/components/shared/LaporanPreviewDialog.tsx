"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter as UiTableFooter,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ExportColumn } from "./ExportLaporanDialog";
import { Printer } from "lucide-react";

interface LaporanPreviewDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: T[] | { pemasukan: any[]; pengeluaran: any[] };
  columns:
    | ExportColumn<T>[]
    | { pemasukan: ExportColumn<any>[]; pengeluaran: ExportColumn<any>[] };
  title: string;
}

// Fungsi pembantu untuk memformat angka menjadi Rupiah
const formatRupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export function LaporanPreviewDialog<T>({
  open,
  onOpenChange,
  data,
  columns,
  title,
}: LaporanPreviewDialogProps<T>) {
  const isCombined = !Array.isArray(data);

  const handlePrint = () => {
    const printContent = document.getElementById("print-area");
    if (!printContent) return;

    const printWindow = window.open("", "", "height=800,width=1000");
    if (!printWindow) {
      alert(
        "Gagal membuka jendela cetak. Mohon izinkan pop-up untuk situs ini."
      );
      return;
    }

    printWindow.document.write("<html><head><title>Cetak Laporan</title>");
    printWindow.document.write(
      '<script src="https://cdn.tailwindcss.com"></script>'
    );
    printWindow.document.write(`
      <style>
        body { padding: 1.5rem; font-family: sans-serif; -webkit-print-color-adjust: exact; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
        th { background-color: #f1f5f9 !important; }
        h1, h2, h3 { font-weight: bold; }
        h1 { font-size: 1.5rem; }
        h2 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem;}
        .summary-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-top: 1rem; }
        .summary-card { padding: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
        .summary-title { font-size: 0.875rem; color: #64748b; }
        .summary-value { font-size: 1.25rem; font-weight: bold; }
      </style>
    `);
    printWindow.document.write("</head><body>");
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  // Komponen untuk merender tabel dengan baris total
  const renderTable = (tableData: any[], tableColumns: ExportColumn<any>[]) => {
    const total = useMemo(
      () =>
        tableData.reduce((sum, item) => {
          const jumlahColumn = tableColumns.find(
            (col) => col.header === "Jumlah"
          );
          if (jumlahColumn) {
            const value = jumlahColumn.accessor(item);
            if (typeof value === "number") return sum + value;
          }
          return sum;
        }, 0),
      [tableData, tableColumns]
    );

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {tableColumns.map((col) => (
              <TableHead key={col.header}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((item, rowIndex) => (
            <TableRow key={rowIndex}>
              {tableColumns.map((col) => (
                <TableCell key={col.header}>{col.accessor(item)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <UiTableFooter>
          <TableRow>
            <TableCell
              colSpan={tableColumns.length - 1}
              className="text-right font-bold"
            >
              Total
            </TableCell>
            <TableCell className="text-right font-bold">
              {formatRupiah(total)}
            </TableCell>
          </TableRow>
        </UiTableFooter>
      </Table>
    );
  };

  const combinedTotals = useMemo(() => {
    if (!isCombined) return { totalPemasukan: 0, totalPengeluaran: 0 };
    const dataCombined = data as { pemasukan: any[]; pengeluaran: any[] };
    const totalPemasukan = dataCombined.pemasukan.reduce(
      (sum, item) => sum + item.jumlah,
      0
    );
    const totalPengeluaran = dataCombined.pengeluaran.reduce(
      (sum, item) => sum + item.jumlah,
      0
    );
    return { totalPemasukan, totalPengeluaran };
  }, [data, isCombined]);

  const computedTitle = useMemo(() => {
    if (isCombined) return "Laporan Keuangan";
    if (title.toLowerCase().includes("pemasukan")) return "Laporan Pemasukan";
    if (title.toLowerCase().includes("pengeluaran"))
      return "Laporan Pengeluaran";
    return "Laporan";
  }, [isCombined, title]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Pratinjau Laporan</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh]">
          <div id="print-area" className="p-4">
            <div className="text-center mb-6">
              <h1 className="text-2xl">{computedTitle}</h1>
              <p className="text-muted-foreground">TK Melati Tranita</p>
              <p className="font-semibold">{title.split(" - ")[1]}</p>
            </div>

            {isCombined && (
              <div className="summary-grid flex gap-3 mb-6">
                <div className="summary-card">
                  <p className="summary-title">Total Pemasukan</p>
                  <p className="summary-value text-green-600">
                    {formatRupiah(combinedTotals.totalPemasukan)}
                  </p>
                </div>
                <div className="summary-card">
                  <p className="summary-title">Total Pengeluaran</p>
                  <p className="summary-value text-red-600">
                    {formatRupiah(combinedTotals.totalPengeluaran)}
                  </p>
                </div>
                <div className="summary-card">
                  <p className="summary-title">Saldo Akhir</p>
                  <p className="summary-value">
                    {formatRupiah(
                      combinedTotals.totalPemasukan -
                        combinedTotals.totalPengeluaran
                    )}
                  </p>
                </div>
              </div>
            )}

            {isCombined ? (
              <div>
                <h2>Laporan Pemasukan</h2>
                {renderTable(
                  (data as any).pemasukan,
                  (columns as any).pemasukan
                )}
                <h2 className="mt-8">Laporan Pengeluaran</h2>
                {renderTable(
                  (data as any).pengeluaran,
                  (columns as any).pengeluaran
                )}
              </div>
            ) : (
              renderTable(data as T[], columns as ExportColumn<T>[])
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
