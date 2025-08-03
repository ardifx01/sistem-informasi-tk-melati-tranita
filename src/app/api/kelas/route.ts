// File: app/api/kelas/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createKelasSchema } from "@/lib/validations";

// GET /api/kelas - Mengambil semua kelas beserta jumlah siswanya
export async function GET() {
  try {
    const kelas = await prisma.kelas.findMany({
      // Hanya mengambil hitungan siswa, bukan data lengkapnya. Ini lebih efisien.
      include: {
        _count: {
          select: {
            siswa: true,
          },
        },
      },
      orderBy: {
        nama: "asc",
      },
    });

    // Ubah format data agar konsisten dengan yang diharapkan frontend
    const responseData = kelas.map((k) => ({
      ...k,
      jumlahSiswa: k._count.siswa, // Mengubah _count.siswa menjadi jumlahSiswa
    }));

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching kelas:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kelas" },
      { status: 500 }
    );
  }
}

// POST /api/kelas - Membuat kelas baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createKelasSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Data input tidak valid", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { nama } = validation.data;

    // Cek apakah nama kelas sudah ada
    const existingKelas = await prisma.kelas.findUnique({
      where: { nama },
    });

    if (existingKelas) {
      return NextResponse.json(
        { error: "Nama kelas sudah ada" },
        { status: 400 }
      );
    }

    const kelasBaru = await prisma.kelas.create({
      data: validation.data,
    });

    // Kembalikan data baru dengan jumlahSiswa = 0
    return NextResponse.json({ ...kelasBaru, jumlahSiswa: 0 }, { status: 201 });
  } catch (error) {
    console.error("Error creating kelas:", error);
    return NextResponse.json(
      { error: "Gagal membuat kelas baru" },
      { status: 500 }
    );
  }
}
