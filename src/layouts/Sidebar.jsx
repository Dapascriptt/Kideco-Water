import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { usePonds } from '../context/PondContext';
import './Sidebar.css';

const NAV = [
  { to: '/', label: 'Dashboard', glyph: '▣', end: true },
  { to: '/overview', label: 'Peta Overview', glyph: '🗺' },
  { to: '/pond/B1', label: 'Detail Kolam', glyph: '⊞', match: '/pond' },
  { to: '/alerts', label: 'Peringatan', glyph: '⚑', badgeKey: 'alerts' },
  { to: '/compliance', label: 'Kepatuhan', glyph: '☑' },
  { to: '/sensors', label: 'Status Sensor', glyph: '📡' },
];

export default function Sidebar() {
  const { counts, criticalAlertCount, weather, rainfall, laNina } = usePonds();
  const { pathname } = useLocation();
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString('id-ID', { hour12: false }));

  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString('id-ID', { hour12: false })), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <span className="sb-logo mono">KIDECOWATER</span>
      </div>

      <div className="sb-live">
        <span className="sb-live-dot" />
        Live
        <span className="sb-clock mono">{clock} WITA</span>
      </div>

      <nav className="sb-nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              'sb-link' + ((isActive || (item.match && pathname.startsWith(item.match))) ? ' active' : '')
            }
          >
            <span className="sb-glyph">{item.glyph}</span>
            <span className="sb-label">{item.label}</span>
            {item.badgeKey === 'alerts' && criticalAlertCount > 0 && (
              <span className="sb-badge mono">{criticalAlertCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sb-section">
        <div className="sb-section-title label-sm">Kondisi Global</div>
        <div className="sb-cond">
          <span className="label-sm">Cuaca</span>
          <span className="mono">
            {weather === 'sunny' ? '☀️ Cerah' : weather === 'light_rain' ? '🌦️ Gerimis' : weather === 'moderate_rain' ? '🌧️ Sedang' : '⛈️ Lebat'} ({rainfall}mm/j)
          </span>
        </div>
        <div className="sb-cond">
          <span className="label-sm">La Niña</span>
          <span className="mono" style={{ color: laNina ? 'var(--status-warn)' : 'var(--text-secondary)' }}>
            {laNina ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
        <div className="sb-cond">
          <span className="label-sm">Kolam Kritis</span>
          <span className="mono" style={{ color: counts.critical ? 'var(--status-alert)' : 'var(--text-secondary)' }}>{counts.critical}</span>
        </div>
        <div className="sb-cond">
          <span className="label-sm">Kolam Waspada</span>
          <span className="mono" style={{ color: counts.warning ? 'var(--status-warn)' : 'var(--text-secondary)' }}>{counts.warning}</span>
        </div>
      </div>

      <div className="sb-footer mono">v1.0.0 — MVP Demo</div>
    </aside>
  );
}
