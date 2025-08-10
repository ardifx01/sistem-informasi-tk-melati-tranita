import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateKategoriSchema } from "@/lib/validation";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = updateKategoriSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    const updatedKategori = await prisma.kategori.update({
      where: { id: params.id },
      data: validation.data,
    });
    return NextResponse.json(updatedKategori);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memperbarui kategori." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.kategori.delete({ where: { id: params.id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus kategori." },
      { status: 500 }
    );
  }
}
