const LABELS = {
  safe: 'AMAN',
  warning: 'WASPADA',
  critical: 'KRITIS',
  info: 'INFO',
};

export default function StatusBadge({ status, size = 'md' }) {
  const label = LABELS[status] || status?.toUpperCase() || '—';
  return (
    <span className={`status-badge sb-${status} sb-${size}`}>
      <span className="sb-dot" />
      {label}
    </span>
  );
}
