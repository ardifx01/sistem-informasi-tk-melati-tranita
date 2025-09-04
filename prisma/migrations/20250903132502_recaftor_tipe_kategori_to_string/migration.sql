/*
  Warnings:

  - Changed the type of `tipe` on the `Kategori` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Kategori" DROP COLUMN "tipe",
ADD COLUMN     "tipe" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."TipeKategori";
