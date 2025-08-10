import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getMonth, getYear } from "date-fns";

const createTagihanSchema = z.object({
  siswaId: z.string().cuid(),
  keterangan: z.string().min(3),
  jumlahTagihan: z.number().positive(),
  tanggalJatuhTempo: z.coerce.date(),
});

export async function GET() {
  try {
    const tagihan = await prisma.tagihan.findMany({
      orderBy: {
        tanggalJatuhTempo: "desc",
      },
      include: {
        siswa: {
          select: {
            nama: true,
            kelas: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
        pemasukan: true, // Sertakan data pembayaran jika ada
      },
    });
    return NextResponse.json(tagihan);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data tagihan." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = z
      .union([createTagihanSchema, z.array(createTagihanSchema)])
      .safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Data input tidak valid.",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const dataToCreate = Array.isArray(validation.data)
      ? validation.data
      : [validation.data];

    // 1. Ambil semua ID siswa dari data yang akan dibuat
    const siswaIds = dataToCreate.map((d) => d.siswaId);

    // 2. Tentukan periode (bulan dan tahun) dari data pertama
    const targetDate = dataToCreate[0].tanggalJatuhTempo;
    const targetMonth = getMonth(targetDate);
    const targetYear = getYear(targetDate);

    // 3. Cari tagihan yang sudah ada untuk siswa-siswa tersebut di periode yang sama
    const existingTagihan = await prisma.tagihan.findMany({
      where: {
        siswaId: { in: siswaIds },
        // Cek juga keterangannya untuk memastikan ini adalah tagihan yang sama (misal: "SPP Bulan September")
        keterangan: dataToCreate[0].keterangan,
        // PERBAIKAN: Menggunakan AND untuk memastikan tanggal berada di dalam rentang bulan yang sama
        tanggalJatuhTempo: {
          gte: new Date(targetYear, targetMonth, 1), // Lebih besar atau sama dengan awal bulan
          lt: new Date(targetYear, targetMonth + 1, 1), // Lebih kecil dari awal bulan berikutnya
        },
      },
      select: { siswaId: true },
    });

    const existingSiswaIds = new Set(existingTagihan.map((t) => t.siswaId));

    // 4. Filter data, hanya buat tagihan untuk siswa yang belum punya
    const newTagihanData = dataToCreate.filter(
      (d) => !existingSiswaIds.has(d.siswaId)
    );

    if (newTagihanData.length === 0) {
      return NextResponse.json(
        {
          message:
            "Tidak ada tagihan baru yang dibuat karena semua siswa sudah memiliki tagihan di periode ini.",
          skipped: existingSiswaIds.size,
        },
        { status: 200 }
      );
    }

    // 5. Buat tagihan yang baru
    const result = await prisma.tagihan.createMany({
      data: newTagihanData,
    });

    return NextResponse.json(
      {
        message: `Berhasil membuat ${result.count} tagihan baru.`,
        skipped: existingSiswaIds.size,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tagihan:", error);
    return NextResponse.json(
      { error: "Gagal membuat data tagihan." },
      { status: 500 }
    );
  }
}
