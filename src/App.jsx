import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import MainDashboard from './views/MainDashboard';
import PlantsList from './views/PlantsList';
import PlantMap from './views/PlantMap';
import InvertersList from './views/InvertersList';
import DeviceDetails from './views/DeviceDetails';
import SensorsList from './views/SensorsList';
import Alerts from './views/Alerts';
import { VoiceProvider } from './contexts/VoiceContext';
import VoiceWidget from './components/VoiceWidget';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <VoiceProvider>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<MainDashboard />} />
            <Route path="plants" element={<PlantsList />} />
            <Route path="map" element={<PlantMap />} />
            <Route path="inverters" element={<PlantsList />} />
            <Route path="inverters/:id" element={<DeviceDetails />} />
            <Route path="sensors" element={<SensorsList />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="connectivity" element={<div className="page-title">Connectivity View</div>} />
          </Route>
        </Routes>
        <VoiceWidget />
      </VoiceProvider>
    </BrowserRouter>
  );
}

export default App;
