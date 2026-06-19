# Alur Kerja Sistem KidecoWater (System Workflow Summary)

KidecoWater adalah platform digital terintegrasi berbasis **Kecerdasan Buatan (AI)** dan **Internet of Things (IoT)** yang dirancang khusus untuk memantau, memprediksi, dan mengendalikan kondisi Air Asam Tambang (AAT) di area kolam pengendapan (_settling pond_) PT Kideco Jaya Agung secara prediktif dan preskriptif, guna mematuhi batas hukum baku mutu lingkungan (**KepMenLH No. 113 Tahun 2003**).

---

## 🗺️ Diagram Alur Kerja Sistem (Color-Coded)

Berikut adalah diagram alur kerja terintegrasi dari pengumpulan sensor hingga proses audit kepatuhan lingkungan:

```mermaid
graph TD
    %% Definisi Style Warna untuk Tiap Blok Alur Kerja
    classDef senseStyle fill:#1f6feb,stroke:#58a6ff,stroke-width:2px,color:#fff;
    classDef predictStyle fill:#8957e5,stroke:#ab7df6,stroke-width:2px,color:#fff;
    classDef prescribeStyle fill:#d29922,stroke:#f0b73f,stroke-width:2px,color:#fff;
    classDef actStyle fill:#238636,stroke:#2ea043,stroke-width:2px,color:#fff;
    classDef auditStyle fill:#0969da,stroke:#54a3ff,stroke-width:2px,color:#fff;
    classDef dbStyle fill:#161b22,stroke:#30363d,stroke-width:2px,color:#adbac7;

    subgraph 1. SENSE (Penginderaan IoT)
        A1[Sensor pH]:::senseStyle
        A2[Sensor Kekeruhan/TSS]:::senseStyle
        A3[Sensor Level Air]:::senseStyle
        A4[Sensor Debit Flow]:::senseStyle
        B[(TimescaleDB)]:::dbStyle

        A1 & A2 & A3 & A4 -->|LoRaWAN MQTT| B
    end

    subgraph 2. PREDICT (Prakiraan AI)
        C[Model Ensembel LSTM & XGBoost]:::predictStyle
        D[Prakiraan Cuaca & Hujan]:::predictStyle
        E[Proyeksi Kualitas & Level Air]:::predictStyle

        B --> C
        D --> C
        C -->|Proyeksi Deret Waktu| E
    end

    subgraph 3. PRESCRIBE (Optimasi Rekomendasi)
        F[Mesin Optimasi OR-Tools]:::prescribeStyle
        G[Rekomendasi Dosis & Pompa]:::prescribeStyle

        E --> F
        F -->|Batas Baku Mutu| G
    end

    subgraph 4. ACT (Aksi Kontrol Operator)
        H[Operator Eksekusi Rekomendasi]:::actStyle
        I[Air Kolam Kembali Aman]:::actStyle

        G -->|Dasbor UI| H
        H -->|Reaksi Kimia & Hidrolika| I
    end

    subgraph 5. AUDIT (Kepatuhan Lingkungan LHK)
        J[(Log Kepatuhan)]:::dbStyle
        K[Ekspor Laporan CSV/PROPER]:::auditStyle

        I -->|Pencatatan Otomatis| J
        J -->|Laporan Hasil| K
    end

    I -.->|Siklus Penginderaan Ulang| A1
```

---

## 🔄 5 Siklus Utama Alur Kerja

### 🔵 1. SENSE (Mengindra & Mengirim Data)

- 📡 **Sensor pH Elektroda**: Mengukur tingkat keasaman air asam tambang secara langsung untuk menentukan tingkat keasaman kolam.
- 📸 **Sensor Turbidity (Kekeruhan Optik)**: Menggunakan hamburan cahaya optik (satuan NTU) sebagai proksi langsung untuk mengukur nilai **TSS (Total Suspended Solids)**.
- 📏 **Sensor Ultrasonic Level**: Memantau ketinggian permukaan air kolam relatif terhadap kapasitas tampung total guna mencegah risiko meluap (_overflow_).
- 🚰 **Flow Meter**: Mengukur debit air masuk (_inflow_) dari limpasan hujan (_runoff_) tambang terbuka dan air keluar (_outflow_) melalui saluran pelepasan (_spillway_).
- 🚀 **Transmisi MQTT via LoRaWAN**: Data dikirim via jaringan nirkabel jarak jauh berdaya rendah ke basis data terpusat secara terus menerus.

