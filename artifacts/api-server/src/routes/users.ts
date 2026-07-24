import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

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

export default router;
