import { useEffect, useRef, useState } from 'react';
import { initialPonds, getComplianceStatus } from '../data/mockData';

// Derive an overall status from current parameter values.
function deriveStatus(p) {
  const checks = [
    getComplianceStatus('pH', p.pH),
    getComplianceStatus('tss', p.tss),
    getComplianceStatus('fe', p.fe),
    getComplianceStatus('mn', p.mn),
  ];
  if (p.level >= 90) checks.push('critical');
  else if (p.level >= 85) checks.push('warning');
  if (checks.includes('critical')) return 'critical';
  if (checks.includes('warning')) return 'warning';
  return 'safe';
}

function nowWITA() {
  // Simulated WITA clock string HH:mm:ss
  return new Date().toLocaleTimeString('id-ID', { hour12: false });
}

/**
 * Simulates a live sensor feed. Every 5s nudges each pond's values
 * with small random variation; the critical pond (B1) keeps trending
 * (pH down, level up) for a realistic worsening scenario.
 */
export function useRealTimeData() {
  const [ponds, setPonds] = useState(initialPonds);
  const tick = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      tick.current += 1;
      const stamp = nowWITA();
      setPonds((prev) =>
        prev.map((pond) => {
          const critical = pond.status === 'critical';
          const next = { ...pond };

          next.pH = critical
            ? Math.max(4.0, +(pond.pH - Math.random() * 0.05).toFixed(2))
            : +(pond.pH + (Math.random() - 0.5) * 0.03).toFixed(2);

          next.level = critical
            ? Math.min(99, +(pond.level + Math.random() * 0.3).toFixed(1))
            : +Math.max(20, pond.level + (Math.random() - 0.5) * 0.2).toFixed(1);

          next.tss = critical
            ? Math.round(pond.tss + Math.random() * 5)
            : Math.max(60, Math.round(pond.tss + (Math.random() - 0.5) * 6));

          next.fe = critical
            ? +(pond.fe + Math.random() * 0.05).toFixed(2)
            : +Math.max(0.3, pond.fe + (Math.random() - 0.5) * 0.06).toFixed(2);

          next.mn = critical
            ? +(pond.mn + Math.random() * 0.03).toFixed(2)
            : +Math.max(0.2, pond.mn + (Math.random() - 0.5) * 0.04).toFixed(2);

          next.trend =
            next.pH < pond.pH - 0.005 ? 'falling'
            : next.pH > pond.pH + 0.005 ? 'rising'
            : 'stable';

          // status is derived for non-critical ponds; B1 stays critical
          next.status = critical ? 'critical' : deriveStatus(next);
          next.lastUpdate = stamp;
          return next;
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return ponds;
}
