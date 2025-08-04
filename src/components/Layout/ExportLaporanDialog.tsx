"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Download,
  FileSpreadsheet,
  Printer,
  Calendar as CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { LaporanPreviewDialog } from "./LaporanPreviewDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, getMonth, getYear } from "date-fns";
import { da, id as localeID } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number;
}

// Tipe props yang lebih fleksibel
interface ExportLaporanDialogProps<T extends { tanggal: string | Date }> {
  // Bisa menerima satu jenis data atau gabungan
  data?: T[];
  combinedData?: {
    pemasukan: any[];
    pengeluaran: any[];
  };
  // Kolom bisa untuk satu jenis data atau gabungan
  columns:
    | ExportColumn<T>[]
    | {
        pemasukan: ExportColumn<any>[];
        pengeluaran: ExportColumn<any>[];
      };
  filename: string;
  title: string;
  children: React.ReactNode;
}

export function ExportLaporanDialog<T extends { tanggal: string | Date }>({
  data,
  combinedData,
  columns,
  filename,
  title,
  children,
}: ExportLaporanDialogProps<T>) {
  const [open, setOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  // State baru untuk filter
  const [filterType, setFilterType] = useState<"monthly" | "yearly">("monthly");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const isCombined = !!combinedData;

  // Opsi tahun untuk dropdown, dibuat secara dinamis dari data
  const yearOptions = useMemo(() => {
    const yearSet = new Set<number>();
    const dataToScan = isCombined
      ? [...combinedData.pemasukan, ...combinedData.pengeluaran]
      : data || [];
    dataToScan.forEach((item) => {
      yearSet.add(getYear(new Date(item.tanggal)));
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [data, combinedData, isCombined]);

  // Logika untuk memfilter data berdasarkan pilihan
  const getFilteredData = () => {
    const filterLogic = (item: T) => {
      const itemDate = new Date(item.tanggal);
      if (filterType === "yearly") {
        return getYear(itemDate) === selectedYear;
      }
      if (filterType === "monthly" && selectedDate) {
        return (
          getYear(itemDate) === getYear(selectedDate) &&
          getMonth(itemDate) === getMonth(selectedDate)
        );
      }
      return true;
    };

    if (isCombined) {
      return {
        pemasukan: combinedData.pemasukan.filter(filterLogic),
        pengeluaran: combinedData.pengeluaran.filter(filterLogic),
      };
    }
    return (data || []).filter(filterLogic);
  };

  const getFilenameSuffix = () => {
    if (filterType === "yearly") return selectedYear.toString();
    if (selectedDate)
      return format(selectedDate, "MMMM yyyy", { locale: localeID });
    return "semua_periode";
  };

  const applyExcelStyling = (
    worksheet: XLSX.WorkSheet,
    cols: ExportColumn<any>[]
  ) => {
    worksheet["!cols"] = cols.map((col) => ({
      wch: Math.max(col.header.length, 15),
    }));
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F81BD" } },
        alignment: { vertical: "center", horizontal: "center" },
      };
    }
  };

  const handleExportExcel = () => {
    setLoading("excel");
    try {
      const filteredResult = getFilteredData();
      const finalFilename = `${filename} ${getFilenameSuffix()}.xlsx`;
      const wb = XLSX.utils.book_new();

      if (isCombined) {
        const { pemasukan, pengeluaran } = filteredResult as {
          pemasukan: any[];
          pengeluaran: any[];
        };
        if (pemasukan.length === 0 && pengeluaran.length === 0) {
          toast.warning(
            "Tidak ada data untuk diekspor pada periode yang dipilih."
          );
          return;
        }

        if (pemasukan.length > 0) {
          const wsData = pemasukan.map((item) => {
            const row: { [key: string]: any } = {};
            (columns as any).pemasukan.forEach((col: ExportColumn<any>) => {
              row[col.header] = col.accessor(item);
            });
            return row;
          });
          const ws = XLSX.utils.json_to_sheet(wsData);
          applyExcelStyling(ws, (columns as any).pemasukan);
          XLSX.utils.book_append_sheet(wb, ws, "Pemasukan");
        }

        if (pengeluaran.length > 0) {
          const wsData = pengeluaran.map((item) => {
            const row: { [key: string]: any } = {};
            (columns as any).pengeluaran.forEach((col: ExportColumn<any>) => {
              row[col.header] = col.accessor(item);
            });
            return row;
          });
          const ws = XLSX.utils.json_to_sheet(wsData);
          applyExcelStyling(ws, (columns as any).pengeluaran);
          XLSX.utils.book_append_sheet(wb, ws, "Pengeluaran");
        }
      } else {
        const singleData = filteredResult as T[];
        if (singleData.length === 0) {
          toast.warning(
            "Tidak ada data untuk diekspor pada periode yang dipilih."
          );
          return;
        }
        const wsData = singleData.map((item) => {
          const row: { [key: string]: any } = {};
          (columns as ExportColumn<T>[]).forEach((col) => {
            row[col.header] = col.accessor(item);
          });
          return row;
        });
        const ws = XLSX.utils.json_to_sheet(wsData);
        applyExcelStyling(ws, columns as ExportColumn<T>[]);
        XLSX.utils.book_append_sheet(wb, ws, "Laporan");
      }

      XLSX.writeFile(wb, finalFilename);
      toast.success("Laporan Excel berhasil diunduh!");
    } catch (error) {
      toast.error("Gagal mengunduh laporan Excel.");
      console.error("Excel export error:", error);
    } finally {
      setLoading(null);
      setOpen(false);
    }
  };

  const handleExportPDF = () => {
    setLoading("pdf");
    try {
      const filteredResult = getFilteredData();
      const finalFilename = `${filename} ${getFilenameSuffix()}.pdf`;
      const doc = new jsPDF({ orientation: "landscape" });

      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Periode: ${getFilenameSuffix()}`, 14, 30);

      let lastY = 35;

      if (isCombined) {
        const { pemasukan, pengeluaran } = filteredResult as {
          pemasukan: any[];
          pengeluaran: any[];
        };
        if (pemasukan.length === 0 && pengeluaran.length === 0) {
          toast.warning(
            "Tidak ada data untuk diekspor pada periode yang dipilih."
          );
          return;
        }

        if (pemasukan.length > 0) {
          doc.setFontSize(14);
          doc.text("Laporan Pemasukan", 14, lastY);
          autoTable(doc, {
            startY: lastY + 5,
            head: [
              (columns as any).pemasukan.map(
                (col: ExportColumn<any>) => col.header
              ),
            ],
            body: pemasukan.map((item) =>
              (columns as any).pemasukan.map((col: ExportColumn<any>) =>
                col.accessor(item)
              )
            ),
            theme: "grid",
          });
          lastY = (doc as any).lastAutoTable.finalY;
        }

        if (pengeluaran.length > 0) {
          doc.addPage(); // Tambah halaman baru untuk laporan pengeluaran
          doc.setFontSize(14);
          doc.text("Laporan Pengeluaran", 14, 22);
          autoTable(doc, {
            startY: 30,
            head: [
              (columns as any).pengeluaran.map(
                (col: ExportColumn<any>) => col.header
              ),
            ],
            body: pengeluaran.map((item) =>
              (columns as any).pengeluaran.map((col: ExportColumn<any>) =>
                col.accessor(item)
              )
            ),
            theme: "grid",
          });
        }
      } else {
        const singleData = filteredResult as T[];
        if (singleData.length === 0) {
          toast.warning(
            "Tidak ada data untuk diekspor pada periode yang dipilih."
          );
          return;
        }
        autoTable(doc, {
          startY: lastY,
          head: [(columns as ExportColumn<T>[]).map((col) => col.header)],
          body: singleData.map((item) =>
            (columns as ExportColumn<T>[]).map((col) => col.accessor(item))
          ),
          theme: "grid",
        });
      }

      doc.save(finalFilename);
      toast.success("Laporan PDF berhasil diunduh!");
    } catch (error) {
      toast.error("Gagal mengunduh laporan PDF.");
      console.error("PDF export error:", error);
    } finally {
      setLoading(null);
      setOpen(false);
    }
  };

  const handlePreview = () => {
    const filteredResult = getFilteredData();
    const dataExists = isCombined
      ? (filteredResult as any).pemasukan.length > 0 ||
        (filteredResult as any).pengeluaran.length > 0
      : (filteredResult as any).length > 0;

    if (!dataExists) {
      toast.warning(
        "Tidak ada data untuk pratinjau pada periode yang dipilih."
      );
      return;
    }
    setOpen(false); // Tutup dialog ekspor
    setIsPreviewOpen(true); // Buka dialog pratinjau
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Pilih periode dan format laporan yang ingin Anda unduh atau cetak.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Pilih Jenis Laporan</Label>
              <RadioGroup
                defaultValue="monthly"
                value={filterType}
                onValueChange={(v) => setFilterType(v as "monthly" | "yearly")}
                className="mt-2 flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Bulanan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yearly" id="yearly" />
                  <Label htmlFor="yearly">Tahunan</Label>
                </div>
              </RadioGroup>
            </div>

            {filterType === "monthly" ? (
              <div className="space-y-2">
                <Label>Pilih Bulan</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "MMMM yyyy", { locale: localeID })
                      ) : (
                        <span>Pilih bulan dan tahun</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      captionLayout="dropdown"
                      fromYear={2025}
                      toYear={new Date().getFullYear()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Pilih Tahun</Label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(v) => setSelectedYear(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleExportExcel}
              disabled={!!loading}
            >
              {loading === "excel" ? (
                "Memproses..."
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel (.xlsx)
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={!!loading}
            >
              {loading === "pdf" ? (
                "Memproses..."
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> PDF (.pdf)
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handlePreview}
              className="col-span-2"
            >
              <Printer className="mr-2 h-4 w-4" /> Pratinjau
            </Button>
          </div>
        </DialogContent>
        <LaporanPreviewDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          data={getFilteredData()}
          columns={columns}
          title={`${title} - ${getFilenameSuffix()}`}
        />
      </Dialog>
    </>
  );
}
