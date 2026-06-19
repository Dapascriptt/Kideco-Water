import { createContext, useContext, useMemo, useState } from 'react';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { initialAlerts, resolvedAlerts as seedResolved } from '../data/mockData';

const PondContext = createContext(null);

export function PondProvider({ children }) {
  const ponds = useRealTimeData();
  const [selectedPond, setSelectedPond] = useState('B1');
  const [alerts, setAlerts] = useState(initialAlerts);
  const [resolvedAlerts, setResolvedAlerts] = useState(seedResolved);
  const [liveConnected] = useState(true);

  const resolveAlert = (id, operator = 'Operator') => {
    setAlerts((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) {
        setResolvedAlerts((r) => [
          { ...target, status: 'resolved',
            resolvedAt: new Date().toLocaleTimeString('id-ID', { hour12: false }),
            operator },
          ...r,
        ]);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const counts = useMemo(() => {
    const c = { safe: 0, warning: 0, critical: 0 };
    ponds.forEach((p) => { c[p.status] = (c[p.status] || 0) + 1; });
    return c;
  }, [ponds]);

  const criticalAlertCount = useMemo(
    () => alerts.filter((a) => a.level === 'critical' && a.status === 'active').length,
    [alerts]
  );

  const value = {
    ponds,
    alerts,
    resolvedAlerts,
    resolveAlert,
    selectedPond,
    setSelectedPond,
    liveConnected,
    counts,
    criticalAlertCount,
  };

  return <PondContext.Provider value={value}>{children}</PondContext.Provider>;
}

export function usePonds() {
  const ctx = useContext(PondContext);
  if (!ctx) throw new Error('usePonds must be used within PondProvider');
  return ctx;
}
