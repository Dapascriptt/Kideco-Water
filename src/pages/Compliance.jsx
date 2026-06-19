import { useMemo, useState } from 'react';
import ComplianceChart from '../components/charts/ComplianceChart';
import {
  historyData, complianceData, QUALITY_STANDARDS, STANDARD_REF,
} from '../data/mockData';
import './Compliance.css';

const PAGE_SIZE = 25;
const PARAMS = ['pH', 'tss', 'fe', 'mn'];

function cellViolates(key, value) {
  const std = QUALITY_STANDARDS[key];
  if (!std) return false;
  if (std.max != null && value > std.max) return true;
  if (std.min != null && value < std.min) return true;
  return false;
}

export default function Compliance() {
  const [pondFilter, setPondFilter] = useState('all');
  const [from, setFrom] = useState('2026-06-19');
  const [to, setTo] = useState('2026-06-19');
  const [paramFilter, setParamFilter] = useState('all');
  const [sortKey, setSortKey] = useState('time');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    let list = historyData.filter((r) => pondFilter === 'all' || r.pond === pondFilter);
    list = [...list].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [pondFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const visibleParams = paramFilter === 'all' ? PARAMS : [paramFilter];

  const exportCSV = () => {
    const header = ['Waktu', 'Kolam', 'pH', 'TSS', 'Fe', 'Mn', 'Level', 'Kepatuhan'];
    const lines = rows.map((r) =>
      [r.time, r.pond, r.pH, r.tss, r.fe, r.mn, r.level, r.compliant ? 'SESUAI' : 'MELANGGAR'].join(',')
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kidecowater_kepatuhan_${pondFilter}_${from}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="compliance-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Riwayat & Kepatuhan</h1>
          <p className="page-sub">Log kualitas air untuk audit PROPER · {STANDARD_REF}</p>
        </div>
        <button className="btn btn-primary" onClick={exportCSV}>⬇ Export CSV</button>
      </div>

      <div className="cmp-filter panel">
        <label>Kolam
          <select value={pondFilter} onChange={(e) => { setPondFilter(e.target.value); setPage(1); }}>
            <option value="all">Semua Kolam</option>
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((p) => <option key={p} value={p}>Pond {p}</option>)}
          </select>
        </label>
        <label>Dari
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>Sampai
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <label>Parameter
          <select value={paramFilter} onChange={(e) => setParamFilter(e.target.value)}>
            <option value="all">Semua</option>
            <option value="pH">pH</option>
            <option value="tss">TSS</option>
            <option value="fe">Fe</option>
            <option value="mn">Mn</option>
          </select>
        </label>
      </div>

      <section className="panel">
        <div className="panel-head"><span>Data Historis Kualitas Air</span><span className="timestamp">{rows.length} baris</span></div>
        <div className="cmp-table-wrap">
          <table className="cmp-table">
            <thead>
              <tr>
                <Th label="Waktu" k="time" {...{ sortKey, sortDir, setSort }} />
                <Th label="Kolam" k="pond" {...{ sortKey, sortDir, setSort }} />
                {visibleParams.includes('pH') && <Th label="pH" k="pH" {...{ sortKey, sortDir, setSort }} />}
                {visibleParams.includes('tss') && <Th label="TSS" k="tss" {...{ sortKey, sortDir, setSort }} />}
                {visibleParams.includes('fe') && <Th label="Fe" k="fe" {...{ sortKey, sortDir, setSort }} />}
                {visibleParams.includes('mn') && <Th label="Mn" k="mn" {...{ sortKey, sortDir, setSort }} />}
                <Th label="Level" k="level" {...{ sortKey, sortDir, setSort }} />
                <th>Kepatuhan</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.time}</td>
                  <td>Pond {r.pond}</td>
                  {visibleParams.includes('pH') && <Cell k="pH" v={r.pH} />}
                  {visibleParams.includes('tss') && <Cell k="tss" v={r.tss} />}
                  {visibleParams.includes('fe') && <Cell k="fe" v={r.fe} />}
                  {visibleParams.includes('mn') && <Cell k="mn" v={r.mn} />}
                  <td className="mono">{r.level}%</td>
                  <td className={r.compliant ? 'cmp-ok' : 'cmp-bad'}>{r.compliant ? 'SESUAI' : 'MELANGGAR'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="cmp-pagination">
          <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Sebelumnya</button>
          <span className="mono">Halaman {page} / {totalPages}</span>
          <button className="btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Berikutnya →</button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><span>Kepatuhan Bulanan per Kolam (% waktu dalam baku mutu)</span></div>
        <div className="cmp-chart"><ComplianceChart data={complianceData} /></div>
      </section>
    </div>
  );
}

function Th({ label, k, sortKey, sortDir, setSort }) {
  const active = sortKey === k;
  return (
    <th className="cmp-th" onClick={() => setSort(k)}>
      {label} <span className="cmp-sort">{active ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}</span>
    </th>
  );
}

function Cell({ k, v }) {
  const bad = cellViolates(k, v);
  return <td className={`mono ${bad ? 'cmp-cell-bad' : ''}`}>{v}</td>;
}
