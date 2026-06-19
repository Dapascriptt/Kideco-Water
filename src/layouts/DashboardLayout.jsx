import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import SimulationControlPanel from '../components/SimulationControlPanel';
import './DashboardLayout.css';

export default function DashboardLayout() {
  return (
    <div className="dash-shell">
      <Sidebar />
      <main className="dash-main">
        <Outlet />
      </main>
      <SimulationControlPanel />
    </div>
  );
}
