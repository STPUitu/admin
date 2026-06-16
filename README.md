# Dashboard Tempahan — Institut Teknologi Unggas (ITU)

Dashboard admin untuk menguruskan tempahan produk unggas bagi Unit Penetasan, ITU.

**URL**: https://stpuitu.github.io/admin/

---

## Overview

Sistem ini terdiri dari dua bahagian:

1. **GitHub Pages** (`stpuitu.github.io/admin/`) — menjadi PWA shell yang boleh dipasang di skrin utama
2. **Google Apps Script** — backend yang membaca data dari Google Sheets dan menjawab API request

Pengguna admin membuka GitHub Pages, login, dan dashboard berkomunikasi dengan GAS backend untuk ambil/kemaskini data.

---

## Arkitektur

```
GitHub Pages (stpuitu.github.io/admin/)
├── index.html    ← PWA shell (i kecil)
├── sw.js         ← Service Worker
├── manifest.json ← PWA manifest
├── icon-192.png
└── icon-512.png

GAS Project (tempahanitu@gmail.com)
├── Code.js       ← Backend: doGet(e) routing + semua fungsi API
└── Index.html    ← Dashboard template (I besar)
```

Apabila `index.html` di GitHub Pages perlu data, ia memanggil GAS Web App URL (`EXEC_URL`) dengan parameter `?action=...&callback=...` menggunakan teknik JSONP.

---

## Fail Utama

### `index.html` (i kecil) — GitHub Pages
PWA shell yang diakses melalui `stpuitu.github.io/admin/`. Mengandungi:
- Keseluruhan UI dashboard (sidebar, topbar hamburger, semua page)
- Fungsi `callApi()` dalam mod dual: guna `google.script.run` bila dalam GAS context, guna JSONP bila dalam GitHub Pages context
- Pendaftaran `sw.js` untuk keupayaan PWA

### `Index.html` (I besar) — GAS Project
Template dashboard yang diserve oleh `doGet()` apabila tiada parameter `?action`. **Jangan sentuh** kecuali perlu ubah struktur HTML yang GAS render secara langsung.

### `Code.js` — GAS Project
Backend utama. `doGet(e)` melakukan routing:
- Ada `?action` → jalankan fungsi API, balas dalam format JSONP
- Tiada `?action` → serve `Index.html`

Fungsi API yang disokong: `getAllData`, `getAllFeedback`, `checkLogin`, `exportToCsv`, `updateStatus`, `updateStatusBatch`. Semua GET action sokong parameter `?callback=` untuk JSONP.

### `sw.js` — GitHub Pages
Service Worker dengan `CACHE_NAME = 'admin-cache-v1'`. Nama unik ini dipilih supaya tidak clash dengan Service Worker repo lain (contoh: repo tempah) yang mungkin guna nama berbeza.

Strategi cache:
- Request ke `script.google.com` / `script.googleusercontent.com` → **network-first**, fallback JSON error bila offline
- Semua fail shell lain → **cache-first**, kemudian network

### `manifest.json` — GitHub Pages
PWA manifest. `name: "Dashboard Tempahan STPU ITU"`, scope terhad kepada `./` (path `/admin/`).

---

## Rule: `index.html` (i kecil) vs `Index.html` (I besar)

| | `index.html` | `Index.html` |
|--|--------------|--------------|
| **Huruf** | i kecil | I besar |
| **Lokasi** | GitHub Pages repo | GAS project |
| **Fungsi** | PWA shell | Dashboard template GAS |
| **Edit bila** | Ubah UI, callApi, sw.js | Ubah struktur HTML dalam GAS |
| **Deploy ke** | `git push origin main` | Deploy baru dalam GAS |
| **LARANGAN** | Jangan letak dalam GAS | Jangan rename — `doGet()` rujuk nama ini |

GitHub **case-sensitive** — kedua-dua fail berbeza dan boleh wujud serentak. Jangan keliru.

---

## Cara Deploy

### Kemaskini GitHub Pages (`index.html`, `sw.js`, `manifest.json`)

```bash
git add index.html sw.js manifest.json
git commit -m "keterangan perubahan"
git push origin main
```

GitHub Pages auto-update dalam masa ~1-2 minit.

### Kemaskini GAS Backend (`Code.js`)

**WAJIB buat New Version setiap kali edit `Code.js`** — tanpanya, URL lama kekal guna kod lama.

1. Edit `Code.js` dalam GAS editor
2. Klik **Deploy → Manage deployments**
3. Klik ikon edit ✏️ pada deployment semasa
4. Tukar "Version" kepada **New version**
5. Klik **Deploy** — URL `/exec` kekal sama, tiada perubahan diperlukan pada `index.html`

Jika tambah scope baharu (contoh: MailApp), jalankan fungsi berkaitan dalam GAS editor dahulu untuk trigger authorization sebelum deploy.

---

## Cara Install PWA

### Desktop (Chrome / Edge)
1. Buka **https://stpuitu.github.io/admin/**
2. Klik ikon install (⊕) di address bar → "Install"
3. Dashboard buka dalam tetingkap standalone

### Android (Chrome)
1. Buka **https://stpuitu.github.io/admin/**
2. Menu (⋮) → "Add to Home screen"
3. Icon Admin STPU terpapar di home screen

### iPhone / iPad (Safari)
1. Buka **https://stpuitu.github.io/admin/** dalam Safari
2. Butang Share (□↑) → "Add to Home Screen"
3. Icon Admin STPU terpapar di home screen

> **Nota iPad**: Safari pada iPad menyamar sebagai desktop user-agent. Tetap guna langkah Safari di atas — jangan ikut langkah Chrome.

---

## Sumber Data

Dashboard membaca dari 6 Google Sheet tempahan dan 1 Google Sheet maklumbalas (3 tab). Rujuk array `SOURCES` dan `FEEDBACK_SOURCES` dalam `Code.js`.

**Aliran status tempahan:**
`Baru` → `Disahkan` → `Sedang Diproses` → `Siap Kutip` → `Selesai` / `Dibatalkan` / `Tak Ambil`

Email notifikasi dihantar ke pembeli secara automatik (BM + EN) setiap kali status dikemaskini secara individu. Bulk update tidak hantar email.

---

## Maklumat Projek

- **GAS Akaun**: tempahanitu@gmail.com
- **GitHub Repo**: https://github.com/STPUitu/admin
- **Login Admin**: lihat `ADMIN_CREDENTIALS` dalam `Code.js`
