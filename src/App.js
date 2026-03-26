import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import POS from './pages/pos/POS';
import Products from './pages/products/Products';
import Categories from './pages/categories/Categories';
import Orders from './pages/orders/Orders';
import Users from './pages/users/Users';
import Stock from './pages/stock/Stock';
import Reports from './pages/Reports/Reports';

function Guard({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/pos" replace />;
  return children;
}

function Public({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'cashier' ? '/pos' : '/dashboard'} replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const defaultPath = user?.role === 'cashier' ? '/pos' : '/dashboard';
  return (
    <Routes>
      <Route path="/login" element={<Public><Login /></Public>} />
      <Route path="/dashboard" element={<Guard roles={['admin', 'manager']}><Dashboard /></Guard>} />
      <Route path="/pos" element={<Guard><POS /></Guard>} />
      <Route path="/orders" element={<Guard><Orders /></Guard>} />
      <Route path="/products" element={<Guard roles={['admin', 'manager']}><Products /></Guard>} />
      <Route path="/categories" element={<Guard roles={['admin', 'manager']}><Categories /></Guard>} />
      <Route path="/stock" element={<Guard roles={['admin', 'manager']}><Stock /></Guard>} />
      <Route path="/reports" element={<Guard roles={['admin', 'manager']}><Reports /></Guard>} />
      <Route path="/users" element={<Guard roles={['admin']}><Users /></Guard>} />
      <Route path="/" element={<Navigate to={defaultPath} replace />} />
      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a2235', color: '#f0f4ff', border: '1px solid #1e2d42', borderRadius: 10, fontSize: 13, fontFamily: "'Sora', sans-serif" },
          success: { iconTheme: { primary: '#10b981', secondary: '#1a2235' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1a2235' } },
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
