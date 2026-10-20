# 🥄 SENDOKecil App (EST 2026)

Aplikasi Web & Mobile Pemesanan Dessert, Manajemen Orderan, Cetak Struk Thermal, Cetak Sticker / Kartu Ucapan, dan Kalkulator HPP (Harga Pokok Penjualan) untuk **SENDOKecil**.

---

## ✨ Fitur Utama

### 1. 📱 Alur Pemesanan Customer (Mobile App Experience)
- **Katalog Dessert**: 4 varian inti (`Choco Oreo`, `Strawberry`, `Matcha`, `Cookies & Cream` @ Rp 15.000).
- **Pilihan Layanan**:
  - 🛵 **Antar (Delivery)**: Pilihan alamat dengan tombol cepat untuk lokasi populer (seperti *ASMEG*, *STMB*, *LAPANGAN 3U*, *CHERRY AMPLAS*, *KANTOR HANNOCHS*, dll.) serta catatan jam pengantaran (misal: "Jam 4 Sore", "Titip Kibo").
  - 🏪 **Ambil Sendiri (Pickup)**.
- **Pembayaran Fleksibel**:
  - Salin no. rekening BCA 1-tap (`7985566224 a/n ANGGI`).
  - QRIS dinamis scannable oleh semua e-wallet & m-Banking.
  - **Attach Bukti Bayar**: Mendukung **Paste langsung dari Clipboard** (Ctrl+V / Cmd+V / tombol "Paste Clipboard") atau **Pilih dari Galeri**.
- **Opsi Kartu Ucapan (Gift / Hadiah)**: To, From, dan pesan ucapan personal.
- **Pelacakan Langsung (Live Order Tracking)**: Status stepper dari pesanan masuk, verifikasi bukti bayar, proses pengemasan, hingga selesai.

### 2. 👑 Dashboard Owner & Analisis Finansial
- **Autentikasi Aman via `.env`**: Username dan password admin disuntikkan langsung via environment variables (`ADMIN_USERNAME` & `ADMIN_PASSWORD`).
- **Ringkasan Finansial Real-time**:
  - 💰 **Total Omset**: Akumulasi penjualan kotor.
  - 📉 **Total HPP**: Biaya modal bahan baku, kemasan cup, sendok kayu, seal sticker, & operasional.
  - 💵 **Penjualan Bersih (Net Profit)**: Laba bersih riil (`Omset - HPP`).
  - 📊 **Margin Laba Bersih %**.
  - 📦 **Total Pcs Terjual & Breakdown per Varian**.
- **Manajemen Pesanan**:
  - Filter pesanan: Semua, Menunggu Verifikasi Bukti, Lunas, Aktif, Antar vs Ambil.
  - Tombol 1-klik **"Approve"** untuk menyetujui pembayaran.
  - Klik thumbnail bukti bayar untuk memperbesar/inspeksi bukti transfer.
  - Tambah pesanan manual / offline (+ Order Manual).
  - Ekspor data pesanan ke Excel / CSV.

### 3. 🚚 Peta & Rute Delivery (Breakdown Destinasi Pengantaran)
- Pengelompokan pesanan otomatis berdasarkan **Destinasi / Titik Antar** (misal: ASMEG [3 order, 6 pcs], LAPANGAN 3U [3 order, 12 pcs], STMB [3 order, 4 pcs], dll.).
- Penanda pesanan **Prioritas / Waktu Khusus** (misal: "JAM 4 SORE").
- Tombol **"Salin Rekap Rute untuk Kurir (WA)"**: Menghasilkan teks manifest pengantaran rapi siap kirim ke grup kurir / WhatsApp.

### 4. 🧮 Kalkulator & Manajemen Resep HPP (Cost of Goods Sold)
- Input dan kelola komponen biaya:
  - Bahan Baku (Base Cake, Cream Mousseline, Topping Oreo/Strawberry/Matcha/Cookies).
  - Kemasan & Aksesoris (Cup Segel 200ml, Sendok Kayu Sendokecil, Sticker Segel).
  - Operasional (Listrik chiller, packaging bag).
- Perhitungan margin kotor dan laba bersih otomatis untuk setiap varian dessert dan pesanan.

