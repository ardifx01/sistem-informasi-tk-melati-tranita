import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSiswaSchema } from "@/lib/validation";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

// GET /api/siswa - Mengambil semua data siswa
export async function GET() {
  try {
    const siswa = await prisma.siswa.findMany({
      // Memilih field secara eksplisit untuk memastikan semua data yang dibutuhkan ada
      select: {
        id: true,
        nis: true,
        nama: true,
        jenisKelamin: true,
        tanggalLahir: true,
        alamat: true,
        telepon: true,
        orangTua: true,
        jumlahSpp: true,
        kelasId: true,
        kelas: {
          select: {
            id: true,
            nama: true,
          },
        },
        _count: {
          select: {
            tagihan: {
              where: {
                status: "BELUM_LUNAS",
              },
            },
          },
        },
      },
      orderBy: {
        nama: "asc",
      },
    });

    const siswaWithTunggakan = siswa.map((s) => ({
      ...s,
      jumlahTunggakan: s._count.tagihan,
    }));

    return NextResponse.json(siswaWithTunggakan);
  } catch (error) {
    console.error("Error fetching siswa:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data siswa" },
      { status: 500 }
    );
  }
}
// POST /api/siswa - Membuat siswa baru DAN tagihan pertamanya
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createSiswaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Data input tidak valid", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { nis } = validation.data;

    const existingSiswa = await prisma.siswa.findFirst({
      where: { nis },
    });

    if (existingSiswa) {
      const field = existingSiswa.nis === nis ? "NIS" : "Email";
      return NextResponse.json(
        { error: `${field} sudah terdaftar` },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Langkah 1: Buat siswa baru
      const newSiswa = await tx.siswa.create({
        data: validation.data,
      });

      // Langkah 2: Buat tagihan SPP pertama untuk siswa tersebut
      const currentDate = new Date();
      const bulanIni = format(currentDate, "MMMM yyyy", { locale: localeID });

      // Mengatur jatuh tempo ke akhir bulan saat ini
      const jatuhTempo = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      await tx.tagihan.create({
        data: {
          siswaId: newSiswa.id,
          keterangan: `SPP Bulan ${bulanIni}`,
          jumlahTagihan: 150000, // Ganti dengan nominal SPP default Anda
          tanggalJatuhTempo: jatuhTempo,
          status: "BELUM_LUNAS",
        },
      });

      return newSiswa;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating siswa and tagihan:", error);
    return NextResponse.json(
      { error: "Gagal membuat siswa baru dan tagihan pertamanya" },
      { status: 500 }
    );
  }
}
