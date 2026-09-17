# 🎲 Game Edukasi Ular Tangga Matematika & Kuis Interaktif

Aplikasi web interaktif permainan Ular Tangga edukatif dengan bank soal kuis matematika, materi pelajaran berjenjang (Kelas 1–6 SD), sistem medali prestasi siswa, serta Panel Guru & Admin dengan autentikasi Google dan sinkronisasi Cloud Firestore.

---

## 🚀 Panduan Deploy ke GitHub Pages

Proyek ini telah dikonfigurasi agar dapat langsung di-deploy ke **GitHub Pages** secara otomatis menggunakan **GitHub Actions**.

### Langkah 1: Buat Repository di GitHub & Push Kode
1. Buat repository baru di GitHub (misal: `ular-tangga-edukasi`).
2. Di terminal komputer Anda, inisialisasi git dan push seluruh file proyek:
   ```bash
   git init
   git add .
   git commit -m "Initial commit game ular tangga"
   git branch -M main
   git remote add origin https://github.com/<username-github>/<nama-repo>.git
   git push -u origin main
   ```

### Langkah 2: Aktifkan GitHub Pages di Pengaturan Repository
1. Buka halaman repository Anda di GitHub.
2. Klik tab **Settings** (Pengaturan).
3. Di menu sebelah kiri, pilih **Pages** (di bagian *Code and automation*).
4. Di bawah bagian **Build and deployment**:
   - Pada pilihan **Source**, ubah dari `Deploy from a branch` menjadi **`GitHub Actions`**.
5. Workflow `.github/workflows/deploy.yml` yang sudah disediakan akan otomatis berjalan setiap kali Anda melakukan `git push` ke branch `main`!
6. Setelah build selesai (sekitar 1–2 menit), link website Anda akan aktif di:
   `https://<username-github>.github.io/<nama-repo>/`

---

## 🔑 Konfigurasi Tambahan: Login Google di GitHub Pages

Jika Anda menggunakan fitur **Login Akun Google untuk Guru/Admin**, Anda perlu mendaftarkan domain GitHub Pages Anda ke Firebase:

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pilih proyek Firebase Anda: `xanthic-dialect-hq6d2`.
3. Masuk ke menu **Build** > **Authentication** > tab **Settings** > **Authorized domains** (Domain yang diizinkan).
4. Klik **Add domain** lalu masukkan domain GitHub Anda:
   ```text
   <username-github>.github.io
   ```
5. Simpan. Sekarang fitur login Google untuk Guru & Admin dapat digunakan langsung dari website GitHub Pages Anda!

---

## 💻 Menjalankan di Komputer Lokal (Local Development)

1. **Install dependensi:**
   ```bash
   npm install
   ```

2. **Jalankan server development:**
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:3000`.

3. **Build produksi:**
   ```bash
   npm run build
   ```
   File hasil build akan berada di direktori `dist/` dengan path relatif (`./`) sehingga kompatibel di server statis mana pun.

4. **Pratinjau hasil build:**
   ```bash
   npm run preview
   ```

---

## 🛠️ Fitur Utama
- **Mode Bermain**: Single Player (vs Bot Pintar) & Multiplayer Lokal (2–4 pemain).
- **Kurikulum Matematika Lengkap**: Jenjang Kelas 1 sampai 6 SD dengan tingkat kesulitan Mudah, Sedang, dan Sulit.
- **Papan Interaktif**: Dilengkapi animasi bidak halus, suara efek interaktif, kotak tangga, kotak ular, serta kotak materi edukasi.
- **Panel Guru & Admin**:
  - Login khusus menggunakan Akun Google.
  - Tambah, edit, dan hapus materi serta bank soal.
  - Kustomisasi posisi ular, tangga, dan kotak materi di papan 100 kotak.
  - Kelola akun siswa, pantau riwayat bermain, skor, serta akurasi jawaban per siswa.
- **Cloud Firestore Sync**: Sinkronisasi data kurikulum terisolasi per akun guru secara real-time.
