# Spesifikasi Teknikal — Dashboard Tempahan ITU

---

## 1. Dual-Mode `callApi()`

`callApi(action, payload)` dalam `index.html` beroperasi dalam dua mod bergantung pada context semasa:

```javascript
var isGas = !!(window.google && window.google.script && window.google.script.run);
```

### Mod 1: GAS Context (`Index.html` diserve oleh GAS)
- `google.script.run` digunakan — komunikasi terus dalam sandbox GAS
- Tiada isu CORS kerana request tidak merentas domain

### Mod 2: GitHub Pages Context (`index.html` di `stpuitu.github.io/admin/`)
- **Semua actions** → JSONP via `<script>` tag (lihat bahagian 2 dan 10)

---

## 2. JSONP — Penyelesaian CORS

### Masalah
GAS web app (`/exec` URL) mengembalikan CORS header yang inconsistent — kadang-kadang benarkan cross-origin, kadang-kadang tidak. `fetch()` dari domain GitHub Pages akan gagal secara rawak.

### Penyelesaian
Untuk semua GET actions, hantar request melalui `<script src="">` tag. Browser tidak enforce CORS untuk permintaan skrip.

### Cara ia berfungsi

**Client (`index.html`) — buat request:**
```javascript
var cbName = 'jsonp_cb_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
var script = document.createElement('script');

// Daftar callback global sementara
window[cbName] = function(data) {
  clearTimeout(timeoutId);
  cleanup(); // buang callback dan <script> tag
  resolve(data);
};

// Request dengan ?action dan ?callback
script.src = EXEC_URL + '?action=getAllData&callback=' + cbName;
document.head.appendChild(script);
```

**Server (`Code.js`) — balas dalam format JSONP:**
```javascript
function doGet(e) {
  var action   = e.parameter.action;
  var callback = e.parameter.callback || '';

  // ... jalankan fungsi, dapat result sebagai JSON string ...

  var output = callback ? callback + '(' + result + ');' : result;
  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
```

Browser jalankan skrip yang diterima → callback global dipanggil dengan data → Promise resolve.

### GET actions yang guna JSONP:
| Action | Keterangan |
|--------|------------|
| `getAllData` | Ambil semua rekod tempahan dari 6 Sheet |
| `getAllFeedback` | Ambil semua maklumbalas dari 3 tab |
| `checkLogin` | Semak username/password (dihantar sebagai query param) |
| `exportCsv` | Ambil data CSV (filter dihantar sebagai JSON ter-encode) |

### Timeout dan cleanup:
- Timeout 30 saat — jika GAS tidak balas, Promise di-reject
- Selepas callback dipanggil (atau timeout/error), callback global dibuang (`delete window[cbName]`) dan `<script>` tag dikeluarkan dari DOM

---

## 3. `doGet(e)` Routing dalam `Code.js`

```
Incoming GET request ke EXEC_URL
│
├── Ada ?action parameter
│   ├── Jalankan fungsi API berkaitan
│   └── Balas: callback(JSON_data);   ← format JSONP
│
└── Tiada ?action parameter
    └── Serve Index.html              ← dashboard GAS biasa
```

Semua GET action sokong parameter `?callback=` untuk JSONP. Jika `?callback=` tiada, balas JSON sahaja (untuk debug/testing manual).

---

## 4. Service Worker (`sw.js`)

**CACHE_NAME**: `admin-cache-v1`

Nama cache unik dipilih untuk elak clash dengan Service Worker repo lain (contoh: repo `tempah` mungkin guna nama generic). Service Worker hanya aktif dalam scope `/admin/`.

### Strategi fetch:

| Request URL | Strategi | Sebab |
|-------------|----------|-------|
| `script.google.com` | Network-first | Data mestilah terkini |
| `script.googleusercontent.com` | Network-first | Sama — GAS serving URL |
| Semua lain (shell files) | Cache-first, fallback network | Sokong offline access |

Jika network gagal untuk GAS request semasa offline, Service Worker balas dengan:
```json
{ "ok": false, "error": "offline" }
```

### Install event:
Cache awal (pre-cache) fail-fail shell:
- `./`
- `./index.html`
- `./manifest.json`
- `./icon-192.png`
- `./icon-512.png`

### Activate event:
Buang semua cache lama (nama berbeza dari `admin-cache-v1`) dan `claim()` semua client serta-merta tanpa perlu reload.

