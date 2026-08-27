# Deploy QIPOS ke Linux

QIPOS terdiri dari dua bagian:

- `artifacts/sipos/dist/public` — frontend React static
- `artifacts/api-server/dist/index.mjs` — API Express yang membutuhkan PostgreSQL

Konfigurasi contoh di folder ini menggunakan satu domain: Nginx melayani frontend
dan meneruskan `/api` ke API di port `8080`.

## Prasyarat server

- Linux dengan akses sudo
- Node.js 20.19+ (Node.js 24 direkomendasikan)
- pnpm 10+
- PostgreSQL 14+
- Nginx

## 1. Siapkan source dan dependensi

```bash
sudo mkdir -p /var/www
sudo git clone <URL_REPOSITORY> /var/www/qipos
sudo chown -R "$USER":"$USER" /var/www/qipos
cd /var/www/qipos
corepack enable
pnpm install --frozen-lockfile
```

Jika server tidak memiliki repository Git, salin seluruh project termasuk
`pnpm-lock.yaml`, `artifacts/`, `lib/`, `scripts/`, `package.json`, dan file
konfigurasi workspace.

## 2. Siapkan PostgreSQL

Buat database dan user, lalu isi `DATABASE_URL` dengan nilai sebenarnya.

```sql
CREATE USER qipos_user WITH PASSWORD 'ganti-password-kuat';
CREATE DATABASE qipos OWNER qipos_user;
```

Buat environment API:

```bash
sudo mkdir -p /etc/qipos
sudo cp deploy/qipos-api.env.example /etc/qipos/qipos-api.env
sudo chmod 600 /etc/qipos/qipos-api.env
sudoedit /etc/qipos/qipos-api.env
```

Wajib diisi:

- `DATABASE_URL`
- `SESSION_SECRET` — hasil `openssl rand -hex 32`

`CORS_ORIGIN` boleh kosong jika frontend dan API memakai domain yang sama.
Jika memakai domain frontend terpisah, isi URL frontend tanpa slash terakhir.

## 3. Buat tabel dan data awal

Jalankan backup database terlebih dahulu jika database sudah berisi data.

```bash
cd /var/www/qipos
set -a
. /etc/qipos/qipos-api.env
set +a
pnpm run db:push
pnpm run db:seed
```

Seed bersifat idempotent: akun dan master poin yang sudah ada tidak ditimpa.
Akun awal yang dibuat hanya jika belum ada:

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `adminpassword` |
| Sayyid | `sayyid` | `sayyidpassword` |
| Wali | `wali_santri1` | `walipassword` |

Segera ubah password bawaan setelah login pertama.

## 4. Build production

```bash
cd /var/www/qipos
./deploy/build.sh
```

Script ini menggunakan `pnpm install --frozen-lockfile`, menjalankan typecheck,
lalu membuat frontend dan API production. `BASE_PATH` default `/`. Jika aplikasi
diletakkan di subpath, build dengan `BASE_PATH=/qipos/` dan sesuaikan Nginx.

## 5. Jalankan API sebagai service

Buat user service lalu pasang template systemd:

```bash
sudo useradd --system --home /var/www/qipos --shell /usr/sbin/nologin qipos
sudo chown -R qipos:qipos /var/www/qipos
sudo cp deploy/qipos-api.service.example /etc/systemd/system/qipos-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now qipos-api
sudo systemctl status qipos-api
```

Jika lokasi Node.js berbeda dari `/usr/bin/node`, sesuaikan `ExecStart`.
Uji API:

```bash
curl http://127.0.0.1:8080/api/healthz
```

Respons yang benar adalah `{"status":"ok"}`.

## 6. Pasang Nginx dan HTTPS

```bash
sudo cp deploy/qipos.nginx.example /etc/nginx/sites-available/qipos
sudo sed -i 's/qipos.example.com/domain-anda.tld/g' /etc/nginx/sites-available/qipos
sudo ln -s /etc/nginx/sites-available/qipos /etc/nginx/sites-enabled/qipos
sudo nginx -t
sudo systemctl reload nginx
```

Setelah DNS mengarah ke server, aktifkan HTTPS, misalnya dengan Certbot:

```bash
sudo certbot --nginx -d domain-anda.tld
```

Konfigurasi API sudah meneruskan `X-Forwarded-Proto`; Express juga sudah
mempercayai reverse proxy sehingga cookie session HTTPS bekerja.

## Update versi berikutnya

```bash
cd /var/www/qipos
git pull
./deploy/build.sh
sudo systemctl restart qipos-api
sudo systemctl reload nginx
```

Jalankan `pnpm run db:push` hanya ketika ada perubahan schema database.
Simpan salinan `/etc/qipos/qipos-api.env` dan backup PostgreSQL di luar folder
web.