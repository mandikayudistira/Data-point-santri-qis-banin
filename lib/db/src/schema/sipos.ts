import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "sayyid", "wali"]);
export const statusSantriEnum = pgEnum("status_santri", ["aktif", "nonaktif", "alumni"]);
export const tipePoinEnum = pgEnum("tipe_poin", ["pelanggaran", "prestasi"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("sayyid"),
  nama: text("nama").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const santriTable = pgTable("santri", {
  id: serial("id").primaryKey(),
  nis: text("nis").notNull().unique(),
  nama: text("nama").notNull(),
  ttl: text("ttl"),
  jenisKelamin: text("jenis_kelamin"),
  kelas: text("kelas").notNull(),
  kamar: text("kamar"),
  asrama: text("asrama").notNull(),
  namaOrtu: text("nama_ortu"),
  noHp: text("no_hp"),
  status: statusSantriEnum("status").notNull().default("aktif"),
  totalPoin: integer("total_poin").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waliSantriTable = pgTable("wali_santri", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  santriId: integer("santri_id").notNull().references(() => santriTable.id, { onDelete: "cascade" }),
});

export const masterPelanggaranTable = pgTable("master_pelanggaran", {
  id: serial("id").primaryKey(),
  kode: text("kode").notNull().unique(),
  nama: text("nama").notNull(),
  poin: integer("poin").notNull(),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const masterPrestasiTable = pgTable("master_prestasi", {
  id: serial("id").primaryKey(),
  kode: text("kode").notNull().unique(),
  nama: text("nama").notNull(),
  poin: integer("poin").notNull(),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const riwayatPoinTable = pgTable("riwayat_poin", {
  id: serial("id").primaryKey(),
  santriId: integer("santri_id").notNull().references(() => santriTable.id, { onDelete: "cascade" }),
  tipe: tipePoinEnum("tipe").notNull(),
  masterId: integer("master_id"),
  poin: integer("poin").notNull(),
  keterangan: text("keterangan"),
  tanggal: text("tanggal").notNull(),
  createdBy: integer("created_by").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogsTable = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  aksi: text("aksi").notNull(),
  detail: text("detail").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
