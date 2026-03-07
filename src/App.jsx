import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import MainDashboard from './views/MainDashboard';
import PlantsList from './views/PlantsList';
import PlantMap from './views/PlantMap';
import InvertersList from './views/InvertersList';
import PlantDetails from './views/PlantDetails';
import DeviceDetails from './views/DeviceDetails';
import SensorsList from './views/SensorsList';
import Alerts from './views/Alerts';
import Login from './views/Login';
import { VoiceProvider } from './contexts/VoiceContext';
import VoiceWidget from './components/VoiceWidget';
import './App.css';

// Simple Auth Wrapper
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Layout wrapper including VoiceWidget for authenticated views
const AuthLayout = () => {
  return (
    <VoiceProvider>
      <DashboardLayout />
      <VoiceWidget />
    </VoiceProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <AuthLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<MainDashboard />} />

          <Route path="plants" element={<PlantsList />} />
          <Route path="plants/:id" element={<PlantDetails />} />
          <Route path="map" element={<PlantMap />} />

          {/* Fixing the typo: routing /inverters directly to InvertersList */}
          <Route path="inverters" element={<InvertersList />} />
          <Route path="inverters/:id" element={<DeviceDetails />} />

          <Route path="sensors" element={<SensorsList />} />
          <Route path="alerts" element={<Alerts />} />

          <Route path="connectivity" element={<div className="page-title">Connectivity View</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
