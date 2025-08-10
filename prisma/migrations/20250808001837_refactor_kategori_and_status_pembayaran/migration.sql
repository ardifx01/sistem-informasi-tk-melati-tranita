/*
  Warnings:

  - The values [TERLAMBAT] on the enum `StatusPembayaran` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `kategori` on the `Pemasukan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `kategori` on the `Pengeluaran` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `jumlahSpp` to the `Siswa` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TipeKategori" AS ENUM ('PEMASUKAN', 'PENGELUARAN');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."StatusPembayaran_new" AS ENUM ('BELUM_LUNAS', 'LUNAS');
ALTER TABLE "public"."Tagihan" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Tagihan" ALTER COLUMN "status" TYPE "public"."StatusPembayaran_new" USING ("status"::text::"public"."StatusPembayaran_new");
ALTER TYPE "public"."StatusPembayaran" RENAME TO "StatusPembayaran_old";
ALTER TYPE "public"."StatusPembayaran_new" RENAME TO "StatusPembayaran";
DROP TYPE "public"."StatusPembayaran_old";
ALTER TABLE "public"."Tagihan" ALTER COLUMN "status" SET DEFAULT 'BELUM_LUNAS';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Pemasukan" DROP COLUMN "kategori",
ADD COLUMN     "kategori" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Pengeluaran" DROP COLUMN "kategori",
ADD COLUMN     "kategori" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Siswa" ADD COLUMN     "jumlahSpp" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "public"."KategoriPemasukan";

-- DropEnum
DROP TYPE "public"."KategoriPengeluaran";

-- CreateTable
CREATE TABLE "public"."Kategori" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" "public"."TipeKategori" NOT NULL,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_nama_key" ON "public"."Kategori"("nama");
