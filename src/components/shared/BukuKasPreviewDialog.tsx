"use client";

import { ReactNode } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatRupiah } from "@/lib/utils";

type Column<T> = {
  header: string;
  accessor: (item: T, index?: number) => any;
};

interface BukuKasFooterProps {
  totalPenerimaan: string | number;
  totalPengeluaran: string | number;
  sisaKas: string | number;
}

interface LaporanPreviewDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: T[];
  columns: Column<T>[];
  title: string;
  subtitle?: string;
  children?: BukuKasFooterProps; // Untuk konten tambahan
}

export function BukuKasPreviewDialog<T>({
  open,
  onOpenChange,
  data,
  columns,
  title,
  subtitle,
  children,
}: LaporanPreviewDialogProps<T>) {
  const handlePrint = () => {
    const printContent = document.getElementById("print-content");
    if (!printContent) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.title = title;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title className="display: none;">${title}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12px; line-height: 1.4; color: #000; padding: 20px; }
          .doc-title {font-weight: bold; margin-bottom: 2px; }
          .doc-subTitle { margin-bottom: 8px; }
          table { border-collapse: collapse; width: 100%; }
          th, tr, td { border: 1px solid #000; padding: 6px 8px; vertical-align: middle; }
          th { background-color: #f0f0f0; font-weight: bold; top: 0; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .money-summary { margin-top: 20px; }
          .signature-area { display: flex; justify-content: space-between; margin-top: 40px; }
          .signature-box { text-align: center; width: 150px; }
          .signature-name { margin-top: 70px; font-weight: bold; text-decoration-line: underline; text-underline-offset: 8px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
            @page { margin: 20mm; size: A4 portrait; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle>{title}</DialogTitle>
              {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
            </div>
            <div className="flex items-center gap-2 mr-5">
              <Button onClick={handlePrint} size="sm" className="no-print">
                <Printer className="mr-2 h-4 w-4" />
                Cetak
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-2">
          <div
            id="print-content"
            className="w-full min-w-[600px] flex flex-col space-y-4"
          >
            {/* Header */}
            <div className="text-center">
              <div className="doc-title font-bold text-lg">{title}</div>
              {subtitle && (
                <div className="doc-subTitle text-sm text-gray-600">
                  {subtitle}
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-auto max-h-[60vh]">
              <table className="min-w-full border border-black">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    {columns.map((col, idx) => (
                      <th
                        key={idx}
                        className={`border border-black px-2 py-1 ${
                          col.header === "No"
                            ? "text-center w-12"
                            : col.header.includes("Jumlah") ||
                              col.header.includes("Rp")
                            ? "text-right"
                            : ""
                        }`}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((item, rowIndex) => (
                      <tr key={rowIndex}>
                        {columns.map((col, colIndex) => {
                          const rawValue = col.accessor(item, rowIndex);
                          const isCurrency =
                            col.header.includes("Jumlah") ||
                            col.header.includes("Rp");
                          const isNumberCol = col.header === "No";

                          let value: any = rawValue;
                          if (
                            isCurrency &&
                            (rawValue === 0 || rawValue === "0")
                          ) {
                            value = "-";
                          } else if (isCurrency) {
                            value = formatRupiah(rawValue);
                          }

                          return (
                            <td
                              key={colIndex}
                              className={`border border-black px-2 py-1 ${
                                isNumberCol
                                  ? "text-center"
                                  : isCurrency
                                  ? "text-right"
                                  : ""
                              }`}
                            >
                              {value}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="text-center py-8 text-gray-500"
                      >
                        Tidak ada data untuk ditampilkan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {children && (
              <div className="money-summary mt-2">
                <table className="min-w-full border border-black">
                  <tbody>
                    <tr className="bg-gray-100 font-semibold">
                      <td
                        className="border border-black px-2 py-1 text-right"
                        colSpan={columns.length - 1}
                      >
                        Total Penerimaan
                      </td>
                      <td className="border border-black px-2 py-1 text-right">
                        {children?.totalPenerimaan}
                      </td>
                    </tr>
                    <tr className="bg-gray-100 font-semibold">
                      <td
                        className="border border-black px-2 py-1 text-right"
                        colSpan={columns.length - 1}
                      >
                        Total Pengeluaran
                      </td>
                      <td className="border border-black px-2 py-1 text-right">
                        {children?.totalPengeluaran}
                      </td>
                    </tr>
                    <tr className="bg-gray-200 font-bold">
                      <td
                        className="border border-black px-2 py-1 text-right"
                        colSpan={columns.length - 1}
                      >
                        Sisa Saldo
                      </td>
                      <td className="border border-black px-2 py-1 text-right">
                        {children.sisaKas}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Tanda tangan */}
                <div className="signature-area flex justify-between mt-12 px-10">
                  <div className=" signature-box text-center">
                    <div className="font-semibold">Ketua Yayasan</div>
                    <p className="signature-name mt-16 font-semibold underline underline-offset-8">
                      Raja Arita
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Bendahara Sekolah</div>
                    <p className="signature-name mt-16 font-semibold underline underline-offset-8">
                      Suliyah Ningsih
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
