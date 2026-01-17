import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import OrdersPage from './pages/OrdersPage';
import SettingsPage from './pages/SettingsPage';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<OrdersPage />} /> {/* Default to orders */}
          <Route path="orders" element={<OrdersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
