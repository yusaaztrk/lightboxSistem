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
import CustomerOrderPage from './pages/CustomerOrderPage';
import GeneralSettings from './pages/admin/GeneralSettings';
import ProfileSettings from './pages/admin/ProfileSettings';
import BackingSettings from './pages/admin/BackingSettings';
import AdapterSettings from './pages/admin/AdapterSettings';
import ColorSettings from './pages/admin/ColorSettings';
import MemberSettings from './pages/admin/MemberSettings';
import DiscountCodesSettings from './pages/admin/DiscountCodesSettings';
import LayoutWrapper from './components/LayoutWrapper';

const App: React.FC = () => {
  return (
    <LayoutWrapper>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/lightbox" element={<LightboxConfigurator />} />
        <Route path="/fabric" element={<FabricConfigurator />} />
        <Route path="/order/:id" element={<CustomerOrderPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<OrdersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailsPage />} />

          {/* Settings Routes */}
          <Route path="general" element={<GeneralSettings />} />
          <Route path="profiles" element={<ProfileSettings />} />
          <Route path="backing" element={<BackingSettings />} />
          <Route path="adapters" element={<AdapterSettings />} />
          <Route path="colors" element={<ColorSettings />} />
          <Route path="discount-codes" element={<DiscountCodesSettings />} />
          <Route path="members" element={<MemberSettings />} />

          {/* Fallback for old settings route */}
          <Route path="settings" element={<Navigate to="/admin/general" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LayoutWrapper>
  );
};

export default App;