### 5. 🖨️ Cetak Struk Thermal Kasir (Referensi `kasir`)
- Format thermal roll **58mm**, **80mm**, dan lembar **A4**.
- Tata letak struk kasir profesional dengan font monospaced, header SENDOKecil EST 2026, rincian varian, subtotal, status pembayaran, dan footer.
- Auto-print seamless menggunakan hidden iframe.

### 6. 🏷️ Cetak Sticker & Kartu Ucapan (Referensi `tovs-fleur`)
- Desain modular plain (siap diganti aset desain visual di masa mendatang):
  - **Label Pengiriman / Box Sticker**: Nama penerima, alamat, nomor telepon, catatan jam, ringkasan isi box, dan badge prioritas.
  - **Kartu Ucapan (Greeting Card)**: Garis potong (10 cm × 7 cm) `✂`, ornamen elegan, headline, To, Message, From.
  - Pilihan cetak **1 Lembar Tunggal** atau **4 Kartu per Lembar A4 (Grid 4)**.

---

## 🛠️ Instalasi & Menjalankan Proyek

### Prasyarat
- [Bun](https://bun.sh/) (atau Node.js v18+)

### 1. Masuk ke Direktori
```bash
cd /Users/sam/Documents/GitHub/sendokecil-app
```

### 2. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Isi kredensial akun admin Anda di file `.env`:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sendokecil2026
SESSION_SECRET=sendokecil_secret_key_est_2026_super_secure

# Informasi Bisnis
NEXT_PUBLIC_STORE_NAME=SENDOKecil
NEXT_PUBLIC_STORE_PHONE=081377493907
NEXT_PUBLIC_BCA_ACCOUNT=7985566224
NEXT_PUBLIC_BCA_NAME=ANGGI
```

### 3. Jalankan Server Development
```bash
bun run dev
```
Buka browser di `http://localhost:3000`.

### 4. Build untuk Produksi
```bash
bun run build
bun run start
```

---

## 📂 Struktur Direktori

```
sendokecil-app/
├── public/
│   ├── logo-banner.png      # Banner logo SENDOKecil EST 2026
│   ├── logo-square.png      # Square logo
│   ├── icon.png             # Favicon & app icon
│   └── uploads/             # Direktori penyimpanan bukti transfer
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/        # Login, logout, session verification
│   │   │   ├── orders/      # CRUD pesanan pelanggan
│   │   │   ├── products/    # Data varian & harga
│   │   │   ├── hpp/         # Kelola komponen HPP
│   │   │   └── upload/      # Endpoint upload gambar bukti bayar
│   │   ├── globals.css      # Styling Tailwind v4 & font Playfair Display
│   │   ├── layout.tsx       # Root layout & metadata
│   │   └── page.tsx         # Controller utama Customer vs Owner
│   ├── components/
│   │   ├── CustomerOrderView.tsx    # Antarmuka pemesanan customer
│   │   ├── AdminDashboardView.tsx   # Dashboard keuangan & pesanan owner
│   │   ├── DeliveryRoutesView.tsx   # Peta & rekap rute delivery
│   │   ├── HppManagerModal.tsx      # Manajemen HPP & resep
│   │   ├── ThermalReceiptModal.tsx  # Modal cetak struk kasir
│   │   ├── StickerPrintModal.tsx    # Modal cetak label & kartu ucapan
│   │   ├── ProofPreviewModal.tsx    # Zoom preview bukti pembayaran
│   │   ├── NewOrderModal.tsx        # Form order manual
│   │   └── LoginModal.tsx           # Form masuk admin
│   ├── data/
│   │   └── seedOrders.ts    # 55 order riil hasil impor dari ORDERAN SENDOKECIL.xlsx
│   ├── lib/
│   │   ├── constants.ts     # Konfigurasi toko, produk, HPP bawaan
│   │   ├── hpp.ts           # Logika perhitungan HPP, laba, margin
│   │   ├── serverStorage.ts # Penyimpanan database file JSON lokal
│   │   ├── thermalPrint.ts  # Mesin cetak struk kasir 58mm/80mm/A4
│   │   └── stickerPrint.ts  # Mesin cetak sticker label & kartu ucapan
│   └── types/
│       └── index.ts         # TypeScript interfaces & types
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 📜 Lisensi
Hak Cipta © 2026 SENDOKecil. Dilindungi Undang-Undang.
