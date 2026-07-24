import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, waliSantriTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: Router = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Username dan password wajib diisi" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (!user || user.password !== password) {
    res.status(401).json({ error: "Username atau password salah" });
    return;
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.role = user.role;
  req.session.nama = user.nama;

  let waliSantriIds: number[] = [];
  if (user.role === "wali") {
    const relations = await db
      .select()
      .from(waliSantriTable)
      .where(eq(waliSantriTable.userId, user.id));
    waliSantriIds = relations.map((r) => r.santriId);
  }

  logger.info({ userId: user.id, role: user.role }, "User logged in");

  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    nama: user.nama,
    waliSantriIds,
  });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy((err) => {
    if (err) {
      logger.error({ err }, "Error destroying session");
    }
  });
  res.json({ message: "Logout berhasil" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Belum login" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId));

  if (!user) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "Session tidak valid" });
    return;
  }

  let waliSantriIds: number[] = [];
  if (user.role === "wali") {
    const relations = await db
      .select()
      .from(waliSantriTable)
      .where(eq(waliSantriTable.userId, user.id));
    waliSantriIds = relations.map((r) => r.santriId);
  }

  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    nama: user.nama,
    waliSantriIds,
  });
});

export default router;
