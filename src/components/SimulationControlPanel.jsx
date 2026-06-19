import { useState } from 'react';
import { usePonds } from '../context/PondContext';
import './SimulationControlPanel.css';

export default function SimulationControlPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    weather,
    rainfall,
    laNina,
    pumpsActive,
    simulationSpeed,
    changeWeather,
    applyLimeDosing,
    togglePump,
    resetSimulation,
    setSimulationSpeed,
    ponds,
  } = usePonds();

  const [dosingPond, setDosingPond] = useState('B1');
  const [dosingAmount, setDosingAmount] = useState(450);

  const handleApplyDosing = () => {
    applyLimeDosing(dosingPond, dosingAmount);
  };

  const getWeatherLabel = () => {
    if (weather === 'sunny') return '☀️ Cerah';
    if (weather === 'light_rain') return '🌦️ Gerimis';
    if (weather === 'moderate_rain') return '🌧️ Hujan Sedang';
    return '⛈️ Hujan Lebat (La Niña)';
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        className={`sim-panel-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Buka Panel Simulasi"
      >
        <span className="sim-toggle-icon">⚙️</span>
        <span className="sim-toggle-text">Panel Simulasi</span>
        {simulationSpeed > 0 && <span className="sim-live-indicator" />}
      </button>

      {/* Drawer Overlay */}
      {isOpen && <div className="sim-overlay" onClick={() => setIsOpen(false)} />}

      {/* Side Drawer Panel */}
      <div className={`sim-drawer ${isOpen ? 'open' : ''}`}>
        <div className="sim-drawer-header">
          <div>
            <h3>CONTROL PANEL SIMULASI</h3>
            <p className="label-sm">Uji Alur Kerja & Fisika Hidrologi KidecoWater</p>
          </div>
          <button className="sim-close-btn" onClick={() => setIsOpen(false)}>×</button>
        </div>

        <div className="sim-drawer-body">
          {/* Section: Status */}
          <div className="sim-section sim-status-card">
            <div className="sim-row">
              <span className="label-sm">Simulasi:</span>
              <span className={`sim-badge ${simulationSpeed > 0 ? 'online' : 'offline'}`}>
                {simulationSpeed === 0 ? '⏸️ PAUSED' : simulationSpeed === 5 ? '⚡ FAST (5x)' : '▶️ RUNNING (1x)'}
              </span>
            </div>
            <div className="sim-row">
              <span className="label-sm">Cuaca Aktif:</span>
              <span className="mono">{getWeatherLabel()}</span>
            </div>
            <div className="sim-row">
              <span className="label-sm">Curah Hujan:</span>
              <span className="mono">{rainfall} mm/jam</span>
            </div>
          </div>

          {/* Section: Speed Controls */}
          <div className="sim-section">
            <h4 className="sim-sec-title">Kecepatan Ticking</h4>
            <div className="sim-btn-group">
              <button 
                className={`sim-btn ${simulationSpeed === 0 ? 'active' : ''}`}
                onClick={() => setSimulationSpeed(0)}
              >
                ⏸️ Pause
              </button>
              <button 
                className={`sim-btn ${simulationSpeed === 1 ? 'active' : ''}`}
                onClick={() => setSimulationSpeed(1)}
              >
                ▶️ 1x Speed
              </button>
              <button 
                className={`sim-btn ${simulationSpeed === 5 ? 'active' : ''}`}
                onClick={() => setSimulationSpeed(5)}
              >
                ⚡ 5x Fast
              </button>
            </div>
          </div>

          {/* Section: Weather Simulator */}
          <div className="sim-section">
            <h4 className="sim-sec-title">Simulator Cuaca & Hujan</h4>
            <div className="sim-grid grid-2">
              <button 
                className={`sim-btn sim-weather-btn ${weather === 'sunny' ? 'active' : ''}`}
                onClick={() => changeWeather('sunny')}
              >
                ☀️ Cerah
                <span className="label-sm block">0 mm/jam</span>
              </button>
              <button 
                className={`sim-btn sim-weather-btn ${weather === 'light_rain' ? 'active' : ''}`}
                onClick={() => changeWeather('light_rain')}
              >
                🌦️ Gerimis
                <span className="label-sm block">5 mm/jam</span>
              </button>
              <button 
                className={`sim-btn sim-weather-btn ${weather === 'moderate_rain' ? 'active' : ''}`}
                onClick={() => changeWeather('moderate_rain')}
              >
                🌧️ Hujan Sedang
                <span className="label-sm block">20 mm/jam</span>
              </button>
              <button 
                className={`sim-btn sim-weather-btn ${weather === 'heavy_rain' ? 'active' : ''}`}
                onClick={() => changeWeather('heavy_rain')}
              >
                ⛈️ Hujan Lebat
                <span className="label-sm block">45 mm/jam</span>
              </button>
            </div>
          </div>

          {/* Section: Pompa & Transfer */}
          <div className="sim-section">
            <h4 className="sim-sec-title">Sakelar Pompa Pond B1</h4>
            <div className="sim-pump-control panel">
              <div className="sim-pump-row">
                <div>
                  <div className="sim-pump-title">Pompa B1 → B2 (800 m³/j)</div>
                  <div className="label-sm">Memindahkan air asam ke Pond B2</div>
                </div>
                <label className="sim-switch">
                  <input 
                    type="checkbox" 
                    checked={pumpsActive.B1_B2}
                    onChange={() => togglePump('B1_B2')}
                  />
                  <span className="sim-slider" />
                </label>
              </div>

              <div className="sim-pump-row">
                <div>
                  <div className="sim-pump-title">Pompa Cadangan (500 m³/j)</div>
                  <div className="label-sm">Pipa pembuangan darurat</div>
                </div>
                <label className="sim-switch">
                  <input 
                    type="checkbox" 
                    checked={pumpsActive.B1_aux}
                    onChange={() => togglePump('B1_aux')}
                  />
                  <span className="sim-slider" />
                </label>
              </div>
            </div>
          </div>

          {/* Section: Lime Dosing */}
          <div className="sim-section">
            <h4 className="sim-sec-title">Aksi Dosing Kapur (Manual)</h4>
            <div className="sim-dosing-control panel">
              <div className="sim-row-input">
                <label className="label-sm">Kolam Target:</label>
                <select value={dosingPond} onChange={(e) => setDosingPond(e.target.value)}>
                  {ponds.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (pH {p.pH.toFixed(1)})</option>
                  ))}
                </select>
              </div>

              <div className="sim-row-input">
                <label className="label-sm">Jumlah Kapur (kg):</label>
                <select value={dosingAmount} onChange={(e) => setDosingAmount(Number(e.target.value))}>
                  <option value={120}>120 kg (Siaga A2)</option>
                  <option value={250}>250 kg (Sedang)</option>
                  <option value={450}>450 kg (Optimal B1)</option>
                </select>
              </div>

              <button className="btn btn-primary w-100 sim-dose-btn" onClick={handleApplyDosing}>
                🧪 Terapkan Lime Dosing
              </button>
            </div>
          </div>

          {/* Section: Danger zone / Reset */}
          <div className="sim-section sim-reset-sec">
            <button className="btn btn-danger w-100" onClick={resetSimulation}>
              🔄 Reset Kondisi Awal
            </button>
            <p className="label-sm text-center">Mengembalikan data B1 kritis dan cuaca ekstrim</p>
          </div>
        </div>

        <div className="sim-drawer-footer label-sm mono">
          Kideco Water Systems · Hackathon KIC 2026
        </div>
      </div>
    </>
  );
}