### 🟣 2. PREDICT (Memprediksi Kondisi Mendatang)

- 🧠 **Model Ensembel AI (LSTM & XGBoost)**: Menggabungkan algoritma pembelajaran mendalam LSTM untuk memodelkan deret waktu hidrologi dan XGBoost untuk memproyeksikan debit limpasan air secara cepat.
- 🌧️ **Integrasi Cuaca BMKG**: Memadukan data sensor aktual dengan prakiraan curah hujan BMKG untuk memproyeksikan kondisi kolam 1–6 jam ke depan.
- 🚨 **Deteksi Dini Bahaya**: AI memprediksi risiko terjadinya pelanggaran baku mutu dan probabilitas luapan kolam (_overflow_) saat cuaca ekstrem (La Niña).

### 🟡 3. PRESCRIBE (Sistem Rekomendasi & Optimasi)

- 🧪 **Lime Dosing Presisi**: Menghitung kebutuhan kapur ($Ca(OH)_2$) secara presisi untuk menetralkan pH air kolam dari asam (<6.0) kembali ke batas netral (6.8 - 7.5) tanpa terjadi kelebihan dosis kapur (_over-dosing_).
- 🎛️ **Jadwal Pemompaan (Pump Scheduling)**: Mesin optimasi OR-Tools menghitung dan merekomendasikan kapan pompa transfer antar-kolam (debit 800 m³/jam) dan pompa darurat (500 m³/jam) harus dinyalakan untuk menyeimbangkan beban kolam.

### 🟢 4. ACT (Aksi Operator / Kontrol)

- 💻 **Dasbor Kontrol Terpadu**: Operator melihat peringatan dini (_alerts_) berwarna di monitor kontrol room beserta kartu tindakan rekomendasi AI.
- 🛠️ **Aksi Lapangan**: Operator mengeksekusi rekomendasi dengan satu klik (**Terapkan Dosing** / **Aktifkan Pompa**). Sistem merespons dengan:
  - _Lime dosing_ menaikkan pH secara gradual dan mengendapkan logam berat terlarut (Fe/Mn).
  - _Pumping_ memindahkan air dari kolam kritis B1 ke kolam penampung B2 untuk mengurangi level air B1.

### 🔵 5. AUDIT (Kepatuhan Lingkungan & PROPER)

- 🔒 **Pencatatan Otomatis**: Setiap data kualitas air hasil treatment dan log keputusan operator dicatat secara permanen dan tidak dapat dimanipulasi (_tamper-proof_).
- 📄 **Jejak Kepatuhan (Audit Trail)**: Riwayat digunakan sebagai bukti pemenuhan kriteria penilaian peringkat **PROPER** Kementerian LHK dan ekspor laporan ESG dalam format file .CSV.

---

## 📊 Baku Mutu Lingkungan (KepMenLH No. 113 Tahun 2003)

Sebelum dilepas ke lingkungan perairan umum, air tambang **wajib** mematuhi batas standar berikut:

- 🔴 **pH (Keasaman)**: **6.0 – 9.0** (Jika pH < 6.0, air bersifat korosif, mematikan biota air, dan mempercepat pelarutan logam berat).
- 🟤 **TSS (Residu Tersuspensi)**: **Maksimum 400 mg/L** (Kadar tinggi menyumbat pernapasan ikan dan memblokir cahaya matahari masuk ke sungai).
- 🟠 **Besi (Fe) Total**: **Maksimum 7.0 mg/L** (Menyebabkan karat air berwarna kemerahan yang meracuni mikroorganisme sungai).
- 🟡 **Mangan (Mn) Total**: **Maksimum 4.0 mg/L** (Mencemari perairan dan menyebabkan kerak hitam pada saluran pelepasan air).

