import './SensorCard.css';

const STATUS_META = {
  online:      { label: 'Online',      color: 'var(--status-safe)' },
  offline:     { label: 'Offline',     color: 'var(--status-alert)' },
  calibrating: { label: 'Kalibrasi',   color: 'var(--status-info)' },
  timeout:     { label: 'Timeout',     color: 'var(--status-warn)' },
};

// signal bars from dBm (-50 best .. -100 worst)
function signalBars(dbm) {
  if (dbm == null) return 0;
  if (dbm >= -65) return 5;
  if (dbm >= -72) return 4;
  if (dbm >= -80) return 3;
  if (dbm >= -90) return 2;
  return 1;
}

export default function SensorCard({ sensor }) {
  // Sensor not reporting > 5 min is treated as timeout
  const effectiveStatus =
    sensor.status === 'offline' ? 'offline' : sensor.status;
  const meta = STATUS_META[effectiveStatus] || STATUS_META.online;
  const bars = signalBars(sensor.signal);
  const batLow = sensor.battery <= 20;
  const calibSoon = sensor.nextCalibrationDays <= 3;

  return (
    <div className="sensor-card panel">
      <div className="sensor-id mono">{sensor.id}</div>
      <div className="sensor-type label-sm">{sensor.type} · Pond {sensor.pond}</div>

      <div className="sensor-row">
        <span className="label-sm">Status</span>
        <span className="sensor-status" style={{ color: meta.color }}>
          <span className="sensor-dot" style={{ background: meta.color }} />
          {meta.label}
        </span>
      </div>

      <div className="sensor-row">
        <span className="label-sm">Signal</span>
        <span className="sensor-signal">
          <span className="bars">
            {[1, 2, 3, 4, 5].map((b) => (
              <i key={b} className={b <= bars ? 'on' : ''} style={{ height: 3 + b * 2 }} />
            ))}
          </span>
          <span className="mono">{sensor.signal != null ? `${sensor.signal} dBm` : '— '} </span>
          <span className="unit">LoRaWAN</span>
        </span>
      </div>

      <div className="sensor-row">
        <span className="label-sm">Baterai</span>
        <span className="sensor-bat">
          <span className="bat-track"><span style={{ width: `${sensor.battery}%`, background: batLow ? 'var(--status-alert)' : 'var(--status-safe)' }} /></span>
          <span className="mono" style={{ color: batLow ? 'var(--status-alert)' : 'inherit' }}>{sensor.battery}%</span>
        </span>
      </div>

      <div className="sensor-row">
        <span className="label-sm">Update</span>
        <span className="mono sensor-muted">{sensor.lastUpdate}</span>
      </div>

      <div className="sensor-divider" />

      <div className="sensor-row">
        <span className="label-sm">Nilai terakhir</span>
        <span className="mono sensor-value">
          {sensor.lastValue != null ? `${sensor.lastValue} ${sensor.unit}` : '— tidak tersedia'}
        </span>
      </div>
      <div className="sensor-row">
        <span className="label-sm">Kalibrasi</span>
        <span className="mono sensor-muted">{sensor.calibratedDaysAgo} hari lalu</span>
      </div>
      <div className="sensor-row">
        <span className="label-sm">Kalibrasi berikut</span>
        <span className="mono" style={{ color: calibSoon ? 'var(--status-warn)' : 'var(--text-secondary)' }}>
          {sensor.nextCalibrationDays <= 0 ? 'Segera' : `${sensor.nextCalibrationDays} hari lagi`}
        </span>
      </div>

      <button className="btn sensor-btn">Riwayat Kalibrasi</button>
    </div>
  );
}
