// File: app/api/keuangan/pemasukan/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { createPemasukanSchema } from "@/lib/validation";

export async function GET() {
  try {
    const pemasukan = await prisma.pemasukan.findMany({
      orderBy: { tanggal: "desc" },
      include: {
        tagihan: {
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
          },
        },
      },
    });
    return NextResponse.json(pemasukan);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data pemasukan." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createPemasukanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Data input tidak valid.",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { tagihanId, ...pemasukanData } = validation.data;

    // 1. Cek tagihan secara menyeluruh, termasuk relasi pemasukan
    const tagihanToPay = await prisma.tagihan.findUnique({
      where: { id: tagihanId },
      include: { pemasukan: true }, // Sertakan data pemasukan yang ada
    });

    if (!tagihanToPay) {
      return NextResponse.json(
        { error: "Tagihan yang akan dibayar tidak ditemukan." },
        { status: 404 }
      );
    }
    // Cek apakah sudah ada pemasukan yang terhubung
    if (tagihanToPay.pemasukan) {
      return NextResponse.json(
        { error: "Tagihan ini sudah memiliki catatan pembayaran." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const pemasukanBaru = await tx.pemasukan.create({
        data: {
          ...pemasukanData,
          tanggal: new Date(),
          tagihan: {
            connect: { id: tagihanId },
          },
        },
      });

      await tx.tagihan.update({
        where: { id: tagihanId },
        data: { status: "LUNAS" },
      });

      return pemasukanBaru;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating pemasukan:", error);
    return NextResponse.json(
      { error: "Gagal membuat data pemasukan." },
      { status: 500 }
    );
  }
}
