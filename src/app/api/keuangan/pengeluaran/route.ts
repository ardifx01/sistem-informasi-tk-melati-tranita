import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createPengeluaranSchema = z.object({
  tanggal: z.coerce.date(),
  jumlah: z.number().int().positive(),
  keterangan: z.string().min(3),
  kategori: z.enum([
    "ATK",
    "OPERASIONAL",
    "GAJI_GURU",
    "KEGIATAN_SISWA",
    "PERAWATAN_ASET",
    "LAINNYA",
  ]),
});

export async function GET() {
  try {
    const pengeluaran = await prisma.pengeluaran.findMany({
      orderBy: { tanggal: "desc" },
    });
    return NextResponse.json(pengeluaran);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data pengeluaran." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createPengeluaranSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Data input tidak valid.",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const pengeluaranBaru = await prisma.pengeluaran.create({
      data: validation.data,
    });

    return NextResponse.json(pengeluaranBaru, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat data pengeluaran." },
      { status: 500 }
    );
  }
}
