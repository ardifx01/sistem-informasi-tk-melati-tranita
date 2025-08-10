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
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types";

interface TunggakanTeratasProps {
  data: DashboardStats["tunggakanTeratas"];
}

export function TunggakanTeratas({ data }: TunggakanTeratasProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Daftar Tunggakan Teratas</CardTitle>
        <CardDescription>
          Menampilkan 5 tagihan terlama yang telah melewati tanggal jatuh tempo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Siswa</TableHead>
              <TableHead>Jatuh Tempo</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((tunggakan) => (
                <TableRow key={tunggakan.id}>
                  <TableCell>
                    <div className="font-medium">{tunggakan.siswa.nama}</div>
                    <div className="text-xs text-muted-foreground">
                      {tunggakan.keterangan}
                    </div>
                  </TableCell>
                  <TableCell className="text-red-600">
                    {formatDate(tunggakan.tanggalJatuhTempo, "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    Rp {tunggakan.jumlahTagihan.toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center items-center"
                >
                  Tidak ada tunggakan yang terlambat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
