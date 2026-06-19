// ============================================================
// KidecoWater — Mock Data
// All operational mock data: ponds, alerts, sensors, history,
// compliance, plus simulated AI-service integration payloads.
// ============================================================

// --- Baku Mutu (KepMenLH No. 113 Tahun 2003) ---
export const QUALITY_STANDARDS = {
  pH:  { min: 6.0, max: 9.0, unit: '' },
  tss: { min: null, max: 400, unit: 'mg/L' },
  fe:  { min: null, max: 7.0, unit: 'mg/L' },
  mn:  { min: null, max: 4.0, unit: 'mg/L' },
};

export const STANDARD_REF = 'Baku Mutu KepMenLH 113/2003';

export function getComplianceStatus(parameter, value) {
  const std = QUALITY_STANDARDS[parameter];
  if (!std || value == null) return 'unknown';
  if (std.max != null && value > std.max) return 'critical';
  if (std.min != null && value < std.min) return 'critical';
  if (std.max != null && value > std.max * 0.85) return 'warning';
  if (std.min != null && value < std.min + std.min * 0.1) return 'warning';
  return 'safe';
}

// --- Kolam (Ponds) ---
export const initialPonds = [
  { id: 'A1', name: 'Pond A1', pH: 7.2, tss: 180, fe: 2.1, mn: 1.4,
    level: 68, status: 'safe', trend: 'stable', lastUpdate: '14:23:05',
    coords: '-1.8201°, 116.2150°', capacity: 50000 },
  { id: 'A2', name: 'Pond A2', pH: 6.1, tss: 310, fe: 5.8, mn: 3.2,
    level: 82, status: 'warning', trend: 'rising', lastUpdate: '14:23:01',
    coords: '-1.8215°, 116.2168°', capacity: 50000 },
  { id: 'B1', name: 'Pond B1', pH: 5.4, tss: 430, fe: 7.9, mn: 4.6,
    level: 91, status: 'critical', trend: 'rising', lastUpdate: '14:22:58',
    coords: '-1.8234°, 116.2187°', capacity: 50000 },
  { id: 'B2', name: 'Pond B2', pH: 7.6, tss: 120, fe: 1.2, mn: 0.8,
    level: 45, status: 'safe', trend: 'falling', lastUpdate: '14:23:03',
    coords: '-1.8248°, 116.2201°', capacity: 50000 },
  { id: 'C1', name: 'Pond C1', pH: 7.0, tss: 200, fe: 3.1, mn: 2.0,
    level: 55, status: 'safe', trend: 'stable', lastUpdate: '14:23:07',
    coords: '-1.8260°, 116.2155°', capacity: 40000 },
  { id: 'C2', name: 'Pond C2', pH: 7.3, tss: 160, fe: 2.4, mn: 1.7,
    level: 60, status: 'safe', trend: 'stable', lastUpdate: '14:23:02',
    coords: '-1.8272°, 116.2172°', capacity: 40000 },
];

// --- Alerts ---
export const initialAlerts = [
  { id: 1, level: 'critical', pond: 'B1',
    title: 'pH di bawah baku mutu — tindakan segera',
    detail: 'pH saat ini 5.4 (batas minimum 6.0). Prediksi AI: turun ke 4.6 dalam 3 jam.',
    time: '14:22:58', status: 'active' },
  { id: 2, level: 'critical', pond: 'B1',
    title: 'Risiko luapan dalam 3 jam',
    detail: 'Level kolam 91%. Inflow prediksi 1.200 m³/jam karena curah hujan 45mm/jam.',
    time: '14:21:00', status: 'active' },
  { id: 3, level: 'warning', pond: 'A2',
    title: 'pH mendekati batas bawah baku mutu',
    detail: 'pH saat ini 6.1, mendekati batas minimum 6.0. Pantau setiap 15 menit.',
    time: '14:20:30', status: 'active' },
  { id: 4, level: 'info', pond: 'C1',
    title: 'Sensor turbidity dalam mode kalibrasi',
    detail: 'Sensor TU-01 Pond C1 sedang kalibrasi ulang. Data TSS tidak tersedia sementara.',
    time: '13:45:00', status: 'active' },
  { id: 5, level: 'warning', pond: 'B2',
    title: 'Sensor pH offline — baterai habis',
    detail: 'Sensor B2-pH-01 tidak mengirim data sejak 09:14. Baterai: 12%. Ganti baterai segera.',
    time: '09:20:00', status: 'active' },
];

