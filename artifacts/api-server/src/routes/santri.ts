import { Router } from "express";
import { eq, ilike, and, sql } from "drizzle-orm";
import { db, santriTable, riwayatPoinTable, masterPelanggaranTable, masterPrestasiTable, usersTable, activityLogsTable } from "@workspace/db";

const router: Router = Router();

router.get("/santri", async (req, res): Promise<void> => {
  const { search, kelas, asrama, status } = req.query;

  const conditions: ReturnType<typeof eq>[] = [];
  if (search && typeof search === "string") {
    conditions.push(
      sql`(${santriTable.nama} ilike ${`%${search}%`} or ${santriTable.nis} ilike ${`%${search}%`})`
    );
  }
  if (kelas && typeof kelas === "string") {
    conditions.push(eq(santriTable.kelas, kelas));
  }
  if (asrama && typeof asrama === "string") {
    conditions.push(eq(santriTable.asrama, asrama));
  }
  if (status && typeof status === "string") {
    conditions.push(eq(santriTable.status, status as "aktif" | "nonaktif" | "alumni"));
  }

  const rows = conditions.length > 0
    ? await db.select().from(santriTable).where(and(...conditions)).orderBy(santriTable.nama)
    : await db.select().from(santriTable).orderBy(santriTable.nama);

  res.json(rows.map((s) => ({
    id: s.id,
    nis: s.nis,
    nama: s.nama,
    ttl: s.ttl,
    jenisKelamin: s.jenisKelamin,
    kelas: s.kelas,
    kamar: s.kamar,
    asrama: s.asrama,
    namaOrtu: s.namaOrtu,
    noHp: s.noHp,
    status: s.status,
    totalPoin: s.totalPoin,
    createdAt: s.createdAt.toISOString(),
  })));
});

router.post("/santri", async (req, res): Promise<void> => {
  const { nis, nama, ttl, jenisKelamin, kelas, kamar, asrama, namaOrtu, noHp, status } = req.body;

  if (!nis || !nama || !kelas || !asrama) {
    res.status(400).json({ error: "NIS, nama, kelas, dan asrama wajib diisi" });
    return;
  }

  const [santri] = await db.insert(santriTable).values({
    nis,
    nama,
    ttl: ttl || null,
    jenisKelamin: jenisKelamin || null,
    kelas,
    kamar: kamar || null,
    asrama,
    namaOrtu: namaOrtu || null,
    noHp: noHp || null,
    status: (status as "aktif" | "nonaktif" | "alumni") || "aktif",
    totalPoin: 0,
  }).returning();

  if (req.session.userId) {
    await db.insert(activityLogsTable).values({
      userId: req.session.userId,
      aksi: "Tambah Santri",
      detail: `Menambahkan santri ${nama} (${nis})`,
    });
  }

  res.status(201).json({
    id: santri.id, nis: santri.nis, nama: santri.nama, ttl: santri.ttl,
    jenisKelamin: santri.jenisKelamin, kelas: santri.kelas, kamar: santri.kamar,
    asrama: santri.asrama, namaOrtu: santri.namaOrtu, noHp: santri.noHp,
    status: santri.status, totalPoin: santri.totalPoin,
    createdAt: santri.createdAt.toISOString(),
  });
});

router.get("/santri/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [santri] = await db.select().from(santriTable).where(eq(santriTable.id, id));
  if (!santri) {
    res.status(404).json({ error: "Santri tidak ditemukan" });
    return;
  }

  // Get riwayat poin with master names
  const riwayat = await db.select().from(riwayatPoinTable).where(eq(riwayatPoinTable.santriId, id)).orderBy(riwayatPoinTable.tanggal);

  // Enrich with master names
  const pelanggaranMasters = await db.select().from(masterPelanggaranTable);
  const prestasiMasters = await db.select().from(masterPrestasiTable);
  const users = await db.select({ id: usersTable.id, nama: usersTable.nama }).from(usersTable);

  const pelanggaranMap = new Map(pelanggaranMasters.map((m) => [m.id, m.nama]));
  const prestasiMap = new Map(prestasiMasters.map((m) => [m.id, m.nama]));
  const userMap = new Map(users.map((u) => [u.id, u.nama]));

  const riwayatEnriched = riwayat.map((r) => ({
    id: r.id, santriId: r.santriId, santriNama: santri.nama,
    tipe: r.tipe,
    masterId: r.masterId,
    masterNama: r.masterId
      ? (r.tipe === "pelanggaran" ? pelanggaranMap.get(r.masterId) : prestasiMap.get(r.masterId)) ?? null
      : null,
    poin: r.poin,
    keterangan: r.keterangan,
    tanggal: r.tanggal,
    createdBy: r.createdBy ? userMap.get(r.createdBy) ?? null : null,
    createdAt: r.createdAt.toISOString(),
  }));

  res.json({
    id: santri.id, nis: santri.nis, nama: santri.nama, ttl: santri.ttl,
    jenisKelamin: santri.jenisKelamin, kelas: santri.kelas, kamar: santri.kamar,
    asrama: santri.asrama, namaOrtu: santri.namaOrtu, noHp: santri.noHp,
    status: santri.status, totalPoin: santri.totalPoin,
    createdAt: santri.createdAt.toISOString(),
    riwayatPoin: riwayatEnriched,
  });
});

router.put("/santri/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { nis, nama, ttl, jenisKelamin, kelas, kamar, asrama, namaOrtu, noHp, status } = req.body;

  const [santri] = await db.update(santriTable).set({
    ...(nis !== undefined && { nis }),
    ...(nama !== undefined && { nama }),
    ttl: ttl ?? null,
    jenisKelamin: jenisKelamin ?? null,
    ...(kelas !== undefined && { kelas }),
    kamar: kamar ?? null,
    ...(asrama !== undefined && { asrama }),
    namaOrtu: namaOrtu ?? null,
    noHp: noHp ?? null,
    ...(status !== undefined && { status: status as "aktif" | "nonaktif" | "alumni" }),
  }).where(eq(santriTable.id, id)).returning();

  if (!santri) {
    res.status(404).json({ error: "Santri tidak ditemukan" });
    return;
  }

  res.json({
    id: santri.id, nis: santri.nis, nama: santri.nama, ttl: santri.ttl,
    jenisKelamin: santri.jenisKelamin, kelas: santri.kelas, kamar: santri.kamar,
    asrama: santri.asrama, namaOrtu: santri.namaOrtu, noHp: santri.noHp,
    status: santri.status, totalPoin: santri.totalPoin,
    createdAt: santri.createdAt.toISOString(),
  });
});

router.delete("/santri/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  await db.delete(santriTable).where(eq(santriTable.id, id));
  res.sendStatus(204);
});

export default router;
