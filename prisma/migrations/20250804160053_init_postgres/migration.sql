-- CreateEnum
CREATE TYPE "public"."KategoriPemasukan" AS ENUM ('UANG_SEKOLAH', 'UANG_PENDAFTARAN', 'LAINNYA');

-- CreateEnum
CREATE TYPE "public"."KategoriPengeluaran" AS ENUM ('ATK', 'OPERASIONAL', 'GAJI_GURU', 'KEGIATAN_SISWA', 'PERAWATAN_ASET', 'LAINNYA');

-- CreateEnum
CREATE TYPE "public"."StatusPembayaran" AS ENUM ('BELUM_LUNAS', 'LUNAS', 'TERLAMBAT');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'GURU');

-- CreateEnum
CREATE TYPE "public"."JenisKelamin" AS ENUM ('L', 'P');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Siswa" (
    "id" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenisKelamin" "public"."JenisKelamin" NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "alamat" TEXT NOT NULL,
    "telepon" TEXT NOT NULL,
    "orangTua" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Kelas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "waliKelas" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tagihan" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "jumlahTagihan" INTEGER NOT NULL,
    "tanggalJatuhTempo" TIMESTAMP(3) NOT NULL,
    "status" "public"."StatusPembayaran" NOT NULL DEFAULT 'BELUM_LUNAS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tagihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pemasukan" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "keterangan" TEXT NOT NULL,
    "kategori" "public"."KategoriPemasukan" NOT NULL,
    "tagihanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pemasukan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pengeluaran" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "keterangan" TEXT NOT NULL,
    "kategori" "public"."KategoriPengeluaran" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengeluaran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Siswa_nis_key" ON "public"."Siswa"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "Kelas_nama_key" ON "public"."Kelas"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Pemasukan_tagihanId_key" ON "public"."Pemasukan"("tagihanId");

-- AddForeignKey
ALTER TABLE "public"."Siswa" ADD CONSTRAINT "Siswa_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "public"."Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tagihan" ADD CONSTRAINT "Tagihan_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "public"."Siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pemasukan" ADD CONSTRAINT "Pemasukan_tagihanId_fkey" FOREIGN KEY ("tagihanId") REFERENCES "public"."Tagihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
