import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // --- Menghitung Statistik Dasar ---
    // Menggunakan Prisma transaction untuk efisiensi
    const [
      totalSiswa,
      totalKelas,
      totalUser,
      totalPemasukan, // Menjumlahkan nominal, bukan hanya hitungan
      totalPengeluaran, // Menjumlahkan nominal, bukan hanya hitungan
      siswaBelumBayar,
    ] = await prisma.$transaction([
      prisma.siswa.count(),
      prisma.kelas.count(),
      prisma.user.count(),
      prisma.pemasukan.aggregate({
        _sum: {
          jumlah: true,
        },
      }),
      prisma.pengeluaran.aggregate({
        _sum: {
          jumlah: true,
        },
      }),

      prisma.tagihan.groupBy({
        by: ["siswaId"],
        where: {
          status: "BELUM_LUNAS",
        },
        orderBy: undefined,
      }),
    ]);

    // --- Menghitung Statistik Bulanan ---
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

    const [pemasukanBulanIni, pengeluaranBulanIni] = await prisma.$transaction([
      prisma.pemasukan.aggregate({
        _sum: { jumlah: true },
        where: {
          tanggal: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      prisma.pengeluaran.aggregate({
        _sum: { jumlah: true },
        where: {
          tanggal: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
    ]);

    // --- Menghitung Statistik Distribusi ---
    const [
      genderStats,
      classStats,
      kategoriPengeluaranStats,
      kategoriPemasukanStats,
    ] = await prisma.$transaction([
      // Distribusi Gender Siswa
      prisma.siswa.groupBy({
        by: ["jenisKelamin"],
        _count: {
          jenisKelamin: true,
        },
        orderBy: undefined,
      }),

      // Distribusi Siswa per Kelas
      prisma.kelas.findMany({
        include: {
          _count: {
            select: { siswa: true },
          },
        },
      }),

      // Distribusi Pengeluaran per Kategori
      prisma.pengeluaran.groupBy({
        by: ["kategori"],
        _sum: {
          jumlah: true,
        },
        orderBy: undefined,
      }),

      // Distribusi Pemasukan per Kategori
      prisma.pemasukan.groupBy({
        by: ["kategori"],
        _sum: {
          jumlah: true,
        },
        orderBy: undefined,
      }),
    ]);

    // --- Mengambil Transaksi Terbaru (5 Pemasukan & 5 Pengeluaran) ---
    const [recentPemasukan, recentPengeluaran] = await prisma.$transaction([
      prisma.pemasukan.findMany({
        take: 5,
        orderBy: { tanggal: "desc" },
        include: {
          tagihan: {
            include: {
              siswa: { select: { nama: true } },
            },
          },
        },
      }),

      prisma.pengeluaran.findMany({
        take: 5,
        orderBy: { tanggal: "desc" },
      }),
    ]);

    // Menggabungkan dan mengurutkan transaksi terbaru
    const recentTransactions = [
      ...recentPemasukan.map((p) => ({ ...p, type: "pemasukan" })),
      ...recentPengeluaran.map((p) => ({ ...p, type: "pengeluaran" })),
    ]
      .sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime())
      .slice(0, 10);

    // --- Menyusun Objek Statistik Final ---
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
        totalSiswaBelumBayar: siswaBelumBayar.length,
      },

      genderDistribution: genderStats.map((stat: any) => ({
        gender: stat.jenisKelamin,
        count: stat._count.jenisKelamin,
      })),

      classDistribution: classStats.map((kelas) => ({
        nama: kelas.nama,
        count: kelas._count.siswa,
      })),

      kategoriPemasukanDistribution: kategoriPemasukanStats.map(
        (stat: any) => ({
          kategori: stat.kategori,
          total: stat._sum.jumlah || 0,
        })
      ),

      kategoriPengeluaranDistribution: kategoriPengeluaranStats.map(
        (stat: any) => ({
          kategori: stat.kategori,
          total: stat._sum.jumlah || 0,
        })
      ),

      recentTransactions: recentTransactions.map((trx: any) => ({
        id: trx.id,
        tanggal: trx.tanggal,
        jumlah: trx.jumlah,
        keterangan:
          trx.type === "pemasukan"
            ? `Pembayaran dari ${trx.tagihan.siswa.nama}`
            : trx.keterangan,
        type: trx.type,
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