---

## 5. ID Rekod (`_id`)

Setiap rekod tempahan mempunyai ID unik yang dibina oleh `getAllData()`:

```
{spreadsheet_id}__{sheet_gid}__{row_number}
```

Contoh: `1eiHYWxtkdOrf9FU__970969483__5`

ID ini digunakan untuk operasi `updateStatus` dan `updateStatusBatch` — backend parse ID untuk locate spreadsheet, sheet (by GID), dan row yang betul.

---

## 6. Header-Based Column Mapping

`getAllData()` dan `getAllFeedback()` dalam `Code.js` tidak bergantung pada index kolum (posisi tetap). Sebaliknya, nilai dimap mengikut **nama header** (case-insensitive, trim whitespace).

Ini membolehkan kolum dalam Google Sheet disusun semula tanpa merosakkan dashboard.

Kolum yang diuruskan khas (status, nota, audit) diasingkan dari kolum data biasa:

| Kolum dalam Sheet | Disimpan sebagai |
|-------------------|------------------|
| `STATUS TEMPAHAN` | `_status` |
| `NOTA ADMIN` | `_notes` |
| `DIKEMASKINI PADA` | `_updatedAt` |
| `DIKEMASKINI OLEH` | `_updatedBy` |

Kolum-kolum ini dicipta secara automatik dalam Sheet jika belum wujud (`getOrCreateColumn()`).

---

## 7. PWA Manifest

```json
{
  "name": "Dashboard Tempahan STPU ITU",
  "short_name": "STPU ITU",
  "start_url": "./index.html",
  "scope": "./",
  "display": "standalone",
  "theme_color": "#135c2d",
  "background_color": "#f0f4f1"
}
```

`scope: "./"` bermakna PWA hanya aktif dalam path `/admin/` — tidak campur dengan PWA lain di domain yang sama.

---

## 8. Session & Authentication

- Login disimpan dalam `sessionStorage` (bukan `localStorage`) — hilang automatik bila tab/browser ditutup
- Storage key: `itu_dashboard_auth` = `'ok'`
- `checkLogin()` dalam `Code.js` semak `ADMIN_CREDENTIALS` array — tukar terus dalam array jika perlu ubah password
- Email notifikasi (bila kemaskini status individu) hanya dihantar jika kolum `Email Address` wujud dalam Sheet sumber dan mengandungi nilai yang sah

---

## 9. Responsive Layout

Dashboard menggunakan breakpoint `max-width: 860px`:
- Desktop: sidebar tetap di kiri (220px), kandungan utama ada `margin-left: 220px`
- Mobile: sidebar tersembunyi (`transform: translateX(-100%)`), hamburger button (☰) muncul di topbar untuk toggle sidebar dengan overlay

---

## 10. GSAP Animations

Dashboard menggunakan GSAP 3.12.5 (CDN) untuk animasi:

- **Stats counter**: nombor animate 0 → nilai sebenar (1.2s, `power2.out`)
- **Stat cards stagger**: fade+scale masuk satu-satu (0.07s delay antara kad)
- **Page transition**: fade+slide (`y:12 → 0`, 0.28s) bila tukar tab
- **Modal**: slide up + scale dengan `back.out` bounce
- **Toast**: bounce masuk dari bawah, slide keluar elegan
- **Sidebar mobile**: CSS transition handle slide, overlay guna `opacity` + `pointer-events`

---

## 11. Semua Actions Guna JSONP

**SEMUA actions — GET dan write — guna JSONP.** Tiada `fetch()` POST langsung dari GitHub Pages context.

| Action | Jenis | Cara hantar params |
|--------|-------|--------------------|
| `getAllData` | Read | — |
| `getAllFeedback` | Read | — |
| `checkLogin` | Read | `?username=&password=` |
| `exportCsv` | Read | `?filter=<JSON encoded>` |
| `updateStatus` | Write | `?id=&status=&notes=` |
| `updateStatusBatch` | Write | `?ids=<JSON encoded>&status=&notes=` |

**Sebab**: GAS CORS inconsistent untuk `fetch()` dari domain lain, walaupun untuk GET request. JSONP via `<script>` tag tidak tertakluk kepada CORS sepenuhnya, menjadikannya lebih reliable untuk semua jenis request dari GitHub Pages.
