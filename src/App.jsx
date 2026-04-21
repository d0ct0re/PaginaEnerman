import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Páginas
import LandingPage from './pages/LandingPage';
import CatalogoPage from './pages/CatalogoPage';
import PedidoPage from './pages/PedidoPage';
import AccesoPage from './pages/AccesoPage';
import RegisterPage from './pages/RegisterPage';
import MisCotizacionesPage from './pages/MisCotizacionesPage';
import AdminGatePage from './pages/AdminGatePage';
import AdminAuthPage from './pages/AdminAuthPage';
import AdminPage from './pages/AdminPage';
import CotizaPage from './pages/CotizaPage';

function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E0B11E] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAdmin) return <AccesoPage />;
  return children;
}

function useCarritoLocal() {
  const [carrito, setCarritoRaw] = useState(() => {
    try {
      const saved = localStorage.getItem('enerman_carrito');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const setCarrito = useCallback((updater) => {
    setCarritoRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('enerman_carrito', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return [carrito, setCarrito];
}

function AppRoutes() {
  const [carrito, setCarrito] = useCarritoLocal();
  return (
    <Routes>
      <Route path="/"         element={<LandingPage />} />
      <Route path="/catalogo" element={<CatalogoPage carrito={carrito} setCarrito={setCarrito} />} />
      <Route path="/pedido"   element={<PedidoPage   carrito={carrito} setCarrito={setCarrito} />} />
      <Route path="/acceso"   element={<AccesoPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/cotiza"   element={<CotizaPage />} />
      <Route path="/mis-cotizaciones" element={
        <ProtectedRoute>
          <MisCotizacionesPage setCarrito={setCarrito} />
        </ProtectedRoute>
      } />
      {/* Acceso admin multi-paso — URLs no publicadas */}
      <Route path="/enr-gate"      element={<AdminGatePage />} />
      <Route path="/enr-admin-auth" element={<AdminAuthPage />} />
      <Route path="/enr-admin" element={
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={<Navigate to="/catalogo" replace />} />
      <Route path="/login" element={<Navigate to="/catalogo" replace />} />
      <Route path="*"      element={<Navigate to="/catalogo" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
