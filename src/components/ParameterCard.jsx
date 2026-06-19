import { getComplianceStatus } from '../data/mockData';
import './ParameterCard.css';

const STATUS_COLOR = {
  safe: 'var(--status-safe)',
  warning: 'var(--status-warn)',
  critical: 'var(--status-alert)',
  unknown: 'var(--text-secondary)',
};

const TREND_GLYPH = { rising: '▲', falling: '▼', stable: '▬' };

/**
 * KPI card: big value, threshold-colored, with baku-mutu reference.
 * paramKey is one of: pH | tss | fe | mn (maps to QUALITY_STANDARDS)
 */
export default function ParameterCard({
  name, paramKey, value, unit, min, max, trend, trendNote,
}) {
  const status = getComplianceStatus(paramKey, value);
  const violating = status === 'critical';
  const color = STATUS_COLOR[status] || STATUS_COLOR.unknown;

  const limitText =
    min != null && max != null ? `${min} – ${max}`
    : max != null ? `≤ ${max}${unit ? ' ' + unit : ''}`
    : min != null ? `≥ ${min}` : '—';

  return (
    <div className="param-card panel">
      <div className="param-name label-sm">{name}</div>
      <div className="param-value mono" style={{ color }}>
        {typeof value === 'number' ? value.toFixed(paramKey === 'pH' ? 1 : (paramKey === 'tss' ? 0 : 1)) : value}
        {unit && <span className="param-unit unit"> {unit}</span>}
      </div>
      <div className="param-bar"><span style={{ background: color, width: barWidth(paramKey, value, max) }} /></div>
      <div className="param-footer">
        <span className="param-std">
          <span className="label-sm">Baku Mutu:</span> <span className="mono">{limitText}</span>
        </span>
        <span className={`param-flag ${violating ? 'flag-bad' : 'flag-ok'}`}>
          {violating ? 'MELANGGAR ✕' : 'SESUAI ✓'}
        </span>
      </div>
      {trend && (
        <div className="param-trend mono" style={{ color: trend === 'rising' ? 'var(--status-alert)' : trend === 'falling' ? 'var(--status-safe)' : 'var(--text-secondary)' }}>
          {TREND_GLYPH[trend]} {trendNote || trend}
        </div>
      )}
    </div>
  );
}

function barWidth(key, value, max) {
  if (key === 'pH') return `${Math.min(100, (value / 14) * 100)}%`;
  if (max) return `${Math.min(100, (value / max) * 100)}%`;
  return '50%';
}
