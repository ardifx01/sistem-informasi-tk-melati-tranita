import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Skema validasi untuk satu tagihan
const createTagihanSchema = z.object({
  siswaId: z.string().cuid(),
  keterangan: z.string().min(3),
  jumlahTagihan: z.number().positive(),
  tanggalJatuhTempo: z.coerce.date(), // coerce akan mengubah string tanggal menjadi objek Date
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

    // Memungkinkan pembuatan satu atau banyak tagihan sekaligus
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

    if (Array.isArray(validation.data)) {
      // Buat banyak tagihan (misalnya, generate SPP untuk satu kelas)
      const result = await prisma.tagihan.createMany({
        data: validation.data,
      });
      return NextResponse.json(result, { status: 201 });
    } else {
      // Buat satu tagihan
      const tagihanBaru = await prisma.tagihan.create({
        data: validation.data,
      });
      return NextResponse.json(tagihanBaru, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat data tagihan." },
      { status: 500 }
    );
  }
}
