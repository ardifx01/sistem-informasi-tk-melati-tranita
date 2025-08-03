// File: app/api/kelas/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateKelasSchema } from "@/lib/validations";
import { Prisma } from "@/generated/prisma/client";

// GET /api/kelas/[id] - Mengambil data kelas spesifik
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const kelas = await prisma.kelas.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { siswa: true },
        },
      },
    });

    if (!kelas) {
      return NextResponse.json(
        { error: "Kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...kelas, jumlahSiswa: kelas._count.siswa });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data kelas" },
      { status: 500 }
    );
  }
}

// PUT /api/kelas/[id] - Memperbarui data kelas
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = updateKelasSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Data input tidak valid", details: validation.error.format() },
        { status: 400 }
      );
    }

    const updatedKelas = await prisma.kelas.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json(updatedKelas);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memperbarui kelas" },
      { status: 500 }
    );
  }
}

// DELETE /api/kelas/[id] - Menghapus kelas
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Cek dulu apakah kelasnya ada
    const kelas = await prisma.kelas.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { siswa: true },
        },
      },
    });

    // 2. Jika tidak ada, kirim error 404 (Not Found)
    if (!kelas) {
      return NextResponse.json(
        { error: "Kelas tidak ditemukan." },
        { status: 404 }
      );
    }

    // 3. Jika ada siswa, kirim error 400 (Bad Request)
    if (kelas._count.siswa > 0) {
      return NextResponse.json(
        {
          error: `Tidak dapat menghapus karena masih ada ${kelas._count.siswa} siswa di kelas ini.`,
        },
        { status: 400 }
      );
    }

    // 4. Jika semua aman, baru hapus kelasnya
    await prisma.kelas.delete({
      where: { id: params.id },
    });

    return new Response(null, { status: 204 }); // Sukses, tidak ada konten
  } catch (error) {
    console.error("Error deleting kelas:", error); // Log error di server

    // 5. Tangkap error spesifik dari Prisma jika ada
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2003: Foreign key constraint failed
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "Gagal menghapus. Pastikan tidak ada siswa yang terdaftar di kelas ini.",
          },
          { status: 409 } // 409 Conflict
        );
      }
    }

    // Untuk semua error lainnya
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