// Alert yang sudah ditangani (histori 24 jam)
export const resolvedAlerts = [
  { id: 101, level: 'warning', pond: 'A1', title: 'TSS mendekati ambang',
    detail: 'TSS 360 mg/L mendekati batas 400 mg/L.', time: '08:12:00',
    status: 'resolved', resolvedAt: '08:40:00', operator: 'R. Saputra' },
  { id: 102, level: 'critical', pond: 'C1', title: 'Lonjakan Fe terdeteksi',
    detail: 'Fe naik ke 7.2 mg/L setelah hujan deras.', time: '03:55:00',
    status: 'resolved', resolvedAt: '04:30:00', operator: 'D. Pratama' },
];

// --- Sensors ---
export const sensors = [
  { id: 'B1-pH-01', pond: 'B1', type: 'pH', status: 'online',
    signal: -72, battery: 78, lastUpdate: '14:23:05',
    lastValue: 5.4, unit: 'pH', calibratedDaysAgo: 12, nextCalibrationDays: 18 },
  { id: 'B1-TU-01', pond: 'B1', type: 'Turbidity', status: 'online',
    signal: -68, battery: 81, lastUpdate: '14:23:03',
    lastValue: 430, unit: 'NTU', calibratedDaysAgo: 8, nextCalibrationDays: 22 },
  { id: 'B1-LV-01', pond: 'B1', type: 'Level', status: 'online',
    signal: -75, battery: 65, lastUpdate: '14:23:05',
    lastValue: 91, unit: '%', calibratedDaysAgo: 30, nextCalibrationDays: 0 },
  { id: 'A2-pH-01', pond: 'A2', type: 'pH', status: 'online',
    signal: -81, battery: 43, lastUpdate: '14:23:01',
    lastValue: 6.1, unit: 'pH', calibratedDaysAgo: 5, nextCalibrationDays: 25 },
  { id: 'C1-TU-01', pond: 'C1', type: 'Turbidity', status: 'calibrating',
    signal: -70, battery: 90, lastUpdate: '13:45:00',
    lastValue: null, unit: 'NTU', calibratedDaysAgo: 0, nextCalibrationDays: 30 },
  { id: 'B2-pH-01', pond: 'B2', type: 'pH', status: 'offline',
    signal: null, battery: 12, lastUpdate: '09:14:22',
    lastValue: 7.6, unit: 'pH', calibratedDaysAgo: 20, nextCalibrationDays: 10 },
];

// --- Tren pH 12 jam terakhir (per kolam, contoh B1) ---
export const phTrendByPond = {
  B1: [
    { time: '02:00', pH: 7.8 }, { time: '04:00', pH: 7.5 },
    { time: '06:00', pH: 7.1 }, { time: '08:00', pH: 6.8 },
    { time: '10:00', pH: 6.4 }, { time: '12:00', pH: 6.1 },
    { time: '14:00', pH: 5.9 }, { time: '14:23', pH: 5.4 },
  ],
  A2: [
    { time: '02:00', pH: 6.9 }, { time: '04:00', pH: 6.8 },
    { time: '06:00', pH: 6.6 }, { time: '08:00', pH: 6.5 },
    { time: '10:00', pH: 6.4 }, { time: '12:00', pH: 6.2 },
    { time: '14:00', pH: 6.1 }, { time: '14:23', pH: 6.1 },
  ],
  default: [
    { time: '02:00', pH: 7.3 }, { time: '04:00', pH: 7.2 },
    { time: '06:00', pH: 7.2 }, { time: '08:00', pH: 7.1 },
    { time: '10:00', pH: 7.2 }, { time: '12:00', pH: 7.3 },
    { time: '14:00', pH: 7.2 }, { time: '14:23', pH: 7.2 },
  ],
};

// --- Level & Inflow 12 jam terakhir ---
export const levelInflowByPond = {
  B1: [
    { time: '02:00', level: 71, inflow: 320 }, { time: '04:00', level: 74, inflow: 410 },
    { time: '06:00', level: 78, inflow: 560 }, { time: '08:00', level: 82, inflow: 700 },
    { time: '10:00', level: 85, inflow: 880 }, { time: '12:00', level: 88, inflow: 1050 },
    { time: '14:00', level: 90, inflow: 1180 }, { time: '14:23', level: 91, inflow: 1200 },
  ],
  default: [
    { time: '02:00', level: 60, inflow: 200 }, { time: '04:00', level: 61, inflow: 220 },
    { time: '06:00', level: 62, inflow: 210 }, { time: '08:00', level: 61, inflow: 190 },
    { time: '10:00', level: 60, inflow: 180 }, { time: '12:00', level: 59, inflow: 175 },
    { time: '14:00', level: 60, inflow: 185 }, { time: '14:23', level: 60, inflow: 190 },
  ],
};

