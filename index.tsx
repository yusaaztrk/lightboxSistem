import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import OrdersPage from './pages/OrdersPage';
import AdminSettings from './pages/AdminSettings';
import './index.css';
import { initThemeMode } from './services/theme';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

initThemeMode();

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
