import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updatePengeluaranSchema = z
  .object({
    tanggal: z.coerce.date().optional(),
    jumlah: z.number().int().positive().optional(),
    keterangan: z.string().min(3).optional(),
    kategori: z
      .enum([
        "ATK",
        "OPERASIONAL",
        "GAJI_GURU",
        "KEGIATAN_SISWA",
        "PERAWATAN_ASET",
        "LAINNYA",
      ])
      .optional(),
  })
  .partial();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pengeluaran = await prisma.pengeluaran.findUnique({
      where: { id: params.id },
    });
    if (!pengeluaran) {
      return NextResponse.json(
        { error: "Pengeluaran tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json(pengeluaran);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = updatePengeluaranSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Data input tidak valid.",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const updatedPengeluaran = await prisma.pengeluaran.update({
      where: { id: params.id },
      data: validation.data,
    });
    return NextResponse.json(updatedPengeluaran);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memperbarui data." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.pengeluaran.delete({
      where: { id: params.id },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus data." },
      { status: 500 }
    );
  }
}
