import {
  db,
  pool,
  usersTable,
  masterPelanggaranTable,
  masterPrestasiTable,
} from "@workspace/db";

async function seed() {
  await db
    .insert(usersTable)
    .values([
      {
        username: "admin",
        password: "adminpassword",
        role: "admin",
        nama: "Administrator",
      },
      {
        username: "sayyid",
        password: "sayyidpassword",
        role: "sayyid",
        nama: "Sayyid / Ustadz",
      },
      {
        username: "wali_santri1",
        password: "walipassword",
        role: "wali",
        nama: "Wali Santri",
      },
    ])
    .onConflictDoNothing({ target: usersTable.username });

  await db
    .insert(masterPelanggaranTable)
    .values([
      { kode: "P-001", nama: "Terlambat kembali ke asrama", poin: -5, keterangan: "Kembali melewati waktu yang ditentukan" },
      { kode: "P-002", nama: "Tidak mengikuti kegiatan wajib", poin: -10, keterangan: "Tidak hadir tanpa keterangan" },
      { kode: "P-003", nama: "Membawa barang terlarang", poin: -25, keterangan: "Barang yang tidak diperbolehkan di pesantren" },
      { kode: "P-004", nama: "Berkelahi", poin: -30, keterangan: "Melakukan kekerasan fisik" },
      { kode: "P-005", nama: "Merusak fasilitas", poin: -20, keterangan: "Kerusakan fasilitas pesantren" },
    ])
    .onConflictDoNothing({ target: masterPelanggaranTable.kode });

  await db
    .insert(masterPrestasiTable)
    .values([
      { kode: "A-001", nama: "Hafalan Al-Quran", poin: 10, keterangan: "Menyelesaikan target hafalan" },
      { kode: "A-002", nama: "Juara lomba internal", poin: 15, keterangan: "Meraih juara dalam perlombaan internal" },
      { kode: "A-003", nama: "Juara lomba eksternal", poin: 25, keterangan: "Meraih juara dalam perlombaan eksternal" },
      { kode: "A-004", nama: "Santri teladan", poin: 20, keterangan: "Mendapat penghargaan santri teladan" },
      { kode: "A-005", nama: "Kedisiplinan terbaik", poin: 10, keterangan: "Kedisiplinan terbaik di kelas atau asrama" },
    ])
    .onConflictDoNothing({ target: masterPrestasiTable.kode });

  console.log("QIPOS seed selesai. Data yang sudah ada tidak ditimpa.");
}

seed()
  .catch((error) => {
    console.error("QIPOS seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });