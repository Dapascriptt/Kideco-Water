import { useNavigate } from 'react-router-dom';
import { usePonds } from '../context/PondContext';
import SvgPondMap from '../components/SvgPondMap';
import StatusBadge from '../components/StatusBadge';
import './Overview.css';

const TREND_LABEL = { rising: 'Naik ▲', falling: 'Turun ▼', stable: 'Stabil ▬' };

export default function Overview() {
  const { ponds, counts, liveConnected, rainfall } = usePonds();
  const navigate = useNavigate();

  return (
    <div className="overview">
      <header className="ov-statusbar panel">
        <span className="ov-sb-item mono"><strong>{ponds.length}</strong> Kolam Aktif</span>
        <span className="ov-sb-sep" />
        <span className="ov-sb-counts">
          <span className="c-safe mono">{counts.safe} Aman</span>
          <span className="c-warn mono">{counts.warning} Waspada</span>
          <span className="c-alert mono">{counts.critical} Kritis</span>
        </span>
        <span className="ov-sb-right">
          <span className={`ov-live ${liveConnected ? 'on' : ''}`}><span className="ov-live-dot" />{liveConnected ? 'LIVE' : 'OFF'}</span>
          <span className="timestamp">sync {new Date().toLocaleTimeString('id-ID', { hour12: false })} WITA</span>
        </span>
      </header>

      <div className="page-head">
        <div>
          <h1 className="page-title">Peta Overview Kolam</h1>
          <p className="page-sub">Klik kolam untuk melihat detail, tren, dan rekomendasi AI</p>
        </div>
      </div>

      <div className="ov-grid">
        <div className="ov-map panel">
          <div className="panel-head"><span>Denah Settling Pond</span><span className="timestamp">curah hujan {rainfall}mm/jam</span></div>
          <div className="ov-map-inner">
            <SvgPondMap ponds={ponds} onSelectPond={(id) => navigate(`/pond/${id}`)} />
          </div>
        </div>

        <div className="ov-summary">
          <div className="section-title">Ringkasan Kolam</div>
          <div className="ov-cards">
            {ponds.map((p) => (
              <button key={p.id} className={`ov-card panel ov-${p.status}`} onClick={() => navigate(`/pond/${p.id}`)}>
                <div className="ov-card-top">
                  <span className="ov-card-name">{p.name}</span>
                  <StatusBadge status={p.status} size="sm" />
                </div>
                <div className="ov-card-row">
                  <span><span className="label-sm">pH</span> <span className="mono ov-strong">{p.pH.toFixed(1)}</span></span>
                  <span><span className="label-sm">Level</span> <span className="mono ov-strong">{Math.round(p.level)}%</span></span>
                </div>
                <div className="ov-card-foot">
                  <span className="label-sm">Tren: <span className="mono">{TREND_LABEL[p.trend]}</span></span>
                  <span className="timestamp">{p.lastUpdate}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
