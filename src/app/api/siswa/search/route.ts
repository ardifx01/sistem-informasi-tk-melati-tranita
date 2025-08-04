import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query pencarian harus memiliki minimal 2 karakter." },
      { status: 400 }
    );
  }

  try {
    const siswa = await prisma.siswa.findMany({
      where: {
        OR: [
          {
            nama: {
              contains: query,
              mode: "insensitive", // Tidak membedakan huruf besar/kecil
            },
          },
          {
            nis: {
              contains: query,
            },
          },
        ],
      },
      take: 5, // Batasi hasil pencarian agar tidak terlalu banyak
      select: {
        id: true,
        nama: true,
        nis: true,
      },
    });

    return NextResponse.json(siswa);
  } catch (error) {
    console.error("Error searching siswa:", error);
    return NextResponse.json(
      { error: "Gagal melakukan pencarian siswa." },
      { status: 500 }
    );
  }
}
