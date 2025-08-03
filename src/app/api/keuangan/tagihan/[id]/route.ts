import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Skema untuk update, semua field opsional
const updateTagihanSchema = z
  .object({
    keterangan: z.string().min(3).optional(),
    jumlahTagihan: z.coerce.number().positive().optional(),
    tanggalJatuhTempo: z.coerce.date().optional(),
    status: z.enum(["BELUM_LUNAS", "LUNAS", "TERLAMBAT"]).optional(),
  })
  .partial();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tagihan = await prisma.tagihan.findUnique({
      where: { id: params.id },
      include: { siswa: true, pemasukan: true },
    });
    if (!tagihan) {
      return NextResponse.json(
        { error: "Tagihan tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json(tagihan);
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
    // --- PERBAIKAN DI SINI ---
    // 1. Cek dulu apakah tagihan ada
    const existingTagihan = await prisma.tagihan.findUnique({
      where: { id: params.id },
    });

    if (!existingTagihan) {
      return NextResponse.json(
        { error: "Tagihan tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateTagihanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Data input tidak valid.",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    // 2. Lanjutkan update jika tagihan ada
    const updatedTagihan = await prisma.tagihan.update({
      where: { id: params.id },
      data: validation.data,
    });
    return NextResponse.json(updatedTagihan);
  } catch (error) {
    console.error("Error updating tagihan:", error);
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
    const tagihan = await prisma.tagihan.findUnique({
      where: { id: params.id },
      include: { pemasukan: true },
    });

    if (!tagihan) {
      return NextResponse.json(
        { error: "Tagihan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (tagihan.pemasukan) {
      return NextResponse.json(
        {
          error:
            "Tidak dapat menghapus tagihan yang sudah memiliki pembayaran.",
        },
        { status: 400 }
      );
    }

    await prisma.tagihan.delete({
      where: { id: params.id },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting tagihan:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data." },
      { status: 500 }
    );
  }
}
