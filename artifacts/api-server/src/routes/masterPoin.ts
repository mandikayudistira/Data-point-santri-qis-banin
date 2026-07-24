import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, masterPelanggaranTable, masterPrestasiTable } from "@workspace/db";

const router: Router = Router();

// Master Pelanggaran
router.get("/master-pelanggaran", async (_req, res): Promise<void> => {
  const rows = await db.select().from(masterPelanggaranTable).orderBy(masterPelanggaranTable.kode);
  res.json(rows.map((r) => ({
    id: r.id, kode: r.kode, nama: r.nama, poin: r.poin,
    keterangan: r.keterangan, createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/master-pelanggaran", async (req, res): Promise<void> => {
  const { kode, nama, poin, keterangan } = req.body;
  if (!kode || !nama || poin === undefined) {
    res.status(400).json({ error: "kode, nama, dan poin wajib diisi" });
    return;
  }
  const [row] = await db.insert(masterPelanggaranTable).values({
    kode, nama, poin: parseInt(poin, 10), keterangan: keterangan || null,
  }).returning();
  res.status(201).json({ id: row.id, kode: row.kode, nama: row.nama, poin: row.poin, keterangan: row.keterangan, createdAt: row.createdAt.toISOString() });
});

router.put("/master-pelanggaran/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { kode, nama, poin, keterangan } = req.body;
  const [row] = await db.update(masterPelanggaranTable).set({
    ...(kode !== undefined && { kode }),
    ...(nama !== undefined && { nama }),
    ...(poin !== undefined && { poin: parseInt(poin, 10) }),
    keterangan: keterangan ?? null,
  }).where(eq(masterPelanggaranTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
  res.json({ id: row.id, kode: row.kode, nama: row.nama, poin: row.poin, keterangan: row.keterangan, createdAt: row.createdAt.toISOString() });
});

router.delete("/master-pelanggaran/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(masterPelanggaranTable).where(eq(masterPelanggaranTable.id, id));
  res.sendStatus(204);
});

// Master Prestasi
router.get("/master-prestasi", async (_req, res): Promise<void> => {
  const rows = await db.select().from(masterPrestasiTable).orderBy(masterPrestasiTable.kode);
  res.json(rows.map((r) => ({
    id: r.id, kode: r.kode, nama: r.nama, poin: r.poin,
    keterangan: r.keterangan, createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/master-prestasi", async (req, res): Promise<void> => {
  const { kode, nama, poin, keterangan } = req.body;
  if (!kode || !nama || poin === undefined) {
    res.status(400).json({ error: "kode, nama, dan poin wajib diisi" });
    return;
  }
  const [row] = await db.insert(masterPrestasiTable).values({
    kode, nama, poin: parseInt(poin, 10), keterangan: keterangan || null,
  }).returning();
  res.status(201).json({ id: row.id, kode: row.kode, nama: row.nama, poin: row.poin, keterangan: row.keterangan, createdAt: row.createdAt.toISOString() });
});

router.put("/master-prestasi/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { kode, nama, poin, keterangan } = req.body;
  const [row] = await db.update(masterPrestasiTable).set({
    ...(kode !== undefined && { kode }),
    ...(nama !== undefined && { nama }),
    ...(poin !== undefined && { poin: parseInt(poin, 10) }),
    keterangan: keterangan ?? null,
  }).where(eq(masterPrestasiTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
  res.json({ id: row.id, kode: row.kode, nama: row.nama, poin: row.poin, keterangan: row.keterangan, createdAt: row.createdAt.toISOString() });
});

router.delete("/master-prestasi/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(masterPrestasiTable).where(eq(masterPrestasiTable.id, id));
  res.sendStatus(204);
});

export default router;
