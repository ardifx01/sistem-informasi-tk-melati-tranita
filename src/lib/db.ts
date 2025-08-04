// File: lib/db.ts

import { PrismaClient } from "@/generated/prisma/client";
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Menerapkan pola singleton untuk PrismaClient
export const prisma =
  global.prisma ||
  new PrismaClient({
    // Opsi log bisa diaktifkan untuk debugging
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
