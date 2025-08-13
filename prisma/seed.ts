import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.pemasukan.deleteMany();
  await prisma.tagihan.deleteMany();
  await prisma.pengeluaran.deleteMany();
  await prisma.siswa.deleteMany();
  await prisma.kelas.deleteMany();
  await prisma.kategori.deleteMany();
  await prisma.user.deleteMany();
  console.log("🗑️ Data lama berhasil dihapus.");

  const kategoriSpp = await prisma.kategori.create({
    data: { nama: "Uang Sekolah (SPP)", tipe: "PEMASUKAN" },
  });
  const kategoriPendaftaran = await prisma.kategori.create({
    data: { nama: "Uang Pendaftaran", tipe: "PEMASUKAN" },
  });
  const kategoriAtk = await prisma.kategori.create({
    data: { nama: "Alat Tulis Kantor", tipe: "PENGELUARAN" },
  });
  const kategoriOperasional = await prisma.kategori.create({
    data: { nama: "Operasional", tipe: "PENGELUARAN" },
  });
  console.log(
    "🗂️ Kategori default berhasil dibuat.",
    kategoriSpp,
    kategoriPendaftaran,
    kategoriAtk,
    kategoriOperasional
  );

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@gmail.com",
      password: await hashPassword("admin123"),
      role: "ADMIN",
    },
  });

  // Create guru user
  const guruUser = await prisma.user.upsert({
    where: { email: "guru@gmail.com" },
    update: {},
    create: {
      name: "Guru TK",
      email: "guru@gmail.com",
      password: await hashPassword("guru123"),
      role: "GURU",
    },
  });

  console.log("👤 Users created:", { adminUser, guruUser });

  // Create kelas
  const kelasA = await prisma.kelas.upsert({
    where: { nama: "A" },
    update: {},
    create: {
      nama: "A",
      waliKelas: "Pak Agus Setiawan , S.Pd",
    },
  });

  const kelasB1 = await prisma.kelas.upsert({
    where: { nama: "B1" },
    update: {},
    create: {
      nama: "B1",
      waliKelas: "Bu Sari Indah, S.Pd",
    },
  });

  const kelasB2 = await prisma.kelas.upsert({
    where: { nama: "B2" },
    update: {},
    create: {
      nama: "B2",
      waliKelas: "Pak Budi Santoso, S.Pd",
    },
  });

  const kelasB3 = await prisma.kelas.upsert({
    where: { nama: "B3" },
    update: {},
    create: {
      nama: "B3",
      waliKelas: "Bu Rina Wati, S.Pd",
    },
  });

  const kelasB4 = await prisma.kelas.upsert({
    where: { nama: "B4" },
    update: {},
    create: {
      nama: "B4",
      waliKelas: "Pak Dedi Kurniawan, S.Pd",
    },
  });

  console.log("🏫 Kelas created:", {
    kelasA,
    kelasB1,
    kelasB2,
    kelasB3,
    kelasB4,
  });

  // Create siswa
  const siswa1 = await prisma.siswa.upsert({
    where: { nis: "2023001" },
    update: {},
    create: {
      nis: "2023001",
      nama: "Ahmad Rizki Pratama",
      jenisKelamin: "L",
      tanggalLahir: new Date("2005-03-15"),
      alamat: "Jl. Merdeka No. 10, Jakarta",
      telepon: "081234567890",
      orangTua: "Asep",
      jumlahSpp: 175000, // Jumlah SPP per bulan
      kelasId: kelasA.id,
    },
  });

  const siswa2 = await prisma.siswa.upsert({
    where: { nis: "2023002" },
    update: {},
    create: {
      nis: "2023002",
      nama: "Siti Nurhaliza",
      jenisKelamin: "P",
      tanggalLahir: new Date("2005-07-22"),
      alamat: "Jl. Sudirman No. 25, Jakarta",
      telepon: "081234567891",
      orangTua: "Ananda",
      jumlahSpp: 100000, // Jumlah SPP per bulan
      kelasId: kelasA.id,
    },
  });

  const siswa3 = await prisma.siswa.upsert({
    where: { nis: "2023003" },
    update: {},
    create: {
      nis: "2023003",
      nama: "Budi Santoso",
      jenisKelamin: "L",
      tanggalLahir: new Date("2006-01-10"),
      alamat: "Jl. Pahlawan No. 5, Jakarta",
      telepon: "081234567892",
      orangTua: "Agus",
      jumlahSpp: 175000, // Jumlah SPP per bulan
      kelasId: kelasB1.id,
    },
  });

  const siswa7 = await prisma.siswa.upsert({
    where: { nis: "2023007" },
    update: {},
    create: {
      nis: "2023007",
      nama: "Budi Agus",
      jenisKelamin: "L",
      tanggalLahir: new Date("2006-01-10"),
      alamat: "Jl. Pahlawan No. 5, Jakarta",
      telepon: "081234567892",
      orangTua: "Agus",
      jumlahSpp: 100000, // Jumlah SPP per bulan
      kelasId: kelasB1.id,
    },
  });

  const siswa4 = await prisma.siswa.upsert({
    where: { nis: "2023004" },
    update: {},
    create: {
      nis: "2023004",
      nama: "Dewi Sartika",
      jenisKelamin: "P",
      tanggalLahir: new Date("2007-05-18"),
      alamat: "Jl. Gatot Subroto No. 15, Jakarta",
      telepon: "081234567893",
      orangTua: "Supardi",
      jumlahSpp: 350000, // Jumlah SPP per bulan
      kelasId: kelasB2.id,
    },
  });

  const siswa8 = await prisma.siswa.upsert({
    where: { nis: "2023004" },
    update: {},
    create: {
      nis: "2023004",
      nama: "Dewi Sari",
      jenisKelamin: "P",
      tanggalLahir: new Date("2007-05-18"),
      alamat: "Jl. Gatot Subroto No. 15, Jakarta",
      telepon: "081234567893",
      orangTua: "Supardi",
      jumlahSpp: 150000, // Jumlah SPP per bulan
      kelasId: kelasB2.id,
    },
  });

  const siswa5 = await prisma.siswa.upsert({
    where: { nis: "2023005" },
    update: {},
    create: {
      nis: "2023005",
      nama: "Farid Rahman",
      jenisKelamin: "L",
      tanggalLahir: new Date("2007-11-03"),
      alamat: "Jl. Thamrin No. 8, Jakarta",
      telepon: "081234567894",
      orangTua: "Sumanto",
      jumlahSpp: 350000, // Jumlah SPP per bulan
      kelasId: kelasB3.id,
    },
  });

  const siswa6 = await prisma.siswa.upsert({
    where: { nis: "2023006" },
    update: {},
    create: {
      nis: "2023006",
      nama: "Ali Musthafa",
      jenisKelamin: "L",
      tanggalLahir: new Date("2002-11-03"),
      alamat: "Jl. Manas No. 8, Jawa",
      telepon: "081234567894",
      orangTua: "Sucipto",
      jumlahSpp: 350000, // Jumlah SPP per bulan
      kelasId: kelasB3.id,
    },
  });

  console.log("👨‍🎓 Siswa created:", {
    siswa1,
    siswa2,
    siswa3,
    siswa4,
    siswa5,
    siswa6,
    siswa7,
    siswa8,
  });

  //tagihan 1
  const tagihanSiswa1 = await prisma.tagihan.create({
    data: {
      siswaId: siswa1.id,
      keterangan: "SPP Bulan Juli 2025",
      jumlahTagihan: 125000,
      tanggalJatuhTempo: new Date("2025-07-10"),
      status: "LUNAS",
    },
  });

  // Buat Pemasukan untuk melunasi tagihan siswa 1
  await prisma.pemasukan.create({
    data: {
      tanggal: new Date("2025-07-05"),
      jumlah: 125000,
      keterangan: "Pembayaran SPP Juli via transfer",
      kategori: "UANG SEKOLAH",
      tagihanId: tagihanSiswa1.id,
    },
  });

  //tagihan 2
  const tagihanSiswa2 = await prisma.tagihan.create({
    data: {
      siswaId: siswa2.id,
      keterangan: "SPP Bulan Juli 2025",
      jumlahTagihan: 125000,
      tanggalJatuhTempo: new Date("2025-07-10"),
      status: "BELUM_LUNAS",
    },
  });

  // Buat Pemasukan untuk melunasi tagihan siswa 2
  await prisma.pemasukan.create({
    data: {
      tanggal: new Date("2025-07-05"),
      jumlah: 125000,
      keterangan: "Pembayaran SPP Juli via transfer",
      kategori: "UANG SEKOLAH",
      tagihanId: tagihanSiswa2.id,
    },
  });

  //tagihan 3
  const tagihanSiswa3 = await prisma.tagihan.create({
    data: {
      siswaId: siswa3.id,
      keterangan: "SPP Bulan Juli 2025",
      jumlahTagihan: 125000,
      tanggalJatuhTempo: new Date("2025-07-10"),
      status: "LUNAS",
    },
  });

  // Buat Pemasukan untuk melunasi tagihan siswa 3
  await prisma.pemasukan.create({
    data: {
      tanggal: new Date("2025-07-05"),
      jumlah: 125000,
      keterangan: "Pembayaran SPP Juli via transfer",
      kategori: "UANG SEKOLAH",
      tagihanId: tagihanSiswa3.id,
    },
  });

  //tagihan 4
  const tagihanSiswa4 = await prisma.tagihan.create({
    data: {
      siswaId: siswa4.id,
      keterangan: "SPP Bulan Juli 2025",
      jumlahTagihan: 125000,
      tanggalJatuhTempo: new Date("2025-07-10"),
      status: "LUNAS",
    },
  });

  // Buat Pemasukan untuk melunasi tagihan siswa 4
  await prisma.pemasukan.create({
    data: {
      tanggal: new Date("2025-07-05"),
      jumlah: 125000,
      keterangan: "Pembayaran SPP Juli via transfer",
      kategori: "UANG SEKOLAH",
      tagihanId: tagihanSiswa4.id,
    },
  });

  //tagihan 5
  const tagihanSiswa5 = await prisma.tagihan.create({
    data: {
      siswaId: siswa5.id,
      keterangan: "SPP Bulan Juli 2025",
      jumlahTagihan: 125000,
      tanggalJatuhTempo: new Date("2025-07-10"),
      status: "BELUM_LUNAS",
    },
  });

  // Buat Pemasukan untuk melunasi tagihan siswa 4
  await prisma.pemasukan.create({
    data: {
      tanggal: new Date("2025-07-05"),
      jumlah: 125000,
      keterangan: "Pembayaran SPP Juli via transfer",
      kategori: "UANG SEKOLAH",
      tagihanId: tagihanSiswa5.id,
    },
  });

  //tagihan 6
  const tagihanSiswa6 = await prisma.tagihan.create({
    data: {
      siswaId: siswa6.id,
      keterangan: "SPP Bulan Juli 2025",
      jumlahTagihan: 125000,
      tanggalJatuhTempo: new Date("2025-07-10"),
      status: "BELUM_LUNAS",
    },
  });

  // Buat Pemasukan untuk melunasi tagihan siswa 4
  await prisma.pemasukan.create({
    data: {
      tanggal: new Date("2025-07-05"),
      jumlah: 125000,
      keterangan: "Pembayaran SPP Juli via transfer",
      kategori: "UANG SEKOLAH",
      tagihanId: tagihanSiswa6.id,
    },
  });

  console.log("Tagihan dan riwayat pembayaran berhasil dibuat.");

  //  Buat data Pengeluaran
  await prisma.pengeluaran.create({
    data: {
      tanggal: new Date(),
      jumlah: 50000,
      keterangan: "Pembelian spidol dan kertas A4",
      kategori: "ATK",
    },
  });

  await prisma.pengeluaran.create({
    data: {
      tanggal: new Date(),
      jumlah: 200000,
      keterangan: "Pembayaran tagihan listrik bulan Juni",
      kategori: "OPERASIONAL",
    },
  });
  console.log("Data pengeluaran berhasil dibuat.");

  console.log("✅ Database seeded successfully!");
}

main()
  .catch(async (e) => {
    console.error("❌ Gagal melakukan seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
