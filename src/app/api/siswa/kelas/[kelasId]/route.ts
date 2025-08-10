// File: app/api/siswa/kelas/[kelasId]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { kelasId: string } }
) {
  try {
    const siswa = await prisma.siswa.findMany({
      where: {
        kelasId: params.kelasId,
      },
      select: {
        id: true,
        jumlahSpp: true,
      },
    });

    return NextResponse.json(siswa);
  } catch (error) {
    console.error("Error fetching siswa by kelas:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data siswa." },
      { status: 500 }
    );
  }
}
