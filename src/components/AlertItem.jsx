import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const LEVEL_TO_STATUS = { critical: 'critical', warning: 'warning', info: 'info' };

export default function AlertItem({ alert, onResolve }) {
  const status = LEVEL_TO_STATUS[alert.level] || 'info';
  return (
    <div className={`alert-item ai-${alert.level}`}>
      <div className="alert-bar" />
      <div className="alert-body">
        <div className="alert-top">
          <StatusBadge status={status} size="sm" />
          <span className="alert-title">
            <strong>Pond {alert.pond}</strong> — {alert.title}
          </span>
          <span className="alert-time timestamp">{alert.time}</span>
        </div>
        <p className="alert-detail">{alert.detail}</p>
        <div className="alert-actions">
          <Link className="btn alert-btn" to={`/pond/${alert.pond}`}>Lihat Detail</Link>
          {alert.status === 'resolved' ? (
            <span className="alert-resolved mono">
              Ditangani {alert.resolvedAt} oleh {alert.operator}
            </span>
          ) : (
            <button className="btn alert-btn" onClick={() => onResolve?.(alert.id)}>
              {alert.level === 'info' ? 'Abaikan' : 'Tandai Ditangani'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