// --- Data Historis Kepatuhan (tabel audit) ---
const HISTORY_PONDS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
function genHistory() {
  const rows = [];
  let id = 1;
  for (let h = 0; h < 48; h++) {
    const pond = HISTORY_PONDS[h % 6];
    const hour = String(13 - Math.floor(h / 6)).padStart(2, '0');
    const min = String((h * 7) % 60).padStart(2, '0');
    const isB1 = pond === 'B1';
    const pH = isB1 ? +(6.2 - h * 0.01).toFixed(2) : +(7.0 + (Math.random() - 0.5)).toFixed(2);
    const tss = isB1 ? 380 + h * 2 : Math.round(140 + Math.random() * 160);
    const fe = isB1 ? +(6.5 + h * 0.03).toFixed(1) : +(1 + Math.random() * 4).toFixed(1);
    const mn = isB1 ? +(3.8 + h * 0.02).toFixed(1) : +(0.5 + Math.random() * 3).toFixed(1);
    const level = isB1 ? Math.min(99, 84 + h * 0.2) : Math.round(45 + Math.random() * 30);
    const violating =
      pH < 6 || pH > 9 || tss > 400 || fe > 7 || mn > 4;
    rows.push({
      id: id++,
      time: `2026-06-19 ${hour}:${min}:00`,
      pond,
      pH, tss, fe, mn,
      level: Math.round(level),
      compliant: !violating,
    });
  }
  return rows;
}
export const historyData = genHistory();

// --- Kepatuhan bulanan per kolam ---
export const complianceData = [
  { pond: 'Pond A1', compliance: 98.2 },
  { pond: 'Pond A2', compliance: 91.5 },
  { pond: 'Pond B1', compliance: 74.3 },
  { pond: 'Pond B2', compliance: 99.1 },
  { pond: 'Pond C1', compliance: 96.8 },
  { pond: 'Pond C2', compliance: 97.4 },
];

// --- Kondisi lingkungan global ---
export const globalConditions = {
  weather: 'Hujan deras',
  rainfall: 42,        // mm/jam
  laNina: true,
  serverSync: '14:23:08',
};

// ============================================================
// AI INTEGRATION — DUMMY PAYLOADS
// Mensimulasikan respons dari layanan model AI prediktif.
// Bentuk payload sengaja dibuat seperti respons REST/WebSocket
// agar mudah ditukar dengan backend AI sungguhan.
// ============================================================

// Metadata model AI yang "melayani" prediksi
export const aiModel = {
  name: 'KidecoWater-Hydro Forecaster',
  version: 'v2.3.1',
  engine: 'LSTM + Gradient Boosting (ensemble)',
  trainedOn: '2026-05-30',
  horizonHours: 6,
  updatedAt: '14:23:00',
  status: 'online',          // online | degraded | offline
  latencyMs: 184,
  inputFeatures: ['pH', 'TSS', 'Fe', 'Mn', 'level', 'inflow', 'rainfall', 'soil_pH'],
};

// Prediksi 6 jam ke depan per kolam (dummy). riskLevel:
// 'high' | 'critical' | 'emergency' | 'elevated' | 'normal'
export const aiForecastByPond = {
  B1: {
    pondId: 'B1',
    generatedAt: '14:23:00',
    overflowProbability: 0.87,           // 0..1
    estimatedOverflowAt: '17:20',        // WITA
    estimatedOverflowInHours: 3,
    confidence: 0.91,
    rows: [
      { time: '15:00', pH: 5.1, level: 93, risk: 'high' },
      { time: '16:00', pH: 4.9, level: 95, risk: 'critical' },
      { time: '17:00', pH: 4.7, level: 97, risk: 'critical', note: 'POTENSI LUAPAN' },
      { time: '18:00', pH: 4.6, level: 99, risk: 'emergency' },
      { time: '19:00', pH: 4.8, level: 94, risk: 'critical' },
      { time: '20:00', pH: 5.0, level: 88, risk: 'high' },
    ],
  },
  A2: {
    pondId: 'A2',
    generatedAt: '14:23:00',
    overflowProbability: 0.18,
    estimatedOverflowAt: null,
    estimatedOverflowInHours: null,
    confidence: 0.84,
    rows: [
      { time: '15:00', pH: 6.0, level: 83, risk: 'elevated' },
      { time: '16:00', pH: 5.9, level: 84, risk: 'high' },
      { time: '17:00', pH: 5.9, level: 85, risk: 'high' },
      { time: '18:00', pH: 6.0, level: 84, risk: 'elevated' },
      { time: '19:00', pH: 6.1, level: 82, risk: 'normal' },
      { time: '20:00', pH: 6.2, level: 80, risk: 'normal' },
    ],
  },
  default: {
    pondId: null,
    generatedAt: '14:23:00',
    overflowProbability: 0.04,
    estimatedOverflowAt: null,
    estimatedOverflowInHours: null,
    confidence: 0.88,
    rows: [
      { time: '15:00', pH: 7.2, level: 61, risk: 'normal' },
      { time: '16:00', pH: 7.2, level: 61, risk: 'normal' },
      { time: '17:00', pH: 7.1, level: 62, risk: 'normal' },
      { time: '18:00', pH: 7.2, level: 61, risk: 'normal' },
      { time: '19:00', pH: 7.2, level: 60, risk: 'normal' },
      { time: '20:00', pH: 7.3, level: 60, risk: 'normal' },
    ],
  },
};

