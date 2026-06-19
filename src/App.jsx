import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PondProvider } from './context/PondContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Overview from './pages/Overview';
import PondDetail from './pages/PondDetail';
import Alerts from './pages/Alerts';
import Compliance from './pages/Compliance';
import Sensors from './pages/Sensors';

export default function App() {
  return (
    <PondProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/pond/:pondId" element={<PondDetail />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/sensors" element={<Sensors />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PondProvider>
  );
}
