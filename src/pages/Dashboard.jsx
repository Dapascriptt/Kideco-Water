import { Link, useNavigate } from 'react-router-dom';
import { usePonds } from '../context/PondContext';
import StatusBadge from '../components/StatusBadge';
import AiBriefing from '../components/AiBriefing';
import {
  aiModel, aiModelMetrics, aiForecastByPond, globalConditions,
} from '../data/mockData';
import './Dashboard.css';

const TREND_GLYPH = { rising: '▲', falling: '▼', stable: '▬' };
const TREND_LABEL = { rising: 'Naik', falling: 'Turun', stable: 'Stabil' };

export default function Dashboard() {
  const { ponds, counts, alerts, liveConnected } = usePonds();
  const navigate = useNavigate();

  const overflowProb = aiForecastByPond.B1.overflowProbability;
  const criticalAlerts = alerts.filter((a) => a.level === 'critical');
  const topAlerts = alerts.slice(0, 3);

  return (
    <div className="dashboard">
      {/* ---- Global status header ---- */}
      <header className="dash-statusbar panel">
        <div className="dsb-group">
          <span className="dsb-big mono">{ponds.length}</span>
          <span className="dsb-lab label-sm">Kolam Aktif</span>
        </div>
        <div className="dsb-sep" />
        <div className="dsb-counts">
          <span className="dsb-count safe mono">{counts.safe} Aman</span>
          <span className="dsb-count warn mono">{counts.warning} Waspada</span>
          <span className="dsb-count alert mono">{counts.critical} Kritis</span>
        </div>
        <div className="dsb-right">
          <span className="dsb-weather mono">🌧 {globalConditions.rainfall} mm/jam · La Niña Aktif</span>
          <span className={`dsb-live ${liveConnected ? 'on' : 'off'}`}>
            <span className="dsb-live-dot" />
            {liveConnected ? 'LIVE' : 'TERPUTUS'}
          </span>
          <span className="timestamp">sync {globalConditions.serverSync} WITA</span>
        </div>
      </header>

      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard Monitoring</h1>
          <p className="page-sub">Pantauan sekilas seluruh kolam pengendapan & prediksi AI — PT Kideco Jaya Agung</p>
        </div>
        <Link className="btn" to="/overview">Buka Peta Overview →</Link>
      </div>

      {/* ---- KPI tiles ---- */}
      <div className="grid grid-4 dash-kpis">
        <KpiTile label="Kolam Kritis" value={counts.critical} tone={counts.critical ? 'alert' : 'safe'}
          sub={`${criticalAlerts.length} peringatan kritis aktif`} />
        <KpiTile label="Kolam Waspada" value={counts.warning} tone={counts.warning ? 'warn' : 'safe'}
          sub="mendekati batas baku mutu" />
        <KpiTile label="Prob. Luapan (B1)" value={`${Math.round(overflowProb * 100)}%`} tone="alert"
          sub={`est. luapan ~${aiForecastByPond.B1.estimatedOverflowInHours} jam (AI)`} />
        <KpiTile label="Akurasi Model (7h)" value={`${Math.round(aiModelMetrics.forecastAccuracy7d * 100)}%`} tone="info"
          sub={`MAE pH ${aiModelMetrics.meanAbsErrorPH}`} />
      </div>

      {/* ---- AI predictive briefing ---- */}
      <AiBriefing />

      <div className="grid dash-split">
        {/* ---- Pond quick-glance grid ---- */}
        <section className="panel dash-ponds">
          <div className="panel-head">
            <span>Status Kolam — Sekilas</span>
            <span className="timestamp">refresh tiap 5 dtk</span>
          </div>
          <div className="dp-grid">
            {ponds.map((p) => (
              <button key={p.id} className={`dp-card dp-${p.status}`} onClick={() => navigate(`/pond/${p.id}`)}>
                <div className="dp-top">
                  <span className="dp-name">{p.name}</span>
                  <StatusBadge status={p.status} size="sm" />
                </div>
                <div className="dp-metrics">
                  <div className="dp-metric">
                    <span className="label-sm">pH</span>
                    <span className="mono dp-val">{p.pH.toFixed(1)}</span>
                  </div>
                  <div className="dp-metric">
                    <span className="label-sm">Level</span>
                    <span className="mono dp-val">{Math.round(p.level)}%</span>
                  </div>
                  <div className="dp-metric">
                    <span className="label-sm">Tren</span>
                    <span className={`mono dp-trend t-${p.trend}`}>{TREND_GLYPH[p.trend]} {TREND_LABEL[p.trend]}</span>
                  </div>
                </div>
                <div className="dp-level-bar"><span style={{ width: `${p.level}%` }} className={`lb-${p.status}`} /></div>
                <div className="dp-foot timestamp">update {p.lastUpdate} WITA</div>
              </button>
            ))}
          </div>
        </section>

        {/* ---- Right rail: AI engine + alerts ---- */}
        <div className="dash-rail">
          <section className="panel ai-engine">
            <div className="panel-head">
              <span>Mesin AI Prediktif</span>
              <span className={`ai-dot ${aiModel.status}`} />
            </div>
            <div className="aie-body">
              <div className="aie-row"><span className="label-sm">Model</span><span className="mono">{aiModel.version}</span></div>
              <div className="aie-row"><span className="label-sm">Engine</span><span className="aie-engine">{aiModel.engine}</span></div>
              <div className="aie-row"><span className="label-sm">Status</span><span className="mono aie-online">● {aiModel.status}</span></div>
              <div className="aie-row"><span className="label-sm">Latensi</span><span className="mono">{aiModel.latencyMs} ms</span></div>
              <div className="aie-row"><span className="label-sm">Horizon</span><span className="mono">{aiModel.horizonHours} jam</span></div>
              <div className="aie-row"><span className="label-sm">Prediksi hari ini</span><span className="mono">{aiModelMetrics.predictionsToday}</span></div>
              <div className="aie-row"><span className="label-sm">Latih ulang terakhir</span><span className="mono">{aiModelMetrics.lastRetrain}</span></div>
            </div>
            <div className="aie-metrics">
              <Metric label="Precision Luapan" value={`${Math.round(aiModelMetrics.overflowPrecision * 100)}%`} />
              <Metric label="Recall Luapan" value={`${Math.round(aiModelMetrics.overflowRecall * 100)}%`} />
            </div>
          </section>

          <section className="panel dash-alerts">
            <div className="panel-head">
              <span>Peringatan Terbaru</span>
              <Link to="/alerts" className="dash-alerts-link">semua →</Link>
            </div>
            <div className="da-list">
              {topAlerts.length === 0 ? (
                <div className="empty-state">Tidak ada peringatan aktif</div>
              ) : topAlerts.map((a) => (
                <Link key={a.id} to={`/pond/${a.pond}`} className={`da-item da-${a.level}`}>
                  <span className="da-bar" />
                  <div className="da-content">
                    <div className="da-row1">
                      <StatusBadge status={a.level === 'info' ? 'info' : a.level} size="sm" />
                      <span className="da-time timestamp">{a.time}</span>
                    </div>
                    <div className="da-title">Pond {a.pond} — {a.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function KpiTile({ label, value, sub, tone }) {
  return (
    <div className={`kpi-tile panel tone-${tone}`}>
      <div className="kpi-label label-sm">{label}</div>
      <div className="kpi-value mono">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="aie-metric">
      <span className="mono aie-metric-val">{value}</span>
      <span className="label-sm">{label}</span>
    </div>
  );
}
