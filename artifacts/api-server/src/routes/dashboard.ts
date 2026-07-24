import { Router } from "express";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { db, santriTable, riwayatPoinTable, usersTable, activityLogsTable } from "@workspace/db";

const router: Router = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

  const [totalSantriRow] = await db.select({ count: sql<number>`count(*)` }).from(santriTable);
  const [santriAktifRow] = await db.select({ count: sql<number>`count(*)` }).from(santriTable).where(eq(santriTable.status, "aktif"));

  const [pelanggaranHariIniRow] = await db.select({ count: sql<number>`count(*)` }).from(riwayatPoinTable)
    .where(and(eq(riwayatPoinTable.tipe, "pelanggaran"), eq(riwayatPoinTable.tanggal, todayStr)));
  const [prestasiHariIniRow] = await db.select({ count: sql<number>`count(*)` }).from(riwayatPoinTable)
    .where(and(eq(riwayatPoinTable.tipe, "prestasi"), eq(riwayatPoinTable.tanggal, todayStr)));

  const [pelanggaranBulanIniRow] = await db.select({ count: sql<number>`count(*)` }).from(riwayatPoinTable)
    .where(and(eq(riwayatPoinTable.tipe, "pelanggaran"), gte(riwayatPoinTable.tanggal, monthStart)));
  const [prestasiBulanIniRow] = await db.select({ count: sql<number>`count(*)` }).from(riwayatPoinTable)
    .where(and(eq(riwayatPoinTable.tipe, "prestasi"), gte(riwayatPoinTable.tanggal, monthStart)));

  res.json({
    totalSantri: Number(totalSantriRow?.count ?? 0),
    santriAktif: Number(santriAktifRow?.count ?? 0),
    pelanggaranHariIni: Number(pelanggaranHariIniRow?.count ?? 0),
    prestasiHariIni: Number(prestasiHariIniRow?.count ?? 0),
    pelanggaranBulanIni: Number(pelanggaranBulanIniRow?.count ?? 0),
    prestasiBulanIni: Number(prestasiBulanIniRow?.count ?? 0),
  });
});

router.get("/dashboard/aktivitas", async (_req, res): Promise<void> => {
  const logs = await db
    .select({
      id: activityLogsTable.id,
      userId: activityLogsTable.userId,
      aksi: activityLogsTable.aksi,
      detail: activityLogsTable.detail,
      createdAt: activityLogsTable.createdAt,
    })
    .from(activityLogsTable)
    .orderBy(desc(activityLogsTable.createdAt))
    .limit(20);

  const users = await db.select({ id: usersTable.id, nama: usersTable.nama }).from(usersTable);
  const userMap = new Map(users.map((u) => [u.id, u.nama]));

  res.json(logs.map((log) => ({
    id: log.id,
    userId: log.userId,
    userName: log.userId ? userMap.get(log.userId) ?? null : null,
    aksi: log.aksi,
    detail: log.detail,
    createdAt: log.createdAt.toISOString(),
  })));
});

router.get("/dashboard/top-santri", async (req, res): Promise<void> => {
  const tipe = (req.query.tipe as string) || "prestasi";
  const validTipe = tipe === "pelanggaran" ? "pelanggaran" : "prestasi";

  const topRows = await db
    .select({
      id: santriTable.id,
      nis: santriTable.nis,
      nama: santriTable.nama,
      kelas: santriTable.kelas,
      asrama: santriTable.asrama,
      totalPoin: santriTable.totalPoin,
      jumlahKejadian: sql<number>`count(${riwayatPoinTable.id})`,
    })
    .from(santriTable)
    .leftJoin(
      riwayatPoinTable,
      and(eq(riwayatPoinTable.santriId, santriTable.id), eq(riwayatPoinTable.tipe, validTipe))
    )
    .groupBy(santriTable.id)
    .orderBy(desc(sql`count(${riwayatPoinTable.id})`))
    .limit(10);

  res.json(topRows.map((r) => ({
    id: r.id,
    nis: r.nis,
    nama: r.nama,
    kelas: r.kelas,
    asrama: r.asrama,
    totalPoin: r.totalPoin,
    jumlahKejadian: Number(r.jumlahKejadian),
  })));
});

router.get("/dashboard/grafik-bulanan", async (_req, res): Promise<void> => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  const startStr = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, "0")}-01`;

  const rows = await db
    .select({
      bulanTahun: sql<string>`to_char(to_date(${riwayatPoinTable.tanggal}, 'YYYY-MM-DD'), 'YYYY-MM')`,
      tipe: riwayatPoinTable.tipe,
      jumlah: sql<number>`count(*)`,
    })
    .from(riwayatPoinTable)
    .where(gte(riwayatPoinTable.tanggal, startStr))
    .groupBy(sql`to_char(to_date(${riwayatPoinTable.tanggal}, 'YYYY-MM-DD'), 'YYYY-MM')`, riwayatPoinTable.tipe)
    .orderBy(sql`to_char(to_date(${riwayatPoinTable.tanggal}, 'YYYY-MM-DD'), 'YYYY-MM')`);

  // Build month map
  const monthMap = new Map<string, { bulan: string; tahun: number; pelanggaran: number; prestasi: number }>();
  for (const row of rows) {
    const [tahunStr, bulanStr] = row.bulanTahun.split("-");
    const tahun = parseInt(tahunStr, 10);
    const bulanNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const bulan = bulanNames[parseInt(bulanStr, 10) - 1];
    const key = row.bulanTahun;
    if (!monthMap.has(key)) monthMap.set(key, { bulan, tahun, pelanggaran: 0, prestasi: 0 });
    const entry = monthMap.get(key)!;
    if (row.tipe === "pelanggaran") entry.pelanggaran = Number(row.jumlah);
    else entry.prestasi = Number(row.jumlah);
  }

  res.json([...monthMap.values()]);
});

export default router;
