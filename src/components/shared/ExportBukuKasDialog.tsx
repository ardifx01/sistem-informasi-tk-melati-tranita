"use client";

import { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
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
import { BukuKasPreviewDialog } from "./BukuKasPreviewDialog";
import { cn, formatRupiah } from "@/lib/utils";

// Import utils yang telah dipisahkan
import {
  processBukuKasData,
  getFilenameSuffix,
  type FilterType,
  type BukuKasItem,
} from "@/lib/buku-kas/bukuKasDataProcessor";
import { exportBukuKasPdf } from "@/lib/buku-kas/exportBukuKasPdf";
import { exportBukuKasExcel } from "@/lib/buku-kas/exportBukuKasExcel";

// Import types dari file lain atau definisikan ulang jika perlu
type Pemasukan = {
  tanggal: string | Date;
  keterangan: string;
  jumlah: number;
};

type Pengeluaran = {
  tanggal: string | Date;
  keterangan: string;
  jumlah: number;
};

interface ExportBukuKasDialogProps {
  children: React.ReactNode;
  allPemasukan: Pemasukan[];
  allPengeluaran: Pengeluaran[];
}

export function ExportBukuKasDialog({
  children,
  allPemasukan,
  allPengeluaran,
}: ExportBukuKasDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("bulanan");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const currentYear = new Date().getFullYear();

  // Ambil data yang sudah diproses menggunakan utility function
  const getProcessedData = () => {
    return processBukuKasData({
      allPemasukan,
      allPengeluaran,
      filterType,
      selectedDate,
    });
  };

  const handleExportExcel = async () => {
    const toastId = toast.loading("Sedang menyiapkan file Excel...");

    try {
      const { processedData, totalPenerimaan, totalPengeluaran, sisaKas } =
        getProcessedData();
      const periode = getFilenameSuffix(filterType, selectedDate);

      await exportBukuKasExcel({
        processedData,
        totalPenerimaan,
        totalPengeluaran,
        sisaKas,
        periode,
        namaSheet: "Buku Kas",
        signatures: {
          ketua: "Raja Arita",
          bendahara: "Suliyah Ningsih",
        },
      });

      toast.success("Buku kas EXCEL berhasil di unduh", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Buku kas EXCEL gagal di unduh ❌", { id: toastId });
    }
  };

  const handleExportPdf = async () => {
    const toastId = toast.loading("Sedang menyiapkan file PDF...");

    try {
      const { processedData, totalPenerimaan, totalPengeluaran, sisaKas } =
        getProcessedData();
      const periode = getFilenameSuffix(filterType, selectedDate);

      await exportBukuKasPdf({
        processedData,
        totalPenerimaan,
        totalPengeluaran,
        sisaKas,
        periode,
        namaSekolah: "TK MELATI TRANITA",
      });

      toast.success("Buku kas PDF berhasil di unduh", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Buku kas EXCEL gagal di unduh ❌", { id: toastId });
    }
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  // Kolom untuk preview dialog
  const previewColumns = [
    {
      header: "No",
      accessor: (item: BukuKasItem, index?: number) =>
        index !== undefined ? index + 1 : "",
    },
    {
      header: "Tanggal",
      accessor: (item: BukuKasItem) => format(item.tanggal, "dd/MM/yyyy"),
    },
    { header: "Uraian", accessor: (item: BukuKasItem) => item.uraian },
    {
      header: "Penerimaan",
      accessor: (item: BukuKasItem) =>
        `Rp ${item.penerimaan.toLocaleString("id-ID")}`,
    },
    {
      header: "Pengeluaran",
      accessor: (item: BukuKasItem) =>
        `Rp ${item.pengeluaran.toLocaleString("id-ID")}`,
    },
  ];

  const { processedData, totalPenerimaan, totalPengeluaran, sisaKas } =
    getProcessedData();

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unduh Laporan Buku Kas</DialogTitle>
            <DialogDescription>
              Pilih periode dan format buku kas yang ingin diunduh.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                    {getFilenameSuffix(filterType, selectedDate)}
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

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                className="bg-green-600 hover:bg-green-700"
                disabled={processedData.length === 0}
                onClick={handleExportExcel}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export ke EXCEL
              </Button>

              <Button
                className="bg-red-600 hover:bg-red-700"
                disabled={processedData.length === 0}
                onClick={handleExportPdf}
              >
                <FileText className="mr-2 h-4 w-4" /> Export ke PDF
              </Button>

              {processedData.length === 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Tidak ada data pada periode ini
                </p>
              )}

              <Button
                onClick={handlePreview}
                variant="outline"
                className="col-span-2"
              >
                <Printer className="mr-2 h-4 w-4" /> Pratinjau & Cetak
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BukuKasPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        data={processedData}
        columns={previewColumns}
        title={"BUKU KAS TK MELATI TRANITA"}
        subtitle={`Periode ${getFilenameSuffix(filterType, selectedDate)}`}
      >
        {{
          totalPenerimaan: formatRupiah(totalPenerimaan),
          totalPengeluaran: formatRupiah(totalPengeluaran),
          sisaKas: formatRupiah(sisaKas),
        }}
      </BukuKasPreviewDialog>
    </>
  );
}
