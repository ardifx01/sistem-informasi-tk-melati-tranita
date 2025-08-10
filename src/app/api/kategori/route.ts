import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createKategoriSchema } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipe = searchParams.get("tipe");

  // Buat objek 'where' secara dinamis
  const where: Prisma.KategoriWhereInput = {};
  if (tipe === "PEMASUKAN" || tipe === "PENGELUARAN") {
    where.tipe = tipe;
  }

  try {
    const kategori = await prisma.kategori.findMany({
      where,
      orderBy: { nama: "asc" },
    });
    return NextResponse.json(kategori);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data kategori." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createKategoriSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    const kategoriBaru = await prisma.kategori.create({
      data: validation.data,
    });
    return NextResponse.json(kategoriBaru, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat kategori baru." },
      { status: 500 }
    );
  }
}
