# AlumniConnect

Website full-stack untuk tugas sekolah SMK Muhammadiyah 1 Sumberrejo.
Frontend dan backend dipisahkan agar mudah dikembangkan dan di-deploy ke VPS.

## Fitur demo
- Feed sosial media
- Like, komentar, share, simpan
- Data alumni + filter
- Jurusan: TKJ, TKR, TBSM, Farmasi
- Angkatan
- Karier
- Alumni Inspiratif
- Event/Reuni
- AlumniConnect AI berbasis data database
- Login/register API
- Admin API
- Statistik
- SQLite sebagai database awal (mudah dijalankan tanpa instalasi PostgreSQL)

## 1. Persyaratan
- Node.js 18+ (disarankan Node.js 20 LTS)
- npm

## 2. Jalankan backend
```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```
Backend: http://localhost:4000

## 3. Jalankan frontend
Buka terminal baru:
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

## Akun demo
Admin:
- email: admin@alumniconnect.local
- password: admin123

Alumni:
- email: ahmad@alumniconnect.local
- password: demo123

## Catatan
Frontend demo saat ini menyajikan UI lengkap dan data contoh lokal agar bisa langsung dipresentasikan. Backend menyediakan REST API untuk autentikasi, alumni, postingan, like, save, komentar, follow, event, statistik, admin, dan AI berbasis database. Untuk produksi, sambungkan state frontend ke API dan ganti data demo dengan data resmi sekolah.

## Deployment VPS
1. Install Node.js 20 LTS.
2. Upload folder project.
3. Jalankan `npm install` pada backend dan frontend.
4. Jalankan `npm run seed` di backend sekali.
5. Build frontend dengan `npm run build`.
6. Jalankan backend memakai PM2:
```bash
cd backend
pm2 start src/server.js --name alumniconnect-api
pm2 save
```
7. Sajikan folder `frontend/dist` dengan Nginx.
8. Proxy `/api` ke `http://127.0.0.1:4000`.
9. Pasang domain dan HTTPS menggunakan Certbot.

## Struktur
alumniconnect/
- frontend/
- backend/
- README.md
- .gitignore
