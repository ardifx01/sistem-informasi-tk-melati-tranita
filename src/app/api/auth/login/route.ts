// File: app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
// Impor fungsi helper dari lib/auth.ts
import { comparePassword, generateToken } from "@/lib/auth";

// Skema validasi untuk login
const loginSchema = z.object({
  email: z.string().email("Email tidak valid."),
  password: z.string().min(1, "Password tidak boleh kosong."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Data input tidak valid.",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // 1. Cari pengguna berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    // 2. Bandingkan password menggunakan fungsi helper Anda
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    // 3. Buat token menggunakan fungsi helper Anda
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Jangan kirim password kembali ke client
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Login berhasil!",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("[LOGIN_API_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
