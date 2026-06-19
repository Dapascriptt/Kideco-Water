import { useMemo, useState } from 'react';
import { usePonds } from '../context/PondContext';
import AlertItem from '../components/AlertItem';

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };

export default function Alerts() {
  const { alerts, resolvedAlerts, resolveAlert } = usePonds();
  const [tab, setTab] = useState('active');
  const [pondFilter, setPondFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sort, setSort] = useState('time');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = (tab === 'active' ? alerts : resolvedAlerts).filter((a) => {
      if (pondFilter !== 'all' && a.pond !== pondFilter) return false;
      if (levelFilter !== 'all' && a.level !== levelFilter) return false;
      if (query && !(`${a.title} ${a.detail} ${a.pond}`.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
    list = [...list].sort((a, b) =>
      sort === 'severity'
        ? SEVERITY_ORDER[a.level] - SEVERITY_ORDER[b.level]
        : b.time.localeCompare(a.time)
    );
    return list;
  }, [tab, alerts, resolvedAlerts, pondFilter, levelFilter, query, sort]);

  return (
    <div className="alerts-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Pusat Peringatan</h1>
          <p className="page-sub">Semua peringatan aktif & histori penanganan di seluruh kolam</p>
        </div>
      </div>

      <div className="alerts-tabs">
        <button className={tab === 'active' ? 'at-tab active' : 'at-tab'} onClick={() => setTab('active')}>
          Aktif <span className="at-count mono">{alerts.length}</span>
        </button>
        <button className={tab === 'resolved' ? 'at-tab active' : 'at-tab'} onClick={() => setTab('resolved')}>
          Histori (24 jam) <span className="at-count mono">{resolvedAlerts.length}</span>
        </button>
      </div>

      <div className="alerts-filter panel">
        <select value={pondFilter} onChange={(e) => setPondFilter(e.target.value)}>
          <option value="all">Semua Kolam</option>
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((p) => <option key={p} value={p}>Pond {p}</option>)}
        </select>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
          <option value="all">Semua Level</option>
          <option value="critical">Kritis</option>
          <option value="warning">Waspada</option>
          <option value="info">Informasi</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="time">Urutkan: Waktu</option>
          <option value="severity">Urutkan: Keparahan</option>
        </select>
        <input
          type="text"
          placeholder="Cari peringatan…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="alerts-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            {tab === 'active' ? 'Tidak ada peringatan aktif' : 'Belum ada peringatan yang ditangani'}
          </div>
        ) : filtered.map((a) => (
          <AlertItem key={a.id} alert={a} onResolve={(id) => resolveAlert(id)} />
        ))}
      </div>
    </div>
  );
}
