import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LightboxConfigurator from './pages/LightboxConfigurator';
import FabricConfigurator from './pages/FabricConfigurator';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AdminSettings from './pages/AdminSettings';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/lightbox" element={<LightboxConfigurator />} />
      <Route path="/fabric" element={<FabricConfigurator />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Dashboard Routes */}
      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<OrdersPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
