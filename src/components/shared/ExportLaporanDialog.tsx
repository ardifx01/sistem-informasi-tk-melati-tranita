"use client";

import { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Import utils yang telah dipisahkan
import {
  processLaporanData,
  getFilenameSuffix,
  getPeriodeText,
  type FilterType,
  type Pemasukan,
  type Pengeluaran,
} from "@/lib/laporan/laporanDataProcessor";
import { exportLaporanPdf } from "@/lib/laporan/exportLaporanPdf";
import { exportLaporanExcel } from "@/lib/laporan/exportLaporanExcel";

interface ExportLaporanDialogProps {
  children: React.ReactNode;
  allPemasukan: Pemasukan[];
  allPengeluaran: Pengeluaran[];
}

export function ExportLaporanDialog({
  children,
  allPemasukan,
  allPengeluaran,
}: ExportLaporanDialogProps) {
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("bulanan");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();

  // Ambil data yang sudah diproses menggunakan utility function
  const getProcessedData = () => {
    return processLaporanData({
      allPemasukan,
      allPengeluaran,
      filterType,
      selectedDate,
    });
  };

  const handleExportPemasukan = async (exportFormat: "pdf" | "excel") => {
    const { pemasukan } = getProcessedData();
    const periode = getFilenameSuffix(filterType, selectedDate);
    const periodeText = getPeriodeText(filterType, selectedDate);

    const columns = [
      {
        header: "Tanggal",
        accessor: (row: Pemasukan) =>
          format(new Date(row.tanggal), "dd/MM/yyyy", { locale: localeID }),
      },
      { header: "Keterangan", accessor: (row: Pemasukan) => row.keterangan },
      { header: "Kategori", accessor: (row: Pemasukan) => row.kategori || "-" },
      { header: "Jumlah", accessor: (row: Pemasukan) => row.jumlah },
    ];

    setLoading(true);
    try {
      if (exportFormat === "pdf") {
        exportLaporanPdf({
          filename: `Laporan Pemasukan ${periode}.pdf`,
          reportTitle: "LAPORAN PEMASUKAN",
          periode: periodeText,
          tables: [
            {
              // title: "Data Pemasukan",
              columns,
              rows: pemasukan,
            },
          ],
          namaSekolah: "TK MELATI TRANITA",
        });
      } else {
        await exportLaporanExcel({
          sheets: [
            {
              name: "Pemasukan",
              title: `Laporan Pemasukan - ${periodeText}`,
              schoolName: "TK MELATI TRANITA",
              columns,
              rows: pemasukan,
            },
          ],
          filename: `Laporan Pemasukan ${periode}`,
        });
      }
      toast.success(
        `Laporan pemasukan (${exportFormat.toUpperCase()}) berhasil diunduh`
      );

      // ✅ tutup modal
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(`Gagal mengunduh Laporan pemasukan`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPengeluaran = async (exportFormat: "pdf" | "excel") => {
    const { pengeluaran } = getProcessedData();
    const periode = getFilenameSuffix(filterType, selectedDate);
    const periodeText = getPeriodeText(filterType, selectedDate);

    const columns = [
      {
        header: "Tanggal",
        accessor: (row: Pengeluaran) =>
          format(new Date(row.tanggal), "dd/MM/yyyy", { locale: localeID }),
      },
      { header: "Keterangan", accessor: (row: Pengeluaran) => row.keterangan },
      {
        header: "Kategori",
        accessor: (row: Pengeluaran) => row.kategori || "-",
      },
      { header: "Jumlah", accessor: (row: Pengeluaran) => row.jumlah },
    ];

    try {
      if (exportFormat === "pdf") {
        exportLaporanPdf({
          filename: `Laporan Pengeluaran ${periode}.pdf`,
          reportTitle: "LAPORAN PENGELUARAN",
          periode: periodeText,
          tables: [
            {
              // title: "Data Pengeluaran",
              columns,
              rows: pengeluaran,
            },
          ],
          namaSekolah: "TK MELATI TRANITA",
        });
      } else {
        await exportLaporanExcel({
          sheets: [
            {
              name: "Pengeluaran",
              title: `Laporan Pengeluaran - ${periodeText}`,
              schoolName: "TK MELATI TRANITA",
              columns,
              rows: pengeluaran,
            },
          ],
          filename: `Laporan Pengeluaran ${periode}`,
        });
      }
      toast.success(
        `Laporan pengeluaran (${exportFormat.toUpperCase()}) berhasil diunduh`
      );

      // ✅ tutup modal
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(`Gagal mengunduh Laporan pengeluaran`);
    } finally {
      setLoading(false);
    }
  };

  const { pemasukan, pengeluaran, totalPemasukan, totalPengeluaran, selisih } =
    getProcessedData();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Unduh Laporan Keuangan</DialogTitle>
          <DialogDescription>
            Pilih periode dan jenis laporan yang ingin diunduh.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Filter Periode */}
          <div className="flex items-center gap-4">
            <Select
              value={filterType}
              onValueChange={(v) => setFilterType(v as FilterType)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bulanan">Bulanan</SelectItem>
                <SelectItem value="tahunan">Tahunan</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {getPeriodeText(filterType, selectedDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  captionLayout="dropdown"
                  fromYear={currentYear - 5}
                  toYear={currentYear + 5}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Ringkasan Data */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-slate-600">Total Pemasukan</p>
              <p className="text-lg font-semibold text-green-600">
                Rp {totalPemasukan.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-slate-500">
                {pemasukan.length} transaksi
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">Total Pengeluaran</p>
              <p className="text-lg font-semibold text-red-600">
                Rp {totalPengeluaran.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-slate-500">
                {pengeluaran.length} transaksi
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">Sisa Saldo</p>
              <p
                className={`text-lg font-semibold ${
                  selisih >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                Rp {selisih.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-slate-500">
                {selisih >= 0 ? "Surplus" : "Defisit"}
              </p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="space-y-4">
            {/* Laporan Pemasukan */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-700">
                  Laporan Pemasukan
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleExportPemasukan("excel")}
                  disabled={pemasukan.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button
                  onClick={() => handleExportPemasukan("pdf")}
                  disabled={pemasukan.length === 0}
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-50"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
              {pemasukan.length === 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  Tidak ada data pemasukan pada periode ini
                </p>
              )}
            </div>

            {/* Laporan Pengeluaran */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-700">
                  Laporan Pengeluaran
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleExportPengeluaran("excel")}
                  disabled={pengeluaran.length === 0}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button
                  onClick={() => handleExportPengeluaran("pdf")}
                  disabled={pengeluaran.length === 0}
                  variant="outline"
                  className="border-red-600 text-red-700 hover:bg-red-50"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
              {pengeluaran.length === 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  Tidak ada data pengeluaran pada periode ini
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
