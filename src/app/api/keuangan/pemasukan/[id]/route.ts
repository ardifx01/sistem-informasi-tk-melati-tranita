// File: app/api/keuangan/pemasukan/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Handler untuk membatalkan (menghapus) pembayaran
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Gunakan transaksi untuk memastikan semua operasi berhasil atau gagal bersamaan
    await prisma.$transaction(async (tx) => {
      // 1. Dapatkan info pemasukan untuk mengetahui tagihanId terkait
      const pemasukan = await tx.pemasukan.findUnique({
        where: { id: params.id },
        select: { tagihanId: true },
      });

      if (!pemasukan) {
        // Jika pemasukan tidak ditemukan, lempar error untuk membatalkan transaksi
        throw new Error("Pemasukan tidak ditemukan.");
      }

      // --- PERBAIKAN DI SINI ---
      // 2. Cek apakah tagihan terkait masih ada sebelum melanjutkan
      const tagihanTerkait = await tx.tagihan.findUnique({
        where: { id: pemasukan.tagihanId },
      });

      if (!tagihanTerkait) {
        // Jika tagihan tidak ada, hapus saja pemasukan yatim ini dan anggap berhasil
        console.warn(
          `Menghapus pemasukan yatim (ID: ${params.id}) karena tagihan terkait tidak ditemukan.`
        );
        await tx.pemasukan.delete({ where: { id: params.id } });
        return; // Keluar dari transaksi
      }
      // --- AKHIR PERBAIKAN ---

      // 3. Hapus pemasukan
      await tx.pemasukan.delete({
        where: { id: params.id },
      });

      // 4. Kembalikan status tagihan menjadi BELUM_LUNAS
      await tx.tagihan.update({
        where: { id: pemasukan.tagihanId },
        data: { status: "BELUM_LUNAS" },
      });
    });

    return new Response(null, { status: 204 }); // 204 No Content
  } catch (error: any) {
    console.error("Error saat membatalkan pembayaran:", error);

    // Kirim pesan error yang lebih spesifik jika pemasukan tidak ditemukan
    if (error.message === "Pemasukan tidak ditemukan.") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Gagal membatalkan pembayaran." },
      { status: 500 }
    );
  }
}
