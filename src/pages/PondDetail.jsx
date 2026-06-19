import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePonds } from '../context/PondContext';
import StatusBadge from '../components/StatusBadge';
import ParameterCard from '../components/ParameterCard';
import PhTrendChart from '../components/charts/PhTrendChart';
import LevelInflowChart from '../components/charts/LevelInflowChart';
import {
  phTrendByPond, levelInflowByPond, aiForecastByPond,
  aiRecommendationsByPond, aiModel,
} from '../data/mockData';
import './PondDetail.css';

const RISK_META = {
  emergency: { label: 'DARURAT', glyph: '🚨', cls: 'risk-emergency' },
  critical:  { label: 'Kritis',  glyph: '🔴', cls: 'risk-critical' },
  high:      { label: 'Tinggi',  glyph: '⚠', cls: 'risk-high' },
  elevated:  { label: 'Naik',    glyph: '⚠', cls: 'risk-elevated' },
  normal:    { label: 'Normal',  glyph: '●',  cls: 'risk-normal' },
};

const ICON = { lime: '⚗', pump: '⚡', eye: '👁' };

export default function PondDetail() {
  const { pondId } = useParams();
  const { ponds } = usePonds();
  const [logged, setLogged] = useState(false);

  const pond = ponds.find((p) => p.id === pondId);
  if (!pond) {
    return (
      <div className="empty-state">
        Kolam "{pondId}" tidak ditemukan. <Link to="/overview">Kembali ke Peta</Link>
      </div>
    );
  }

  const phData = phTrendByPond[pondId] || phTrendByPond.default;
  const lvData = levelInflowByPond[pondId] || levelInflowByPond.default;
  const forecast = aiForecastByPond[pondId] || aiForecastByPond.default;
  const rec = aiRecommendationsByPond[pondId] || aiRecommendationsByPond.default;

  return (
    <div className="pond-detail">
      {/* ---- Header ---- */}
      <header className="pd-head panel">
        <Link to="/overview" className="pd-back">← Kembali ke Peta</Link>
        <div className="pd-title-block">
          <h1 className="pd-title mono">{pond.name.toUpperCase()}</h1>
          <StatusBadge status={pond.status} size="lg" />
        </div>
        <div className="pd-meta">
          <span className="mono">Koordinat: {pond.coords}</span>
          <span className="mono">Kapasitas: {pond.capacity.toLocaleString('id-ID')} m³</span>
          <span className="timestamp">Update: {pond.lastUpdate} WITA</span>
        </div>
      </header>

      {/* ---- 4 KPI cards ---- */}
      <div className="grid grid-4">
        <ParameterCard name="pH" paramKey="pH" value={pond.pH} min={6} max={9}
          trend={pond.trend} trendNote={`${pond.trend === 'falling' ? 'turun' : pond.trend === 'rising' ? 'naik' : 'stabil'} ~0.3/jam`} />
        <ParameterCard name="TSS" paramKey="tss" value={pond.tss} unit="mg/L" max={400}
          trend={pond.tss > 380 ? 'rising' : 'stable'} trendNote="naik 12 mg/L·jam" />
        <ParameterCard name="Fe Total" paramKey="fe" value={pond.fe} unit="mg/L" max={7} />
        <ParameterCard name="Mn Total" paramKey="mn" value={pond.mn} unit="mg/L" max={4} />
      </div>

      {/* ---- Charts ---- */}
      <div className="grid grid-2">
        <section className="panel">
          <div className="panel-head"><span>Tren pH — 12 Jam Terakhir</span></div>
          <div className="pd-chart"><PhTrendChart data={phData} /></div>
        </section>
        <section className="panel">
          <div className="panel-head"><span>Level Kolam & Inflow</span></div>
          <div className="pd-chart"><LevelInflowChart data={lvData} /></div>
        </section>
      </div>

      {/* ---- AI prediction + recommendation ---- */}
      <div className="grid grid-2 pd-ai">
        {/* Prediction panel */}
        <section className="panel pd-pred">
          <div className="panel-head">
            <span>Prediksi AI — {aiModel.horizonHours} Jam ke Depan</span>
            <span className="pd-ai-tag mono">{aiModel.version}</span>
          </div>
          <table className="pd-pred-table">
            <thead>
              <tr><th>Waktu</th><th>pH Pred.</th><th>Level Pred.</th><th>Risiko</th></tr>
            </thead>
            <tbody>
              {forecast.rows.map((r) => {
                const m = RISK_META[r.risk] || RISK_META.normal;
                return (
                  <tr key={r.time} className={m.cls}>
                    <td className="mono">{r.time}</td>
                    <td className="mono">{r.pH.toFixed(1)}</td>
                    <td className="mono">{r.level}%</td>
                    <td className="pd-risk">{m.glyph} {m.label}{r.note ? ` — ${r.note}` : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pd-pred-foot">
            <div className="pd-prob">
              <span className="label-sm">Probabilitas luapan {aiModel.horizonHours} jam</span>
              <span className="mono pd-prob-val" style={{ color: forecast.overflowProbability > 0.5 ? 'var(--status-alert)' : 'var(--status-safe)' }}>
                {Math.round(forecast.overflowProbability * 100)}%
              </span>
            </div>
            {forecast.estimatedOverflowAt && (
              <div className="pd-eta mono">
                Estimasi luapan: ~{forecast.estimatedOverflowInHours} jam ({forecast.estimatedOverflowAt} WITA)
              </div>
            )}
            <div className="pd-conf timestamp">confidence model {Math.round(forecast.confidence * 100)}% · dibuat {forecast.generatedAt} WITA</div>
          </div>
        </section>

        {/* Recommendation panel */}
        <section className="panel pd-rec">
          <div className="panel-head"><span>Rekomendasi Sistem (AI)</span></div>
          <div className="pd-rec-body">
            {rec.urgency === 'none' ? (
              <div className="empty-state">Kondisi normal — tidak ada tindakan yang diperlukan saat ini.</div>
            ) : (
              <>
                <div className={`pd-rec-headline u-${rec.urgency}`}>
                  {rec.urgency === 'immediate' ? '🔴' : '🟡'} {rec.headline}
                </div>
                <ol className="pd-actions">
                  {rec.actions.map((a) => (
                    <li key={a.id} className="pd-action">
                      <span className="pd-action-icon">{ICON[a.icon] || '•'}</span>
                      <div>
                        <div className="pd-action-title">{a.title}</div>
                        {a.lines.map((l, i) => <div key={i} className="pd-action-line mono">{l}</div>)}
                      </div>
                    </li>
                  ))}
                </ol>
                {rec.impact.length > 0 && (
                  <div className="pd-impact">
                    <div className="label-sm">Dampak estimasi jika tindakan dilakukan</div>
                    {rec.impact.map((im, i) => (
                      <div key={i} className="pd-impact-row mono">
                        <span>{im.label}:</span>
                        <span>{im.from} → <strong style={{ color: 'var(--status-safe)' }}>{im.to}</strong> {im.window} {im.good ? '✓' : ''}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pd-rec-actions">
                  <button className="btn btn-primary" onClick={() => setLogged(true)}>Catat Tindakan Diambil</button>
                  <button className="btn" onClick={() => setLogged(true)}>Simpan ke Log Tindakan</button>
                </div>
                {logged && <div className="pd-logged mono">✓ Tindakan tercatat ke log operasional ({new Date().toLocaleTimeString('id-ID', { hour12: false })} WITA)</div>}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
