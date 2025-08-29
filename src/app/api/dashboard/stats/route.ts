export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const [
      totalSiswa,
      totalKelas,
      totalUser,
      totalPemasukan,
      totalPengeluaran,
      siswaBelumBayar,
      pemasukanBulanIni,
      pengeluaranBulanIni,
      kategoriPengeluaranStats,
      recentPemasukan,
      recentPengeluaran,
      tunggakanTeratas,
    ] = await prisma.$transaction([
      prisma.siswa.count(),
      prisma.kelas.count(),
      prisma.user.count(),
      prisma.pemasukan.aggregate({ _sum: { jumlah: true } }),
      prisma.pengeluaran.aggregate({ _sum: { jumlah: true } }),

      // Menggunakan groupBy untuk menghitung siswa unik yang belum bayar.
      // Ini lebih aman secara tipe data di dalam transaksi.
      prisma.tagihan.groupBy({
        by: ["siswaId"],
        where: { status: "BELUM_LUNAS" },
        orderBy: undefined,
      }),

      prisma.pemasukan.aggregate({
        _sum: { jumlah: true },
        where: { tanggal: { gte: startOfMonth, lte: endOfMonth } },
      }),
      prisma.pengeluaran.aggregate({
        _sum: { jumlah: true },
        where: { tanggal: { gte: startOfMonth, lte: endOfMonth } },
      }),
      prisma.pengeluaran.groupBy({
        by: ["kategori"],
        _sum: { jumlah: true },
        orderBy: undefined,
      }),
      prisma.pemasukan.findMany({
        take: 5,
        orderBy: { tanggal: "desc" },
        include: {
          tagihan: { include: { siswa: { select: { nama: true } } } },
        },
      }),
      prisma.pengeluaran.findMany({ take: 5, orderBy: { tanggal: "desc" } }),
      prisma.tagihan.findMany({
        where: { status: "BELUM_LUNAS", tanggalJatuhTempo: { lt: new Date() } },
        orderBy: { tanggalJatuhTempo: "asc" },
        take: 5,
        include: { siswa: { select: { nama: true } } },
      }),
    ]);

    const recentTransactions = [
      ...recentPemasukan.map((p) => ({ ...p, type: "pemasukan" as const })),
      ...recentPengeluaran.map((p) => ({ ...p, type: "pengeluaran" as const })),
    ]
      .sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime())
      .slice(0, 10);

    const stats = {
      overview: {
        totalSiswa,
        totalKelas,
        totalUser,
        totalPemasukan: totalPemasukan._sum.jumlah || 0,
        totalPengeluaran: totalPengeluaran._sum.jumlah || 0,
        saldoSaatIni:
          (totalPemasukan._sum.jumlah || 0) -
          (totalPengeluaran._sum.jumlah || 0),
        pemasukanBulanIni: pemasukanBulanIni._sum.jumlah || 0,
        pengeluaranBulanIni: pengeluaranBulanIni._sum.jumlah || 0,
        // Hasil dari groupBy adalah array, jadi kita ambil panjangnya.
        totalSiswaBelumBayar: siswaBelumBayar.length,
      },
      kategoriPengeluaranDistribution: kategoriPengeluaranStats.map((stat) => ({
        kategori: stat.kategori,
        total: stat._sum?.jumlah || 0,
      })),
      recentTransactions: recentTransactions.map((trx) => ({
        id: trx.id,
        tanggal: trx.tanggal,
        jumlah: trx.jumlah,
        keterangan:
          trx.type === "pemasukan"
            ? `Pembayaran dari ${trx.tagihan.siswa.nama}`
            : trx.keterangan,
        type: trx.type,
      })),
      tunggakanTeratas: tunggakanTeratas.map((t) => ({
        id: t.id,
        keterangan: t.keterangan,
        jumlahTagihan: t.jumlahTagihan,
        siswa: { nama: t.siswa.nama },
        tanggalJatuhTempo: t.tanggalJatuhTempo,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Gagal mengambil statistik dashboard:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik dashboard" },
      { status: 500 }
    );
  }
}
