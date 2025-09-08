import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const pemasukanRaw = await prisma.pemasukan.findMany({
      orderBy: { tanggal: "asc" },
      include: {
        tagihan: {
          include: {
            siswa: {
              include: { kelas: true },
            },
          },
        },
      },
    });

    // mapping ke format laporan
    const laporan = pemasukanRaw.map((p, idx) => ({
      no: idx + 1,
      tanggal: p.tanggal,
      kelas: p.tagihan?.siswa?.kelas?.nama || "-",
      namaSiswa: p.tagihan?.siswa?.nama || "-",
      jumlahSpp: p.tagihan?.siswa?.jumlahSpp || 0,
      jumlah: p.jumlah,
    }));

    return NextResponse.json(laporan);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil data laporan pemasukan." },
      { status: 500 }
    );
  }
}
