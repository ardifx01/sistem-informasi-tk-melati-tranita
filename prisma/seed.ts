import { prisma } from "@/lib/db";
import { hashPassword } from "../src/lib/auth";

async function main() {
  console.log("🌱 Seeding database...");

  // await prisma.pemasukan.deleteMany();
  // await prisma.tagihan.deleteMany();
  // await prisma.pengeluaran.deleteMany();
  // await prisma.siswa.deleteMany();
  // await prisma.kelas.deleteMany();
  // await prisma.user.deleteMany();
  // console.log("Data lama berhasil dihapus.");

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
      waliKelas: "Pak Agus Setiawan",
    },
  });

  const kelasB1 = await prisma.kelas.upsert({
    where: { nama: "B1" },
    update: {},
    create: {
      nama: "B1",
      waliKelas: "Bu Sari Indah",
    },
  });

  const kelasB2 = await prisma.kelas.upsert({
    where: { nama: "B2" },
    update: {},
    create: {
      nama: "B2",
      waliKelas: "Pak Budi Santoso",
    },
  });

  const kelasB3 = await prisma.kelas.upsert({
    where: { nama: "B3" },
    update: {},
    create: {
      nama: "B3",
      waliKelas: "Bu Rina Wati",
    },
  });

  const kelasB4 = await prisma.kelas.upsert({
    where: { nama: "B4" },
    update: {},
    create: {
      nama: "B4",
      waliKelas: "Pak Dedi Kurniawan",
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
      kelasId: kelasB3.id,
    },
  });

  console.log("👨‍🎓 Siswa created:", { siswa1, siswa2, siswa3, siswa4, siswa5 });

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
      kategori: "UANG_SEKOLAH",
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
      kategori: "UANG_SEKOLAH",
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
      kategori: "UANG_SEKOLAH",
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
      status: "TERLAMBAT",
    },
  });

  // Buat Pemasukan untuk melunasi tagihan siswa 4
  await prisma.pemasukan.create({
    data: {
      tanggal: new Date("2025-07-05"),
      jumlah: 125000,
      keterangan: "Pembayaran SPP Juli via transfer",
      kategori: "UANG_SEKOLAH",
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
      kategori: "UANG_SEKOLAH",
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
      kategori: "UANG_SEKOLAH",
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

  // Create pelanggaran dengan distribusi tanggal sepanjang tahun untuk tren yang realistis
  // const currentYear = new Date().getFullYear();

  // const pelanggaran1 = await prisma.pelanggaran.create({
  //   data: {
  //     siswaId: siswa1.id,
  //     tanggal: new Date(`${currentYear}-01-15`),
  //     jenisPelanggaran: "Terlambat",
  //     tingkatPelanggaran: "RINGAN",
  //     deskripsi:
  //       "Terlambat masuk kelas selama 15 menit tanpa keterangan yang jelas",
  //     tindakan: "Teguran lisan dan pencatatan di buku pelanggaran",
  //     status: "SELESAI",
  //   },
  // });

  // const pelanggaran2 = await prisma.pelanggaran.create({
  //   data: {
  //     siswaId: siswa2.id,
  //     tanggal: new Date(`${currentYear}-02-16`),
  //     jenisPelanggaran: "Tidak mengerjakan tugas",
  //     tingkatPelanggaran: "SEDANG",
  //     deskripsi: "Tidak mengerjakan PR Matematika selama 3 hari berturut-turut",
  //     tindakan: "Panggilan orang tua dan bimbingan khusus",
  //     status: "PROSES",
  //   },
  // });

  // const pelanggaran3 = await prisma.pelanggaran.create({
  //   data: {
  //     siswaId: siswa3.id,
  //     tanggal: new Date(`${currentYear}-03-17`),
  //     jenisPelanggaran: "Berkelahi",
  //     tingkatPelanggaran: "BERAT",
  //     deskripsi: "Berkelahi dengan teman sekelas di kantin sekolah",
  //     tindakan: "Skorsing 3 hari dan mediasi dengan pihak yang bertikai",
  //     status: "PENDING",
  //   },
  // });

  // const pelanggaran4 = await prisma.pelanggaran.create({
  //   data: {
  //     siswaId: siswa4.id,
  //     tanggal: new Date(`${currentYear}-04-20`),
  //     jenisPelanggaran: "Tidak berseragam",
  //     tingkatPelanggaran: "RINGAN",
  //     deskripsi: "Tidak memakai seragam lengkap (tidak memakai dasi)",
  //     tindakan: "Teguran dan diminta melengkapi seragam",
  //     status: "SELESAI",
  //   },
  // });

  // const pelanggaran5 = await prisma.pelanggaran.create({
  //   data: {
  //     siswaId: siswa5.id,
  //     tanggal: new Date(`${currentYear}-05-22`),
  //     jenisPelanggaran: "Membolos",
  //     tingkatPelanggaran: "SEDANG",
  //     deskripsi: "Membolos pelajaran bahasa inggris tanpa ijin",
  //     tindakan: "Panggilan orang tua dan konseling",
  //     status: "PROSES",
  //   },
  // });

  // // Tambah beberapa pelanggaran lagi untuk tren yang lebih terlihat
  // const pelanggaran6 = await prisma.pelanggaran.create({
  //   data: {
  //     siswaId: siswa1.id,
  //     tanggal: new Date(`${currentYear}-06-10`),
  //     jenisPelanggaran: "Terlambat",
  //     tingkatPelanggaran: "RINGAN",
  //     deskripsi: "Terlambat masuk kelas kedua kalinya",
  //     tindakan: "Teguran tertulis dan peringatan",
  //     status: "SELESAI",
  //   },
  // });

  // const pelanggaran7 = await prisma.pelanggaran.create({
  //   data: {
  //     siswaId: siswa3.id,
  //     tanggal: new Date(`${currentYear}-07-08`),
  //     jenisPelanggaran: "Tidak berseragam",
  //     tingkatPelanggaran: "RINGAN",
  //     deskripsi: "Tidak memakai sepatu sekolah yang sesuai",
  //     tindakan: "Teguran dan diminta ganti sepatu",
  //     status: "SELESAI",
  //   },
  // });

  // const pelanggaran8 = await prisma.pelanggaran.create({
  //   data: {
  //     siswaId: siswa2.id,
  //     tanggal: new Date(`${currentYear}-07-19`),
  //     jenisPelanggaran: "Membolos",
  //     tingkatPelanggaran: "SEDANG",
  //     deskripsi: "Membolos pelajaran praktikum tanpa keterangan",
  //     tindakan: "Panggilan orang tua dan konseling",
  //     status: "PROSES",
  //   },
  // });

  // console.log("⚠️ Pelanggaran created:", {
  //   pelanggaran1,
  //   pelanggaran2,
  //   pelanggaran3,
  //   pelanggaran4,
  //   pelanggaran5,
  //   pelanggaran6,
  //   pelanggaran7,
  //   pelanggaran8,
  // });

  console.log("✅ Database seeded successfully!");
  //   console.log(`
  // 📋 Summary SMKN 9 KOLAKA:
  // - Users: 2 (1 Admin, 1 Guru)
  // - Kelas: 5 (5 Kelas)
  // - Siswa: 5
  // - pemasukan: (pembayaran spp)
  // - pengeluaran: (pembelian spidol dll)

  // 🏫 Struktur Kelas :
  // - Jurusan: TKJ, GP, MPLB, TAB, TEI
  // - Paralel: 1, 2, 3 (sesuai kebutuhan)

  // � Jurusan SMK:
  // - TKJ (Teknik Komputer dan Jaringan)
  // - GP (Geologi Pertambangan)
  // - MPLB (Manajemen Perkantoran dan Layanan Bisnis)
  // - TAB (Teknik Gambar Bangunan)
  // - TEI (Teknik Elektronika Industri)

  // �🔑 Login credentials:
  // - Admin: admin@sekolah.com / password123
  // - Guru: guru@sekolah.com / password123
  //   `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
