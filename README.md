Buat/update fail README.md dalam folder D:\\OneDrive\\Documents-assets\\STPU Admin dengan kandungan berikut:



\# Dashboard Tempahan — Institut Teknologi Unggas (ITU)



Sistem dashboard admin untuk menguruskan tempahan produk unggas (anak puyuh, telur bernas, anak ayam kampung) bagi Unit Penetasan, ITU.



\## Maklumat Projek



\- \*\*Platform\*\*: Google Apps Script (Web App)

\- \*\*GAS Script ID\*\*: `1AGXp6PMdexlGNW9b7CZv1-Xf6HzNUuILaK5qZjO78LE1IoHzn-VRgk37`

\- \*\*Akaun GAS\*\*: tempahanitu@gmail.com

\- \*\*Repo GitHub\*\*: https://github.com/STPUitu/stpu



\## Struktur Fail



\- `Code.js` — Backend (Google Apps Script): logic data, status, email notification

\- `Index.html` — Frontend dashboard (HTML/CSS/JS, Chart.js)

\- `appsscript.json` — Manifest konfigurasi GAS

\- `.clasp.json` — Konfigurasi clasp (link ke GAS project)



\## Ciri-ciri Utama



\- \*\*Dashboard\*\*: ringkasan statistik tempahan (jumlah, status, bulan ini)

\- \*\*Senarai Tempahan\*\*: senarai, carian, filter (sumber/status/bulan/tahun), bulk update status

\- \*\*Statistik \& Graf\*\*: graf bulanan, agihan sumber, agihan status (Chart.js)

\- \*\*Maklumbalas Pembeli\*\*: paparan maklumbalas/rating dari borang Google Form

\- \*\*Eksport Data\*\*: eksport CSV mengikut filter

\- \*\*Notifikasi Email\*\*: email automatik (Bahasa Melayu + English) dihantar ke pembeli bila admin kemaskini status tempahan



\## Sumber Data (Google Sheets)



Dashboard menarik data dari 6 Google Sheet (borang tempahan) dan 1 Google Sheet (maklumbalas, 3 tab) — rujuk array `SOURCES` dan `FEEDBACK\_SOURCES` dalam `Code.js`.



\## Status Tempahan



`Baru` → `Disahkan` → `Sedang Diproses` → `Siap Kutip` → `Selesai` / `Dibatalkan` / `Tak Ambil`



Setiap kali status dikemaskini (individu, bukan bulk), email notifikasi dihantar automatik ke alamat email pembeli (jika kolum "Email Address" wujud dalam sheet sumber).



\## Workflow Development



```bash

\# Pull perubahan dari GAS (online editor) ke local

clasp pull



\# Push perubahan dari local ke GAS

clasp push



\# Bukak GAS editor

clasp open



\# Sync ke GitHub

git add .

git commit -m "mesej"

git push

```



\## Penting: Selepas Edit Code.js (terutama jika tambah API baru seperti MailApp)



1\. Push/save perubahan ke GAS

2\. Run fungsi berkaitan dalam GAS editor untuk trigger authorization (kalau perlu scope baru)

3\. \*\*Deploy → Manage deployments → Edit (✏️) → New version → Deploy\*\* — supaya web app guna kod terkini (URL kekal sama)



\## Login Admin



Username/password admin disimpan dalam `ADMIN\_CREDENTIALS` di `Code.js` — ubah terus dalam kod jika perlu tukar.



## PWA / Install sebagai App

Dashboard boleh dipasang ("install") sebagai app di desktop dan mobile.

### Desktop (PC)
- URL pendek: https://stpuitu.github.io/stpu/
- Page ini memuatkan dashboard sebenar dalam iframe — URL kekal pendek walaupun navigasi dalam dashboard
- Boleh di-bookmark, atau "Install app" dari menu browser (Chrome: ikon install di address bar)

### Mobile (Android/iPhone)
- Bukak https://stpuitu.github.io/stpu/ — akan auto-redirect ke URL GAS sebenar (sebab iframe GAS sering diblock di mobile browser)
- "Add to Home Screen" dari URL GAS tersebut (selepas redirect):
  - **Chrome Android**: menu (⋮) → "Add to Home screen"
  - **Safari iPhone**: Share → "Add to Home Screen"
- Icon STPU akan terpapar di home screen (icon link ditambah dalam `<head>` Index.html, merujuk ke https://stpuitu.github.io/stpu/icon-192.png)

### Fail PWA (di GitHub Pages, root repo)
- `index.html` — launcher page (iframe untuk desktop, redirect untuk mobile)
- `manifest.json` — PWA manifest
- `icon-192.png`, `icon-512.png` — icon STPU untuk PWA/Add to Home Screen

**PENTING**: `index.html` (huruf kecil, PWA launcher) BERBEZA dari `Index.html` (huruf besar, dashboard GAS sebenar). Jangan keliru bila edit di GitHub — GitHub case-sensitive, kedua-dua fail wujud serentak.



\---

Lepas siap update README.md, run:

git add README.md

git commit -m "Update README with project documentation"

git push

