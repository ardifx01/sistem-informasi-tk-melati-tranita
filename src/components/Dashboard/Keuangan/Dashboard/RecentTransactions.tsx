"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { type DashboardStats } from "@/lib/types";

interface RecentTransactionsProps {
  data: DashboardStats["recentTransactions"];
}

export function RecentTransactions({ data }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Keuangan Terbaru</CardTitle>
        <CardDescription>Menampilkan 10 transaksi terakhir.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((trx) => (
                <TableRow key={trx.id}>
                  <TableCell>
                    {formatDate(trx.tanggal, "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {trx.keterangan}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        trx.type === "pemasukan" ? "default" : "secondary"
                      }
                      className={
                        trx.type === "pemasukan"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }
                    >
                      {trx.type}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      trx.type === "pemasukan"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    Rp {trx.jumlah.toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Tidak ada transaksi terbaru.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
