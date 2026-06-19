import { Link } from 'react-router-dom';
import { usePonds } from '../context/PondContext';
import { aiModel } from '../data/mockData';
import './AiBriefing.css';

const SEV_COLOR = {
  critical: 'var(--status-alert)',
  warning: 'var(--status-warn)',
  normal: 'var(--status-safe)',
};

export default function AiBriefing() {
  const { aiDashboardBriefing: b } = usePonds();
  const color = SEV_COLOR[b.severity] || 'var(--status-info)';

  return (
    <section className="ai-briefing panel" style={{ borderTopColor: color }}>
      <div className="aib-head">
        <div className="aib-title">
          <span className="aib-chip mono">AI</span>
          <span>RINGKASAN PREDIKTIF — {aiModel.name}</span>
        </div>
        <span className="timestamp">dibuat {b.generatedAt} WITA</span>
      </div>

      <p className="aib-headline" style={{ color }}>{b.headline}</p>
      <p className="aib-body">{b.body}</p>

      <div className="aib-drivers">
        <div className="label-sm">Faktor Pendorong (model)</div>
        <ul>
          {b.keyDrivers.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </div>

      <div className="aib-foot">
        <span className="aib-conf mono">
          {b.recommendedFocus ? (
            <>Fokus rekomendasi: <strong>Pond {b.recommendedFocus}</strong></>
          ) : (
            <>Fokus rekomendasi: <strong>Semua Aman</strong></>
          )}
        </span>
        {b.recommendedFocus ? (
          <Link className="btn btn-primary aib-cta" to={`/pond/${b.recommendedFocus}`}>
            Buka Detail Pond {b.recommendedFocus} →
          </Link>
        ) : (
          <Link className="btn btn-primary aib-cta" to="/pond/B1">
            Buka Detail Pond B1 →
          </Link>
        )}
      </div>
    </section>
  );
}
