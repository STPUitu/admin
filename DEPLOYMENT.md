# Panduan Deploy — Dashboard Tempahan ITU

---

## A. Kemaskini GAS Backend (`Code.js`)

> **WAJIB buat New Version setiap kali edit `Code.js`** — tanpanya, deployment lama kekal guna kod lama walaupun selepas `clasp push`.

### Langkah-langkah:

1. Edit `Code.js` dalam GAS editor (atau local, kemudian sync manual)
2. Buka GAS project: https://script.google.com → buka project
3. Klik **Deploy → Manage deployments**
4. Klik ikon edit ✏️ pada deployment semasa (bukan cipta deployment baru)
5. Pada dropdown "Version": pilih **New version**
6. Klik **Deploy**

URL `/exec` kekal sama selepas deploy — tiada perubahan diperlukan pada `EXEC_URL` dalam `index.html`.

### Bila wajib New Version:
- Selepas sebarang edit pada `Code.js`
- Selepas tambah/ubah fungsi yang dipanggil oleh `callApi()`
- Selepas tambah scope GAS baharu (contoh: MailApp, DriveApp)

### Jika tambah scope baharu:
Scope baharu memerlukan authorization sebelum boleh deploy:
1. Dalam GAS editor, jalankan mana-mana fungsi yang guna scope baru (contoh: jalankan `sendStatusEmail`)
2. GAS akan minta "Review Permissions" — klik dan benarkan dengan akaun `tempahanitu@gmail.com`
3. Baru buat New Version dan Deploy

---

## B. Kemaskini GitHub Pages (`index.html`, `sw.js`, `manifest.json`)

Fail-fail ini diserve terus oleh GitHub Pages dari branch `main`. Tiada build step diperlukan.

### Langkah-langkah:

```bash
# Stage fail yang diubah sahaja (jangan guna git add .)
git add index.html
# atau
git add sw.js manifest.json

git commit -m "keterangan perubahan"
git push origin main
```

GitHub Pages auto-update dalam masa ~1-2 minit selepas push.

### Jika `EXEC_URL` perlu ditukar:
Situasi ini berlaku hanya jika GAS deployment dipadam dan deployment baru dicipta (URL berubah). Kemaskini dalam `index.html`:

```javascript
const EXEC_URL = 'https://script.google.com/macros/s/SCRIPT_ID_BARU/exec';
```

Kemudian commit dan push seperti biasa.

---

## C. Remote Git

Repo ini push ke `STPUitu/admin`:

```bash
git remote set-url origin https://github.com/STPUitu/admin.git
git push origin main
```

---

## D. Nota Penting

- `Index.html` (I besar) hanya wujud dalam GAS project — **jangan commit ke GitHub repo**
- `index.html` (i kecil) hanya dalam GitHub repo — **jangan sync ke GAS project**
- Kedua-dua fail berbeza sepenuhnya — jangan campur
- Selepas push ke GitHub, tunggu ~2 minit sebelum test di browser (GitHub Pages ada delay)
- Jika Service Worker cache lama masih aktif di browser, buka DevTools → Application → Storage → "Clear site data" untuk force refresh