---

## 📖 Glosarium & Istilah Terkait

### 🏷️ Istilah Umum Operasional & Teknologi

- 💧 **Air Asam Tambang (AAT) / Acid Mine Drainage (AMD)**: Air limbah tambang dengan pH sangat rendah (asam) dan konsentrasi logam berat larut tinggi akibat terpaparnya mineral batuan sulfida dengan air dan udara.
- 🏞️ **Settling Pond (Kolam Pengendapan)**: Kolam penampungan buatan di area tambang tempat berlangsungnya proses pengendapan sedimentasi lumpur dan netralisasi kimiawi sebelum air dibuang.
- 📥 **Inflow**: Debit laju air limpasan tambang yang mengalir masuk ke kolam pengendapan (m³/jam).
- 📤 **Outflow**: Debit laju pelepasan air keluar kolam, baik secara alami maupun bantuan pompa pembuangan (m³/jam).
- 🌊 **Spillway**: Saluran pelepasan darurat bermodel pintu air terbuka yang mengalirkan air berlebih secara gravitasi ketika kapasitas kolam melampaui batas maksimum.
- ⛰️ **Catchment Area**: Daerah tangkapan hujan terbuka di tambang tempat air mengalir menuju kolam pengendapan.
- 🌿 **PROPER**: Program Penilaian Peringkat Kinerja Perusahaan dalam Pengelolaan Lingkungan yang diinisiasi oleh Kementerian Lingkungan Hidup dan Kehutanan (LHK).
- 🏛️ **ESG (Environmental, Social, Governance)**: Indikator standar tata kelola bisnis ramah lingkungan dan sosial demi keberlanjutan masa depan.

### 🧪 Istilah Kimia Tambang

- 🧬 **pH (Power of Hydrogen)**: Ukuran derajat keasaman atau kebasaan suatu larutan dalam skala logaritma (0 = Asam Kuat, 7 = Netral, 14 = Basa Kuat).
- 🪙 **Pirit (Pyrite / $FeS_2$)**: Batuan sulfida besi (sering disebut emas palsu) yang terkandung di tanah penutup tambang (_overburden_). Ketika pirit teroksidasi oleh oksigen dan air hujan, senyawa ini membentuk asam sulfat ($H_2SO_4$) yang membuat air tambang menjadi asam.
- 🌫️ **TSS (Total Suspended Solids)**: Berat total padatan lumpur dan partikel halus melayang di air yang tertahan oleh saringan pori mikro, dinyatakan dalam satuan miligram per liter (mg/L).
- 🔩 **Besi (Fe / Ferrum)**: Logam berat yang sangat larut dalam kondisi air asam. Meningkat tajam saat pirit batuan teroksidasi.
- 🔋 **Mangan (Mn)**: Logam berat kelabu yang beracun pada konsentrasi tinggi dan hanya bisa mengendap secara efektif pada kondisi lingkungan basa (pH > 8.5).
- 🧪 **Kapur ($Ca(OH)_2$ / Kalsium Hidroksida)**: Senyawa alkali/basa kuat berwujud bubuk putih yang disemprotkan ke air kolam asam untuk menaikkan nilai pH dan menetralkan larutan asam tambang.
- 💥 **Reaksi Netralisasi**: Reaksi penggabungan asam ($H^+$) dan basa ($OH^-$) menghasilkan molekul air netral ($H_2O$) dan endapan gipsum padat ($CaSO_4$):
  $$H_2SO_4 + Ca(OH)_2 \rightarrow CaSO_4 \downarrow + 2H_2O$$
- ❄️ **Reaksi Presipitasi**: Reaksi pengendapan logam berat terlarut menjadi hidroksida padat setelah air menjadi basa. Contoh: Besi terlarut ($Fe^{3+}$) berubah menjadi padatan karat merah ($Fe(OH)_3$) yang tenggelam ke dasar kolam:
  $$Fe^{3+} + 3OH^- \rightarrow Fe(OH)_3 \downarrow \text{ (padatan merah)}$$
