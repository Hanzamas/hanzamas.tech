# Alur Pembelian dan Pengiriman Produk Digital

## 1. Alur Pembelian

### Langkah 1: Pemilihan Produk
- Pelanggan menelusuri produk di section Digital Store
- Pelanggan mempelajari deskripsi produk dan fitur-fiturnya

### Langkah 2: Proses Checkout
- Pelanggan mengklik tombol "Beli Sekarang" pada produk yang diinginkan
- Sistem mengirimkan data produk dan harga ke backend API
- Backend membuat signature dan request ke Duitku
- Pelanggan dialihkan ke halaman pembayaran Duitku

### Langkah 3: Pembayaran
- Pelanggan memilih metode pembayaran di platform Duitku
- Pelanggan menyelesaikan pembayaran sesuai instruksi
- Duitku memproses pembayaran dan mengirimkan callback ke backend
- Pelanggan dialihkan kembali ke website dengan status pembayaran

### Langkah 4: Konfirmasi Pembayaran
- Sistem menerima callback dari Duitku dan memperbarui status pembayaran
- Pelanggan melihat status pembayaran (berhasil/gagal/pending)
- Jika berhasil, sistem menyimpan informasi pesanan untuk diproses

## 2. Alur Pengiriman Produk

### Untuk Produk: Konsultasi IT 1 Jam

1. **Notifikasi Admin**
   - Admin menerima notifikasi email tentang pembayaran berhasil
   - Detail pesanan termasuk ID pesanan, produk, dan kontak pembeli

2. **Kontak Pelanggan**
   - Admin menghubungi pelanggan melalui email dalam 24 jam kerja
   - Admin dan pelanggan menjadwalkan sesi konsultasi

3. **Pelaksanaan Konsultasi**
   - Konsultasi dilakukan via Zoom/Google Meet/Discord sesuai kesepakatan
   - Durasi konsultasi 1 jam seperti dijanjikan dalam deskripsi produk

4. **Follow-up**
   - Admin mengirimkan rangkuman konsultasi via email
   - Pelanggan dapat mengajukan pertanyaan lanjutan dalam 7 hari

### Untuk Produk: Template Portofolio Premium

1. **Notifikasi Admin**
   - Admin menerima notifikasi email tentang pembayaran berhasil
   - Detail pesanan termasuk ID pesanan, produk, dan kontak pembeli

2. **Persiapan File**
   - Admin menyiapkan paket template premium
   - File dikompresi dan disimpan di cloud storage dengan password

3. **Pengiriman Produk**
   - Admin mengirimkan email dengan link download dan password
   - Email berisi petunjuk instalasi dan kustomisasi

4. **Support**
   - Dukungan teknis tersedia selama 30 hari
   - FAQ dan dokumentasi disertakan dalam paket

### Untuk Produk: Analisis Keamanan Web

1. **Notifikasi Admin**
   - Admin menerima notifikasi email tentang pembayaran berhasil
   - Detail pesanan termasuk ID pesanan, produk, dan kontak pembeli

2. **Kontak Pelanggan**
   - Admin menghubungi pelanggan untuk konfirmasi website yang akan dianalisis
   - Penjadwalan proses analisis dan estimasi waktu penyelesaian

3. **Proses Analisis**
   - Admin melakukan analisis keamanan sesuai deskripsi produk
   - Temuan dirangkum dalam laporan komprehensif

4. **Pengiriman Hasil**
   - Laporan dikirim dalam format PDF terenkripsi via email
   - Penjelasan temuan dan rekomendasi perbaikan disertakan

## 3. Sistem Notifikasi

### Notifikasi untuk Admin
- Notifikasi email otomatis saat pembayaran berhasil
- Dashboard admin untuk melacak pesanan baru dan status
- Reminder untuk pesanan yang belum diproses

### Notifikasi untuk Pelanggan
- Email konfirmasi pembayaran berhasil
- Email dengan detail pengiriman produk
- Email follow-up setelah pengiriman produk

## 4. Penanganan Masalah

### Pembayaran Gagal
- Sistem menampilkan halaman payment failure dengan detail error
- Petunjuk untuk mencoba pembayaran ulang
- Kontak support untuk bantuan

### Produk Tidak Diterima
- Pelanggan dapat melaporkan masalah melalui form kontak
- Verifikasi status pembayaran dan pengiriman
- Pengiriman ulang produk jika diperlukan

### Refund/Pembatalan
- Kebijakan refund dijelaskan dalam Terms of Service
- Proses refund melalui Duitku untuk pembayaran yang eligible
- Dokumentasi untuk kasus pembatalan

---

Dokumen ini menjelaskan alur lengkap dari pembelian hingga pengiriman produk digital di hanzamas.tech. Alur ini dirancang untuk memberikan pengalaman pelanggan yang transparan dan profesional.
