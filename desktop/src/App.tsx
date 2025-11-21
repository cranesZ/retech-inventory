import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Orders from './pages/Orders';
import OrderCreate from './pages/OrderCreate';
import Invoices from './pages/Invoices';
import InvoiceCreate from './pages/InvoiceCreate';
import OfferAnalysis from './pages/OfferAnalysis';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customers" element={<Customers />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/new" element={<OrderCreate />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/new" element={<InvoiceCreate />} />
          <Route path="offer-analysis" element={<OfferAnalysis />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
