# Duitku Integration Guide

## Setup Instructions

### 1. Backend Configuration

1. Deploy backend ke Vercel atau platform lain
2. Set environment variables di platform hosting:
   ```
   DUITKU_MERCHANT_CODE=your_merchant_code
   DUITKU_MERCHANT_KEY=your_merchant_key
   ```

### 2. Frontend Configuration

1. Update `js/config.js` dengan URL backend Anda:
   ```javascript
   BACKEND_URL: 'https://your-actual-backend-url.vercel.app'
   ```

2. Update `returnUrl` di backend untuk mengarah ke:
   ```
   https://hanzamas.tech/payment-status.html
   ```

### 3. Testing

#### Test dengan Sandbox Duitku:
1. Gunakan endpoint: `https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry`
2. Merchant code dan key dari akun sandbox Duitku
3. Test payment dengan berbagai metode pembayaran

#### Test Flow:
1. Klik tombol "Beli Sekarang" di Digital Store
2. JavaScript mengirim request ke backend `/api/create_payment`
3. Backend membuat signature dan request ke Duitku
4. Duitku mengembalikan `paymentUrl`
5. User diarahkan ke halaman pembayaran Duitku
6. Setelah pembayaran, user kembali ke `payment-status.html`
7. JavaScript membaca query parameter dan menampilkan status

### 4. Query Parameters

Payment status page akan menerima parameter dari Duitku:
- `resultCode`: '00' (sukses), '01' (gagal), atau lainnya (pending)
- `reference`: Nomor referensi transaksi
- `merchantOrderId`: ID order dari merchant
- `amount`: Jumlah pembayaran

### 5. Production Checklist

- [ ] Update BACKEND_URL di config.js
- [ ] Set environment variables di hosting
- [ ] Ganti endpoint Duitku ke production: `https://passport.duitku.com/webapi/api/merchant/v2/inquiry`
- [ ] Update returnUrl dan callbackUrl ke domain production
- [ ] Test semua flow pembayaran
- [ ] Test callback handling

### 6. Error Handling

Frontend akan menangani error berikut:
- Network errors (connection timeout)
- API errors (400, 401, 500, dll)
- Missing payment URL
- Invalid response format

### 7. Security Notes

- Signature validation dilakukan di backend
- Environment variables digunakan untuk kredensial
- CORS dikonfigurasi untuk domain yang diizinkan
- Frontend tidak pernah menyimpan merchant key