// Rekomendasi tindakan dari AI (dummy) per kolam
export const aiRecommendationsByPond = {
  B1: {
    pondId: 'B1',
    urgency: 'immediate',          // immediate | monitor | none
    headline: 'TINDAKAN SEGERA DIPERLUKAN',
    actions: [
      { id: 'a1', priority: 1, icon: 'lime',
        title: 'Tambahkan Kapur (Lime Dosing)',
        lines: [
          'Dosis: 450 kg',
          'Estimasi: 45 menit hingga pH naik ke >6.0',
          'Penghematan vs manual: 23% (~104 kg)',
        ] },
      { id: 'a2', priority: 2, icon: 'pump',
        title: 'Aktifkan Pompa Transfer → Pond B2',
        lines: [
          'Kapasitas: 800 m³/jam',
          'Durasi disarankan: 4 jam',
          'Volume transfer target: 3.200 m³',
        ] },
      { id: 'a3', priority: 3, icon: 'pump',
        title: 'Aktifkan Pompa Cadangan (P-B1-02)',
        lines: [
          'Mulai: Sekarang',
          'Target: Turunkan level ke <80% dalam 5 jam',
        ] },
    ],
    impact: [
      { label: 'Level', from: '91%', to: '76%', window: 'dalam 5 jam', good: true },
      { label: 'pH', from: '5.4', to: '6.8', window: 'dalam 2 jam', good: true },
      { label: 'Baku mutu terpenuhi', from: 'Tidak', to: 'Ya', window: '(estimasi)', good: true },
    ],
  },
  A2: {
    pondId: 'A2',
    urgency: 'monitor',
    headline: 'PANTAU KETAT',
    actions: [
      { id: 'b1', priority: 1, icon: 'lime',
        title: 'Siapkan Dosing Kapur (standby)',
        lines: [
          'Dosis siaga: 120 kg',
          'Picu otomatis jika pH < 6.0',
        ] },
      { id: 'b2', priority: 2, icon: 'eye',
        title: 'Tingkatkan frekuensi sampling',
        lines: ['Interval: 15 menit', 'Durasi: 3 jam ke depan'],
      },
    ],
    impact: [
      { label: 'pH', from: '6.1', to: '6.4', window: 'dalam 2 jam', good: true },
    ],
  },
  default: {
    pondId: null,
    urgency: 'none',
    headline: 'KONDISI NORMAL',
    actions: [],
    impact: [],
  },
};

// Ringkasan naratif AI untuk dashboard awal (dummy "LLM summary")
export const aiDashboardBriefing = {
  generatedAt: '14:23:00',
  model: aiModel.name,
  severity: 'critical',
  headline: '1 kolam dalam kondisi kritis dengan probabilitas luapan tinggi.',
  body:
    'Pond B1 menunjukkan tren penurunan pH yang konsisten (−0.3/jam) disertai ' +
    'kenaikan level akibat inflow hujan 45 mm/jam. Model memprediksi pelanggaran ' +
    'baku mutu berlanjut dan potensi luapan 87% dalam ~3 jam. Pond A2 mendekati ' +
    'batas bawah pH dan perlu dipantau. Lima kolam lain stabil dalam baku mutu.',
  keyDrivers: [
    'Curah hujan tinggi (45 mm/jam) menaikkan inflow Pond B1',
    'Akumulasi asam dari material overburden menurunkan pH',
    'Kapasitas penyangga (buffer) kolam menipis pada level 91%',
  ],
  recommendedFocus: 'B1',
};

export const aiModelMetrics = {
  forecastAccuracy7d: 0.94,     // akurasi prediksi 7 hari
  overflowPrecision: 0.89,
  overflowRecall: 0.92,
  meanAbsErrorPH: 0.12,
  predictionsToday: 1728,
  alertsRaisedToday: 11,
  lastRetrain: '2026-05-30',
};
