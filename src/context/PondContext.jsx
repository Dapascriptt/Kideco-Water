import { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import {
  initialPonds,
  initialAlerts,
  resolvedAlerts as seedResolved,
  historyData as seedHistory,
  phTrendByPond,
  levelInflowByPond,
  QUALITY_STANDARDS,
  getComplianceStatus
} from '../data/mockData';

const PondContext = createContext(null);

export function PondProvider({ children }) {
  // 1. Simulation controls state
  const [weather, setWeather] = useState('heavy_rain'); // 'sunny' | 'light_rain' | 'moderate_rain' | 'heavy_rain'
  const [rainfall, setRainfall] = useState(42); // mm/h
  const [laNina, setLaNina] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1); // 0=pause, 1=1x (5s), 5=5x (1s)
  
  // 2. Operational state
  const [ponds, setPonds] = useState(initialPonds);
  const [selectedPond, setSelectedPond] = useState('B1');
  const [pumpsActive, setPumpsActive] = useState({ B1_B2: false, B1_aux: false });
  const [alerts, setAlerts] = useState(initialAlerts);
  const [resolvedAlerts, setResolvedAlerts] = useState(seedResolved);
  const [historyData, setHistoryData] = useState(seedHistory);
  
  // 3. Gradual lime dosing reaction state (to make it feel realistic instead of sudden snap)
  // Maps pondId -> remaining ticks of reaction & amount applied
  const [dosingReactions, setDosingReactions] = useState({});

  // 4. Trend logs state (for graphs)
  const [trends, setTrends] = useState(() => {
    const ids = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const t = {};
    ids.forEach(id => {
      const phData = phTrendByPond[id] || phTrendByPond.default;
      const lvData = levelInflowByPond[id] || levelInflowByPond.default;
      t[id] = phData.map((item, idx) => {
        const lvItem = lvData[idx] || lvData[lvData.length - 1];
        return {
          time: item.time,
          pH: item.pH,
          level: lvItem.level,
          inflow: lvItem.inflow,
        };
      });
    });
    return t;
  });

  const tickCounter = useRef(0);

  // Helper: get current WITA clock
  const getClockString = () => {
    return new Date().toLocaleTimeString('id-ID', { hour12: false });
  };

  // Weather control action
  const changeWeather = (type) => {
    setWeather(type);
    if (type === 'sunny') {
      setRainfall(0);
      setLaNina(false);
    } else if (type === 'light_rain') {
      setRainfall(5);
      setLaNina(false);
    } else if (type === 'moderate_rain') {
      setRainfall(20);
      setLaNina(false);
    } else if (type === 'heavy_rain') {
      setRainfall(45);
      setLaNina(true);
    }
  };

  // Apply Dosing action
  const applyLimeDosing = (pondId, amountKg) => {
    setDosingReactions(prev => ({
      ...prev,
      [pondId]: {
        ticksRemaining: 3,
        amountKg,
      }
    }));
    
    // Immediately log operational note
    const stamp = getClockString();
    setHistoryData(prev => [
      {
        id: Math.max(...prev.map(r => r.id), 0) + 1,
        time: `${new Date().toISOString().split('T')[0]} ${stamp}`,
        pond: pondId,
        pH: ponds.find(p => p.id === pondId)?.pH || 7.0,
        tss: ponds.find(p => p.id === pondId)?.tss || 150,
        fe: ponds.find(p => p.id === pondId)?.fe || 2.0,
        mn: ponds.find(p => p.id === pondId)?.mn || 1.5,
        level: Math.round(ponds.find(p => p.id === pondId)?.level || 50),
        compliant: true,
        note: `Kapur ${amountKg} kg disemprotkan (penetralan aktif)`
      },
      ...prev
    ]);
  };

  // Toggle pump action
  const togglePump = (pumpKey) => {
    setPumpsActive(prev => {
      const next = { ...prev, [pumpKey]: !prev[pumpKey] };
      // Log operational action
      const stamp = getClockString();
      const actionName = next[pumpKey] ? "DIHIDUPKAN" : "DIMATIKAN";
      const pumpDesc = pumpKey === 'B1_B2' ? "Pompa Transfer B1 -> B2 (800 m³/jam)" : "Pompa Cadangan B1 (500 m³/jam)";
      
      setPonds(currentPonds => {
        const pB1 = currentPonds.find(p => p.id === 'B1');
        setHistoryData(h => [
          {
            id: Math.max(...h.map(r => r.id), 0) + 1,
            time: `${new Date().toISOString().split('T')[0]} ${stamp}`,
            pond: 'B1',
            pH: pB1?.pH || 5.4,
            tss: pB1?.tss || 430,
            fe: pB1?.fe || 7.9,
            mn: pB1?.mn || 4.6,
            level: Math.round(pB1?.level || 91),
            compliant: true,
            note: `${pumpDesc} ${actionName} oleh Operator`
          },
          ...h
        ]);
        return currentPonds;
      });

      return next;
    });
  };

  // Reset simulation action
  const resetSimulation = () => {
    setWeather('heavy_rain');
    setRainfall(42);
    setLaNina(true);
    setSimulationSpeed(1);
    setPonds(initialPonds);
    setPumpsActive({ B1_B2: false, B1_aux: false });
    setAlerts(initialAlerts);
    setResolvedAlerts(seedResolved);
    setDosingReactions({});
    // Reinitialize trends
    const ids = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const t = {};
    ids.forEach(id => {
      const phData = phTrendByPond[id] || phTrendByPond.default;
      const lvData = levelInflowByPond[id] || levelInflowByPond.default;
      t[id] = phData.map((item, idx) => {
        const lvItem = lvData[idx] || lvData[lvData.length - 1];
        return {
          time: item.time,
          pH: item.pH,
          level: lvItem.level,
          inflow: lvItem.inflow,
        };
      });
    });
    setTrends(t);
  };

  // Simulation physics loop
  useEffect(() => {
    if (simulationSpeed === 0) return;

    const intervalTime = simulationSpeed === 5 ? 1000 : 5000;

    const interval = setInterval(() => {
      tickCounter.current += 1;
      const stamp = getClockString();
      const datePrefix = new Date().toISOString().split('T')[0];

      // 1. Process Ponds updates
      setPonds((prevPonds) => {
        const nextPonds = prevPonds.map((pond) => {
          const next = { ...pond };
          const isB1 = pond.id === 'B1';
          const isA2 = pond.id === 'A2';
          const isB2 = pond.id === 'B2';

          // A. Calculate Inflow
          let baseInflow = 120;
          let rainMultiplier = 2;
          if (isB1) { baseInflow = 150; rainMultiplier = 23.3; }
          else if (isA2) { baseInflow = 180; rainMultiplier = 10; }
          else if (isB2) { baseInflow = 120; rainMultiplier = 1.5; }

          next.inflow = Math.round(baseInflow + rainfall * rainMultiplier);
          
          // B2 receives water transferred from B1
          if (isB2 && pumpsActive.B1_B2) {
            next.inflow += 800;
          }

          // B. Calculate Outflow
          let pumpOutflow = 0;
          if (isB1) {
            if (pumpsActive.B1_B2) pumpOutflow += 800;
            if (pumpsActive.B1_aux) pumpOutflow += 500;
          }

          // Gravity spillway discharge if level > 60%
          const gravityOutflow = pond.level > 60 ? Math.round((pond.level - 60) * 15) : 0;
          const totalOutflow = gravityOutflow + pumpOutflow;

          // C. Calculate Level Change (assume 5,000 m3 represents 10% level, i.e. 50,000 capacity)
          // level change = (inflow - outflow) * dt / capacity * 100
          // dt = 15 minutes of simulated time = 0.25 hours
          const dt = 0.25; 
          const volumeDelta = (next.inflow - totalOutflow) * dt;
          const levelDelta = (volumeDelta / pond.capacity) * 100;
          
          next.level = Math.max(10, Math.min(100, +(pond.level + levelDelta).toFixed(1)));

          // D. Process Lime Dosing Chemical Reactions
          let reactionPH = 0;
          let reactionFe = 0;
          let reactionMn = 0;

          if (dosingReactions[pond.id]) {
            const react = dosingReactions[pond.id];
            if (react.ticksRemaining > 0) {
              // Dosing reaction over 3 ticks
              // Total effect of 450kg kapur: +1.4 pH, -5.0 Fe, -3.0 Mn
              // Total effect of 120kg kapur: +0.6 pH, -2.0 Fe, -1.0 Mn
              const multiplier = react.amountKg / 450;
              reactionPH = +(0.47 * multiplier).toFixed(2);
              reactionFe = -(1.67 * multiplier).toFixed(2);
              reactionMn = -(1.0 * multiplier).toFixed(2);
              
              // Decrement remaining ticks
              setDosingReactions(prev => {
                const nextReact = { ...prev };
                if (nextReact[pond.id].ticksRemaining <= 1) {
                  delete nextReact[pond.id];
                } else {
                  nextReact[pond.id] = {
                    ...nextReact[pond.id],
                    ticksRemaining: nextReact[pond.id].ticksRemaining - 1
                  };
                }
                return nextReact;
              });
            }
          }

          // E. Calculate pH change
          if (reactionPH > 0) {
            next.pH = Math.min(8.5, +(pond.pH + reactionPH).toFixed(2));
          } else {
            // Under rain, pH decreases
            if (rainfall > 0) {
              const phDrop = isB1 ? 0.042 : isA2 ? 0.015 : 0.002;
              // Add slight random noise
              const noise = (Math.random() - 0.5) * 0.01;
              next.pH = Math.max(3.8, +(pond.pH - phDrop + noise).toFixed(2));
            } else {
              // Sunny, drifts back to neutral (e.g. 7.2)
              const driftDir = pond.pH < 7.2 ? 1 : pond.pH > 7.2 ? -1 : 0;
              next.pH = +(pond.pH + driftDir * 0.015).toFixed(2);
            }
          }

          // G. Calculate TSS, Fe, Mn changes
          if (reactionPH > 0) {
            next.fe = Math.max(0.5, +(pond.fe + reactionFe).toFixed(2));
            next.mn = Math.max(0.3, +(pond.mn + reactionMn).toFixed(2));
            // TSS settles out or spikes slightly then decreases
            next.tss = Math.max(120, Math.round(pond.tss - 30));
          } else {
            if (rainfall > 0) {
              const tssIncrease = isB1 ? 4 : isA2 ? 2 : 1;
              const feIncrease = isB1 ? 0.06 : isA2 ? 0.03 : 0.005;
              const mnIncrease = isB1 ? 0.03 : isA2 ? 0.015 : 0.003;
              next.tss = Math.min(600, pond.tss + tssIncrease + Math.round((Math.random() - 0.5) * 2));
              next.fe = Math.min(12, +(pond.fe + feIncrease + (Math.random() - 0.5) * 0.01).toFixed(2));
              next.mn = Math.min(6, +(pond.mn + mnIncrease + (Math.random() - 0.5) * 0.01).toFixed(2));
            } else {
              // Sunny settling
              next.tss = Math.max(100, pond.tss - 8);
              next.fe = Math.max(0.8, +(pond.fe - 0.1).toFixed(2));
              next.mn = Math.max(0.4, +(pond.mn - 0.05).toFixed(2));
            }
          }

          // H. Derive Status & Trend
          const checks = [
            getComplianceStatus('pH', next.pH),
            getComplianceStatus('tss', next.tss),
            getComplianceStatus('fe', next.fe),
            getComplianceStatus('mn', next.mn),
          ];
          if (next.level >= 90) checks.push('critical');
          else if (next.level >= 85) checks.push('warning');

          next.status = checks.includes('critical') ? 'critical' : (checks.includes('warning') ? 'warning' : 'safe');
          next.trend = next.pH < pond.pH - 0.005 ? 'falling' : (next.pH > pond.pH + 0.005 ? 'rising' : 'stable');
          next.lastUpdate = stamp;

          return next;
        });

        // 2. Append new points to Trends logs for each pond
        setTrends((prevTrends) => {
          const nextTrends = { ...prevTrends };
          nextPonds.forEach((p) => {
            const shortTime = stamp.substring(0, 5); // "HH:MM"
            const newPoint = {
              time: shortTime,
              pH: p.pH,
              level: Math.round(p.level),
              inflow: p.inflow,
            };
            const currentPondHistory = prevTrends[p.id] || [];
            // Append and slide window (keep last 12-15 entries)
            const updatedHistory = [...currentPondHistory, newPoint];
            if (updatedHistory.length > 15) {
              updatedHistory.shift();
            }
            nextTrends[p.id] = updatedHistory;
          });
          return nextTrends;
        });

        // 3. Dynamic Alerts Management
        setAlerts((prevAlerts) => {
          let updatedAlerts = [...prevAlerts];

          nextPonds.forEach((p) => {
            const isB1 = p.id === 'B1';
            const isA2 = p.id === 'A2';

            // Check B1 pH alert
            if (isB1) {
              const hasPHAlert = updatedAlerts.some(a => a.pond === 'B1' && a.title.includes('pH'));
              if (p.pH < 6.0 && !hasPHAlert) {
                updatedAlerts.push({
                  id: Math.max(...updatedAlerts.map(a => a.id), 0) + 1,
                  level: 'critical',
                  pond: 'B1',
                  title: 'pH di bawah baku mutu — tindakan segera',
                  detail: `pH saat ini ${p.pH.toFixed(1)} (batas minimum 6.0). Prediksi AI: terus menurun jika tidak ditangani.`,
                  time: stamp,
                  status: 'active'
                });
              } else if (p.pH >= 6.0 && hasPHAlert) {
                // Resolve the alert
                const alertIndex = updatedAlerts.findIndex(a => a.pond === 'B1' && a.title.includes('pH'));
                if (alertIndex !== -1) {
                  const resolved = {
                    ...updatedAlerts[alertIndex],
                    status: 'resolved',
                    resolvedAt: stamp,
                    operator: 'Operator (Dosing Kapur)'
                  };
                  setResolvedAlerts(r => [resolved, ...r]);
                  updatedAlerts.splice(alertIndex, 1);
                }
              }

              // Check B1 overflow alert
              const hasOverflowAlert = updatedAlerts.some(a => a.pond === 'B1' && a.title.includes('luapan'));
              if (p.level >= 90 && !hasOverflowAlert) {
                updatedAlerts.push({
                  id: Math.max(...updatedAlerts.map(a => a.id), 0) + 1,
                  level: 'critical',
                  pond: 'B1',
                  title: 'Risiko luapan dalam 3 jam',
                  detail: `Level kolam ${Math.round(p.level)}%. Inflow prediksi ${p.inflow} m³/jam akibat cuaca ekstrim.`,
                  time: stamp,
                  status: 'active'
                });
              } else if (p.level < 85 && hasOverflowAlert) {
                const alertIndex = updatedAlerts.findIndex(a => a.pond === 'B1' && a.title.includes('luapan'));
                if (alertIndex !== -1) {
                  const resolved = {
                    ...updatedAlerts[alertIndex],
                    status: 'resolved',
                    resolvedAt: stamp,
                    operator: 'Operator (Pumping/Transfer)'
                  };
                  setResolvedAlerts(r => [resolved, ...r]);
                  updatedAlerts.splice(alertIndex, 1);
                }
              }
            }

            if (isA2) {
              const hasA2PHAlert = updatedAlerts.some(a => a.pond === 'A2' && a.title.includes('pH'));
              if (p.pH < 6.0 && !hasA2PHAlert) {
                updatedAlerts.push({
                  id: Math.max(...updatedAlerts.map(a => a.id), 0) + 1,
                  level: 'critical',
                  pond: 'A2',
                  title: 'pH di bawah baku mutu',
                  detail: `pH A2 saat ini ${p.pH.toFixed(1)} (batas minimum 6.0).`,
                  time: stamp,
                  status: 'active'
                });
              } else if (p.pH >= 6.1 && hasA2PHAlert) {
                const alertIndex = updatedAlerts.findIndex(a => a.pond === 'A2' && a.title.includes('pH'));
                if (alertIndex !== -1) {
                  const resolved = {
                    ...updatedAlerts[alertIndex],
                    status: 'resolved',
                    resolvedAt: stamp,
                    operator: 'Operator (Dosing Kapur)'
                  };
                  setResolvedAlerts(r => [resolved, ...r]);
                  updatedAlerts.splice(alertIndex, 1);
                }
              }
            }
          });

          return updatedAlerts;
        });

        // 4. Periodically generate Audit compliance log (every 3 ticks)
        if (tickCounter.current % 3 === 0) {
          setHistoryData(prevHistory => {
            const newLogs = nextPonds.map((p, idx) => {
              const violating = p.pH < 6 || p.pH > 9 || p.tss > 400 || p.fe > 7 || p.mn > 4;
              return {
                id: Math.max(...prevHistory.map(h => h.id), 0) + idx + 1,
                time: `${datePrefix} ${stamp}`,
                pond: p.id,
                pH: p.pH,
                tss: p.tss,
                fe: p.fe,
                mn: p.mn,
                level: Math.round(p.level),
                compliant: !violating
              };
            });
            return [...newLogs, ...prevHistory];
          });
        }

        return nextPonds;
      });

    }, intervalTime);

    return () => clearInterval(interval);
  }, [simulationSpeed, weather, rainfall, pumpsActive, dosingReactions]);

  // Derived statistics
  const counts = useMemo(() => {
    const c = { safe: 0, warning: 0, critical: 0 };
    ponds.forEach((p) => { c[p.status] = (c[p.status] || 0) + 1; });
    return c;
  }, [ponds]);

  const criticalAlertCount = useMemo(
    () => alerts.filter((a) => a.level === 'critical' && a.status === 'active').length,
    [alerts]
  );

  // Dynamic AI Recommendation generator (re-calculated based on pond B1 status)
  const aiRecommendations = useMemo(() => {
    const pondB1 = ponds.find(p => p.id === 'B1');
    const pondA2 = ponds.find(p => p.id === 'A2');

    const recs = {
      B1: {
        pondId: 'B1',
        urgency: 'none',
        headline: 'KONDISI NORMAL',
        actions: [],
        impact: []
      },
      A2: {
        pondId: 'A2',
        urgency: 'none',
        headline: 'KONDISI NORMAL',
        actions: [],
        impact: []
      },
      default: {
        pondId: null,
        urgency: 'none',
        headline: 'KONDISI NORMAL',
        actions: [],
        impact: []
      }
    };

    if (pondB1) {
      const phViolated = pondB1.pH < 6.0;
      const levelViolated = pondB1.level >= 90;

      if (phViolated || levelViolated) {
        recs.B1.urgency = 'immediate';
        recs.B1.headline = 'TINDAKAN SEGERA DIPERLUKAN';
        
        if (phViolated) {
          recs.B1.actions.push({
            id: 'a1', priority: 1, icon: 'lime',
            title: 'Tambahkan Kapur (Lime Dosing)',
            lines: [
              'Dosis: 450 kg',
              `Estimasi: 45 menit hingga pH naik ke >6.0`,
              'Penghematan vs manual: 23% (~104 kg)',
            ]
          });
          recs.B1.impact.push({
            label: 'pH', from: pondB1.pH.toFixed(1), to: '6.8', window: 'dalam 2 menit', good: true
          });
        }
        if (levelViolated) {
          recs.B1.actions.push({
            id: 'a2', priority: 2, icon: 'pump',
            title: pumpsActive.B1_B2 ? 'Pompa Transfer Aktif (B1 → B2)' : 'Aktifkan Pompa Transfer → Pond B2',
            lines: [
              'Kapasitas: 800 m³/jam',
              'Volume transfer target: 3.200 m³',
              pumpsActive.B1_B2 ? 'Status: BERJALAN' : 'Status: MATI'
            ]
          });
          recs.B1.actions.push({
            id: 'a3', priority: 3, icon: 'pump',
            title: pumpsActive.B1_aux ? 'Pompa Cadangan Aktif' : 'Aktifkan Pompa Cadangan (P-B1-02)',
            lines: [
              'Mulai: Sekarang',
              pumpsActive.B1_aux ? 'Status: BERJALAN' : 'Status: MATI'
            ]
          });
          recs.B1.impact.push({
            label: 'Level', from: `${Math.round(pondB1.level)}%`, to: '76%', window: 'dalam 5 jam', good: true
          });
        }

        recs.B1.impact.push({
          label: 'Baku mutu terpenuhi', from: 'Tidak', to: 'Ya', window: '(estimasi)', good: true
        });
      }
    }

    if (pondA2) {
      if (pondA2.pH < 6.2) {
        recs.A2.urgency = 'monitor';
        recs.A2.headline = 'PANTAU KETAT';
        recs.A2.actions.push({
          id: 'b1', priority: 1, icon: 'lime',
          title: 'Siapkan Dosing Kapur (standby)',
          lines: [
            'Dosis siaga: 120 kg',
            'Picu otomatis jika pH < 6.0',
          ]
        });
        recs.A2.impact.push({
          label: 'pH', from: pondA2.pH.toFixed(1), to: '6.4', window: 'dalam 2 jam', good: true
        });
      }
    }

    return recs;
  }, [ponds, pumpsActive]);

  // Dynamic AI Forecast table based on weather & pump state
  const aiForecast = useMemo(() => {
    const pondB1 = ponds.find(p => p.id === 'B1');
    const pondA2 = ponds.find(p => p.id === 'A2');

    const genForecastRows = (p, isB1Pond) => {
      const rows = [];
      let tempPH = p.pH;
      let tempLevel = p.level;

      for (let h = 1; h <= 6; h++) {
        const timeStr = new Date(Date.now() + h * 3600000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        if (isB1Pond) {
          // Forecast pH
          if (tempPH < 6.0) {
            tempPH = Math.max(4.0, tempPH - 0.15);
          }
          // Forecast level
          let rate = 1200; // heavy rain inflow
          if (weather === 'sunny') rate = 150;
          else if (weather === 'light_rain') rate = 260;
          else if (weather === 'moderate_rain') rate = 615;

          const pumpOut = (pumpsActive.B1_B2 ? 800 : 0) + (pumpsActive.B1_aux ? 500 : 0);
          const volDelta = (rate - pumpOut - (tempLevel > 60 ? (tempLevel - 60) * 15 : 0));
          const lvlDelta = (volDelta / 50000) * 100;
          tempLevel = Math.max(10, Math.min(100, +(tempLevel + lvlDelta).toFixed(1)));

          const risk = tempLevel >= 95 ? 'emergency' : tempLevel >= 90 ? 'critical' : tempLevel >= 85 ? 'high' : 'normal';

          rows.push({
            time: timeStr,
            pH: +tempPH.toFixed(1),
            level: Math.round(tempLevel),
            risk,
            note: tempLevel >= 95 ? 'POTENSI LUAPAN' : null
          });
        } else {
          // default/other
          rows.push({
            time: timeStr,
            pH: +tempPH.toFixed(1),
            level: Math.round(tempLevel),
            risk: 'normal'
          });
        }
      }
      return rows;
    };

    return {
      B1: {
        pondId: 'B1',
        generatedAt: getClockString(),
        overflowProbability: weather === 'heavy_rain' && !pumpsActive.B1_B2 && !pumpsActive.B1_aux ? 0.87 : (weather === 'heavy_rain' ? 0.22 : 0.05),
        estimatedOverflowAt: weather === 'heavy_rain' && !pumpsActive.B1_B2 && !pumpsActive.B1_aux ? '17:20' : null,
        estimatedOverflowInHours: weather === 'heavy_rain' && !pumpsActive.B1_B2 && !pumpsActive.B1_aux ? 3 : null,
        confidence: 0.91,
        rows: pondB1 ? genForecastRows(pondB1, true) : []
      },
      A2: {
        pondId: 'A2',
        generatedAt: getClockString(),
        overflowProbability: weather === 'heavy_rain' ? 0.18 : 0.02,
        estimatedOverflowAt: null,
        estimatedOverflowInHours: null,
        confidence: 0.84,
        rows: pondA2 ? genForecastRows(pondA2, false) : []
      },
      default: {
        pondId: null,
        generatedAt: getClockString(),
        overflowProbability: 0.04,
        estimatedOverflowAt: null,
        estimatedOverflowInHours: null,
        confidence: 0.88,
        rows: genForecastRows({ pH: 7.2, level: 60 }, false)
      }
    };
  }, [ponds, weather, pumpsActive]);

  // Dynamic AI Dashboard narrative briefing
  const aiDashboardBriefing = useMemo(() => {
    const pondB1 = ponds.find(p => p.id === 'B1');
    const pondA2 = ponds.find(p => p.id === 'A2');
    
    const isB1Critical = pondB1 && pondB1.status === 'critical';
    const isA2Warning = pondA2 && pondA2.status === 'warning';
    
    let severity = 'safe';
    let headline = 'Semua kolam aman dan mematuhi batas baku mutu.';
    let body = 'Seluruh kolam pengendapan berfungsi optimal. KidecoWater AI memproyeksikan kepatuhan baku mutu 100% dalam 6 jam ke depan.';
    
    if (isB1Critical) {
      severity = 'critical';
      const reason = pondB1.pH < 6.0 && pondB1.level >= 90 
        ? 'pH asam (<6.0) dan level air kritis (>90%)'
        : (pondB1.pH < 6.0 ? 'pH asam (<6.0)' : 'level air kritis (>90%)');
      
      headline = '1 kolam (Pond B1) dalam kondisi kritis dengan risiko pelanggaran.';
      body = `Pond B1 mengalami ${reason} akibat limpasan hujan ${rainfall} mm/jam. Model memprediksi luapan dalam ~3 jam jika pompa tidak diaktifkan. Harap jalankan rekomendasi dosing kapur 450 kg dan hidupkan pompa transfer.`;
    } else if (isA2Warning) {
      severity = 'warning';
      headline = 'Pond A2 mendekati batas baku mutu pH rendah.';
      body = 'Pond A2 saat ini berstatus waspada dengan pH mendekati 6.0. Harap siapkan dosing kapur cadangan jika terjadi penurunan lebih lanjut.';
    }

    return {
      generatedAt: getClockString(),
      model: 'KidecoWater-Hydro Forecaster',
      severity,
      headline,
      body,
      keyDrivers: [
        `Intensitas curah hujan terpantau pada ${rainfall} mm/jam`,
        pondB1 && pondB1.pH < 6.0 ? 'Oksidasi mineral pirit (AAT) menurunkan alkalinitas' : 'Alkalinitas kolam stabil',
        pumpsActive.B1_B2 ? 'Pompa transfer aktif mengurangi beban B1' : 'Penyangga kolam menyempit'
      ],
      recommendedFocus: isB1Critical ? 'B1' : (isA2Warning ? 'A2' : null)
    };
  }, [ponds, rainfall, pumpsActive]);

  const value = {
    ponds,
    alerts,
    resolvedAlerts,
    resolveAlert: (id, operator = 'Operator') => {
      setAlerts((prev) => {
        const target = prev.find((a) => a.id === id);
        if (target) {
          setResolvedAlerts((r) => [
            { ...target, status: 'resolved', resolvedAt: getClockString(), operator },
            ...r,
          ]);
        }
        return prev.filter((a) => a.id !== id);
      });
    },
    selectedPond,
    setSelectedPond,
    liveConnected: simulationSpeed > 0,
    counts,
    criticalAlertCount,
    
    // Simulator states & actions
    weather,
    rainfall,
    laNina,
    pumpsActive,
    simulationSpeed,
    historyData,
    trends,
    aiRecommendations,
    aiForecast,
    aiDashboardBriefing,
    
    changeWeather,
    applyLimeDosing,
    togglePump,
    resetSimulation,
    setSimulationSpeed
  };

  return <PondContext.Provider value={value}>{children}</PondContext.Provider>;
}

export function usePonds() {
  const ctx = useContext(PondContext);
  if (!ctx) throw new Error('usePonds must be used within PondProvider');
  return ctx;
}
