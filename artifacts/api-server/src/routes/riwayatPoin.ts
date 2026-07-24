import { Router } from "express";
import { eq, and, gte, lte } from "drizzle-orm";
import { db, riwayatPoinTable, santriTable, masterPelanggaranTable, masterPrestasiTable, usersTable, activityLogsTable } from "@workspace/db";

const router: Router = Router();

router.get("/riwayat-poin", async (req, res): Promise<void> => {
  const { santriId, tipe, tanggalMulai, tanggalAkhir } = req.query;

  const conditions: ReturnType<typeof eq>[] = [];
  if (santriId) conditions.push(eq(riwayatPoinTable.santriId, parseInt(santriId as string, 10)));
  if (tipe && (tipe === "pelanggaran" || tipe === "prestasi")) {
    conditions.push(eq(riwayatPoinTable.tipe, tipe));
  }
  if (tanggalMulai && typeof tanggalMulai === "string") {
    conditions.push(gte(riwayatPoinTable.tanggal, tanggalMulai));
  }
  if (tanggalAkhir && typeof tanggalAkhir === "string") {
    conditions.push(lte(riwayatPoinTable.tanggal, tanggalAkhir));
  }

  const rows = conditions.length > 0
    ? await db.select().from(riwayatPoinTable).where(and(...conditions)).orderBy(riwayatPoinTable.createdAt)
    : await db.select().from(riwayatPoinTable).orderBy(riwayatPoinTable.createdAt);

  const santriList = await db.select({ id: santriTable.id, nama: santriTable.nama }).from(santriTable);
  const pelanggaranMasters = await db.select().from(masterPelanggaranTable);
  const prestasiMasters = await db.select().from(masterPrestasiTable);
  const users = await db.select({ id: usersTable.id, nama: usersTable.nama }).from(usersTable);

  const santriMap = new Map(santriList.map((s) => [s.id, s.nama]));
  const pelanggaranMap = new Map(pelanggaranMasters.map((m) => [m.id, m.nama]));
  const prestasiMap = new Map(prestasiMasters.map((m) => [m.id, m.nama]));
  const userMap = new Map(users.map((u) => [u.id, u.nama]));

  res.json(rows.map((r) => ({
    id: r.id, santriId: r.santriId,
    santriNama: santriMap.get(r.santriId) ?? null,
    tipe: r.tipe, masterId: r.masterId,
    masterNama: r.masterId
      ? (r.tipe === "pelanggaran" ? pelanggaranMap.get(r.masterId) : prestasiMap.get(r.masterId)) ?? null
      : null,
    poin: r.poin, keterangan: r.keterangan, tanggal: r.tanggal,
    createdBy: r.createdBy ? userMap.get(r.createdBy) ?? null : null,
    createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/riwayat-poin", async (req, res): Promise<void> => {
  const { santriId, tipe, masterId, keterangan, tanggal } = req.body;

  if (!santriId || !tipe || !masterId || !tanggal) {
    res.status(400).json({ error: "santriId, tipe, masterId, dan tanggal wajib diisi" });
    return;
  }

  // Get poin from master
  let poin = 0;
  let masterNama = "";
  if (tipe === "pelanggaran") {
    const [master] = await db.select().from(masterPelanggaranTable).where(eq(masterPelanggaranTable.id, masterId));
    if (!master) { res.status(404).json({ error: "Master pelanggaran tidak ditemukan" }); return; }
    poin = master.poin;
    masterNama = master.nama;
  } else {
    const [master] = await db.select().from(masterPrestasiTable).where(eq(masterPrestasiTable.id, masterId));
    if (!master) { res.status(404).json({ error: "Master prestasi tidak ditemukan" }); return; }
    poin = master.poin;
    masterNama = master.nama;
  }

  const [riwayat] = await db.insert(riwayatPoinTable).values({
    santriId,
    tipe: tipe as "pelanggaran" | "prestasi",
    masterId,
    poin,
    keterangan: keterangan || null,
    tanggal,
    createdBy: req.session.userId || null,
  }).returning();

  // Update total poin santri
  const [santri] = await db.select().from(santriTable).where(eq(santriTable.id, santriId));
  if (santri) {
    const delta = tipe === "pelanggaran" ? -poin : poin;
    await db.update(santriTable).set({ totalPoin: santri.totalPoin + delta }).where(eq(santriTable.id, santriId));

    // Log activity
    if (req.session.userId) {
      await db.insert(activityLogsTable).values({
        userId: req.session.userId,
        aksi: tipe === "pelanggaran" ? "Input Pelanggaran" : "Input Prestasi",
        detail: `${santri.nama} - ${masterNama} (${tipe === "pelanggaran" ? "-" : "+"}${poin} poin)`,
      });
    }
  }

  const users = await db.select({ id: usersTable.id, nama: usersTable.nama }).from(usersTable);
  const userMap = new Map(users.map((u) => [u.id, u.nama]));

  res.status(201).json({
    id: riwayat.id, santriId: riwayat.santriId,
    santriNama: santri?.nama ?? null,
    tipe: riwayat.tipe, masterId: riwayat.masterId,
    masterNama,
    poin: riwayat.poin, keterangan: riwayat.keterangan, tanggal: riwayat.tanggal,
    createdBy: riwayat.createdBy ? userMap.get(riwayat.createdBy) ?? null : null,
    createdAt: riwayat.createdAt.toISOString(),
  });
});

router.delete("/riwayat-poin/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [riwayat] = await db.select().from(riwayatPoinTable).where(eq(riwayatPoinTable.id, id));
  if (!riwayat) { res.status(404).json({ error: "Riwayat tidak ditemukan" }); return; }

  // Reverse the poin change
  const [santri] = await db.select().from(santriTable).where(eq(santriTable.id, riwayat.santriId));
  if (santri) {
    const delta = riwayat.tipe === "pelanggaran" ? riwayat.poin : -riwayat.poin;
    await db.update(santriTable).set({ totalPoin: santri.totalPoin + delta }).where(eq(santriTable.id, riwayat.santriId));
  }

  await db.delete(riwayatPoinTable).where(eq(riwayatPoinTable.id, id));
  res.sendStatus(204);
});

export default router;
