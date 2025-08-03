/*
  Warnings:

  - You are about to drop the column `siswaId` on the `Pemasukan` table. All the data in the column will be lost.
  - Added the required column `tagihanId` to the `Pemasukan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Tagihan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siswaId" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "jumlahTagihan" INTEGER NOT NULL,
    "tanggalJatuhTempo" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BELUM_LUNAS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tagihan_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pemasukan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tanggal" DATETIME NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "keterangan" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "tagihanId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pemasukan_tagihanId_fkey" FOREIGN KEY ("tagihanId") REFERENCES "Tagihan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Pemasukan" ("createdAt", "id", "jumlah", "kategori", "keterangan", "tanggal", "updatedAt") SELECT "createdAt", "id", "jumlah", "kategori", "keterangan", "tanggal", "updatedAt" FROM "Pemasukan";
DROP TABLE "Pemasukan";
ALTER TABLE "new_Pemasukan" RENAME TO "Pemasukan";
CREATE UNIQUE INDEX "Pemasukan_tagihanId_key" ON "Pemasukan"("tagihanId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
