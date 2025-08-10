"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Tagihan, StatusPembayaran } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { startOfDay } from "date-fns";

// The props interface name is now consistent with the component name.
interface RiwayatTagihanTableProps {
  tagihan: Tagihan[];
}

type DisplayStatus = StatusPembayaran | "TERLAMBAT";

const getStatusInfo = (
  t: Tagihan
): { status: DisplayStatus; className: string } => {
  const isOverdue =
    startOfDay(new Date(t.tanggalJatuhTempo)) < startOfDay(new Date()) &&
    t.status === "BELUM_LUNAS";

  if (t.status === "LUNAS") {
    return {
      status: "LUNAS",
      className: "bg-green-100 text-green-800 border-green-200",
    };
  }
  if (isOverdue) {
    return {
      status: "TERLAMBAT",
      className: "bg-red-100 text-red-800 border-red-200",
    };
  }
  return {
    status: "BELUM_LUNAS",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
};

export function RiwayatTagihanTable({ tagihan }: RiwayatTagihanTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Keterangan</TableHead>
            <TableHead>Jatuh Tempo</TableHead>
            {/* This new column shows when a bill was paid. */}
            <TableHead>Tanggal Bayar</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tagihan.length > 0 ? (
            tagihan.map((t) => {
              const { status, className } = getStatusInfo(t);
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.keterangan}</TableCell>
                  <TableCell>
                    {formatDate(t.tanggalJatuhTempo, "dd MMM yyyy")}
                  </TableCell>
                  {/* The cell conditionally displays the payment date. */}
                  <TableCell>
                    {t.pemasukan
                      ? formatDate(t.pemasukan.tanggal, "dd MMM yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-transparent font-semibold",
                        className
                      )}
                    >
                      {status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    Rp {t.jumlahTagihan.toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={5} // The colspan is updated to match the new number of columns.
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada riwayat tagihan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
