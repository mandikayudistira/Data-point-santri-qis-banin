import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, usersTable, waliSantriTable, santriTable } from "@workspace/db";

const router: Router = Router();

router.get("/users", async (req, res): Promise<void> => {
  if (req.session.role !== "admin") {
    res.status(403).json({ error: "Akses ditolak" });
    return;
  }
  const rows = await db.select({
    id: usersTable.id,
    username: usersTable.username,
    role: usersTable.role,
    nama: usersTable.nama,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(usersTable.nama);

  res.json(rows.map((u) => ({
    id: u.id, username: u.username, role: u.role, nama: u.nama,
    createdAt: u.createdAt.toISOString(),
  })));
});

router.post("/users", async (req, res): Promise<void> => {
  if (req.session.role !== "admin") {
    res.status(403).json({ error: "Akses ditolak" });
    return;
  }
  const { username, password, role, nama } = req.body;
  if (!username || !password || !role || !nama) {
    res.status(400).json({ error: "Semua field wajib diisi" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    username, password, role: role as "admin" | "sayyid" | "wali", nama,
  }).returning();
  res.status(201).json({ id: user.id, username: user.username, role: user.role, nama: user.nama, createdAt: user.createdAt.toISOString() });
});

router.put("/users/:id", async (req, res): Promise<void> => {
  if (req.session.role !== "admin") {
    res.status(403).json({ error: "Akses ditolak" });
    return;
  }
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { username, password, role, nama } = req.body;

  const [user] = await db.update(usersTable).set({
    ...(username !== undefined && { username }),
    ...(password ? { password } : {}),
    ...(role !== undefined && { role: role as "admin" | "sayyid" | "wali" }),
    ...(nama !== undefined && { nama }),
  }).where(eq(usersTable.id, id)).returning();

  if (!user) { res.status(404).json({ error: "Pengguna tidak ditemukan" }); return; }
  res.json({ id: user.id, username: user.username, role: user.role, nama: user.nama, createdAt: user.createdAt.toISOString() });
});

router.delete("/users/:id", async (req, res): Promise<void> => {
  if (req.session.role !== "admin") {
    res.status(403).json({ error: "Akses ditolak" });
    return;
  }
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.sendStatus(204);
});

// --- Wali-Santri linking ---

router.get("/users/:id/wali-santri", async (req, res): Promise<void> => {
  if (req.session.role !== "admin") {
    res.status(403).json({ error: "Akses ditolak" });
    return;
  }
  const userId = parseInt(req.params.id as string, 10);
  const rows = await db
    .select({
      id: santriTable.id,
      nis: santriTable.nis,
      nama: santriTable.nama,
      kelas: santriTable.kelas,
      asrama: santriTable.asrama,
    })
    .from(waliSantriTable)
    .innerJoin(santriTable, eq(waliSantriTable.santriId, santriTable.id))
    .where(eq(waliSantriTable.userId, userId));
  res.json(rows);
});

router.post("/users/:id/wali-santri", async (req, res): Promise<void> => {
  if (req.session.role !== "admin") {
    res.status(403).json({ error: "Akses ditolak" });
    return;
  }
  const userId = parseInt(req.params.id as string, 10);
  const { santriId } = req.body;
  if (!santriId) {
    res.status(400).json({ error: "santriId wajib diisi" });
    return;
  }

  // Check if user exists and is wali
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "Pengguna tidak ditemukan" }); return; }
  if (user.role !== "wali") { res.status(400).json({ error: "Pengguna bukan role Wali Santri" }); return; }

  // Check if already linked
  const existing = await db
    .select()
    .from(waliSantriTable)
    .where(and(eq(waliSantriTable.userId, userId), eq(waliSantriTable.santriId, santriId)));
  if (existing.length > 0) {
    res.status(409).json({ error: "Santri sudah terhubung dengan akun ini" });
    return;
  }

  const [row] = await db.insert(waliSantriTable).values({ userId, santriId }).returning();
  res.status(201).json(row);
});

router.delete("/users/:id/wali-santri/:santriId", async (req, res): Promise<void> => {
  if (req.session.role !== "admin") {
    res.status(403).json({ error: "Akses ditolak" });
    return;
  }
  const userId = parseInt(req.params.id as string, 10);
  const santriId = parseInt(req.params.santriId as string, 10);
  await db
    .delete(waliSantriTable)
    .where(and(eq(waliSantriTable.userId, userId), eq(waliSantriTable.santriId, santriId)));
  res.sendStatus(204);
});

export default router;
