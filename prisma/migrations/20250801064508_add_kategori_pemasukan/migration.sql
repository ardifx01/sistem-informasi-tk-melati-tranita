/*
  Warnings:

  - Added the required column `kategori` to the `Pemasukan` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pemasukan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tanggal" DATETIME NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "keterangan" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pemasukan_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Pemasukan" ("createdAt", "id", "jumlah", "keterangan", "siswaId", "tanggal", "updatedAt") SELECT "createdAt", "id", "jumlah", "keterangan", "siswaId", "tanggal", "updatedAt" FROM "Pemasukan";
DROP TABLE "Pemasukan";
ALTER TABLE "new_Pemasukan" RENAME TO "Pemasukan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
