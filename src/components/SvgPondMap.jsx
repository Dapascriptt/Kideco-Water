const FILL = {
  safe: 'var(--safe-fill)',
  warning: 'var(--warn-fill)',
  critical: 'var(--alert-fill)',
};
const STROKE = {
  safe: 'var(--status-safe)',
  warning: 'var(--status-warn)',
  critical: 'var(--status-alert)',
};

// Fixed layout positions for the 6 ponds on a top-down mine plan.
const LAYOUT = {
  A1: { x: 70,  y: 70,  w: 150, h: 95 },
  A2: { x: 250, y: 70,  w: 150, h: 95 },
  B1: { x: 430, y: 70,  w: 150, h: 95 },
  B2: { x: 70,  y: 210, w: 150, h: 95 },
  C1: { x: 250, y: 210, w: 150, h: 95 },
  C2: { x: 430, y: 210, w: 150, h: 95 },
};

export default function SvgPondMap({ ponds, onSelectPond }) {
  return (
    <svg className="pond-map" viewBox="0 0 650 360" preserveAspectRatio="xMidYMid meet">
      {/* terrain backdrop */}
      <rect x="0" y="0" width="650" height="360" fill="var(--bg-inset)" />
      {/* channel lines between pond rows */}
      <line x1="20" y1="185" x2="630" y2="185" stroke="var(--border)" strokeWidth="2" strokeDasharray="6 6" />
      <text x="24" y="28" className="map-legend">DENAH KOLAM PENGENDAPAN — PIT KIDECO</text>

      {ponds.map((p) => {
        const L = LAYOUT[p.id];
        if (!L) return null;
        const fillW = (L.w - 16) * (p.level / 100);
        return (
          <g
            key={p.id}
            className={`pond-shape ${p.status === 'critical' ? 'pulse' : ''}`}
            onClick={() => onSelectPond(p.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectPond(p.id)}
          >
            {/* basin */}
            <rect
              x={L.x} y={L.y} width={L.w} height={L.h} rx="6"
              fill={FILL[p.status]} fillOpacity="0.7"
              stroke={STROKE[p.status]} strokeWidth="2"
            />
            {/* level fill (water) at bottom */}
            <rect
              x={L.x + 8} y={L.y + L.h - 14} width={fillW} height="6" rx="3"
              fill={STROKE[p.status]} fillOpacity="0.9"
            />
            <text x={L.x + 10} y={L.y + 24} className="pond-name">{p.name}</text>
            <text x={L.x + 10} y={L.y + 42} className="pond-metric mono">pH {p.pH.toFixed(1)}</text>
            <text x={L.x + L.w - 10} y={L.y + 42} textAnchor="end" className="pond-metric mono">{Math.round(p.level)}%</text>
          </g>
        );
      })}
    </svg>
  );
}
