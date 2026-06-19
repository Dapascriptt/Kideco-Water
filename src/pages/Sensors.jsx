import { sensors } from '../data/mockData';
import SensorCard from '../components/SensorCard';

export default function Sensors() {
  const online = sensors.filter((s) => s.status === 'online').length;
  const offline = sensors.filter((s) => s.status === 'offline').length;
  const calibrating = sensors.filter((s) => s.status === 'calibrating').length;

  return (
    <div className="sensors-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Status Sensor IoT</h1>
          <p className="page-sub">Kesehatan node sensor LoRaWAN di lapangan</p>
        </div>
        <div className="sensors-summary">
          <span className="ss-item ss-online mono">{online} Online</span>
          <span className="ss-item ss-calib mono">{calibrating} Kalibrasi</span>
          <span className="ss-item ss-offline mono">{offline} Offline</span>
        </div>
      </div>

      {sensors.length === 0 ? (
        <div className="empty-state">Tidak ada node sensor terdaftar</div>
      ) : (
        <div className="sensors-grid">
          {sensors.map((s) => <SensorCard key={s.id} sensor={s} />)}
        </div>
      )}
    </div>
  );
}
