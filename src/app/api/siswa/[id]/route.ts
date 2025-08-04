import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateSiswaSchema } from "@/lib/validation"; // Pastikan validasi ini sesuai

// GET /api/siswa/[id] - Mengambil data siswa spesifik
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const siswa = await prisma.siswa.findUnique({
      where: { id: params.id },
      include: {
        kelas: true,
        // Mengganti 'pelanggaran' dengan 'tagihan'
        tagihan: {
          orderBy: {
            tanggalJatuhTempo: "desc",
          },
          include: {
            pemasukan: true, // Sertakan data pembayaran jika ada
          },
        },
      },
    });

    if (!siswa) {
      return NextResponse.json(
        { error: "Siswa tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(siswa);
  } catch (error) {
    console.error("Error fetching siswa by id:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data siswa" },
      { status: 500 }
    );
  }
}

// PUT /api/siswa/[id] - Memperbarui data siswa
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = updateSiswaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Data input tidak valid", details: validation.error.format() },
        { status: 400 }
      );
    }

    const siswa = await prisma.siswa.update({
      where: { id: params.id },
      data: validation.data,
      include: {
        kelas: true,
      },
    });

    return NextResponse.json(siswa);
  } catch (error) {
    console.error("Error updating siswa:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui siswa" },
      { status: 500 }
    );
  }
}

// DELETE /api/siswa/[id] - Menghapus siswa
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Gunakan transaksi untuk memastikan semua data terkait terhapus dengan aman
    await prisma.$transaction(async (tx) => {
      // 1. Dapatkan semua ID tagihan yang terkait dengan siswa
      const tagihanTerkait = await tx.tagihan.findMany({
        where: { siswaId: params.id },
        select: { id: true },
      });
      const tagihanIds = tagihanTerkait.map((t) => t.id);

      // 2. Hapus semua Pemasukan yang terkait dengan tagihan-tagihan tersebut
      if (tagihanIds.length > 0) {
        await tx.pemasukan.deleteMany({
          where: { tagihanId: { in: tagihanIds } },
        });
      }

      // 3. Hapus semua Tagihan yang terkait dengan siswa
      await tx.tagihan.deleteMany({
        where: { siswaId: params.id },
      });

      // 4. Hapus siswa itu sendiri
      await tx.siswa.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({
      message: "Siswa dan semua data terkait berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting siswa:", error);
    return NextResponse.json(
      { error: "Gagal menghapus siswa" },
      { status: 500 }
    );
  }
}
