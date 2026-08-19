// ============================================================
// src/components/ProtectedRoute.tsx - VERSION SELLORA
// ⭐ AUTH GUARD fotsiny
// ⭐ Tsy mijery licence intsony (efa fantatra avy amin'ny AppBootstrap)
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6366F1]/30 border-t-[#6366F1]"></div>
          <p className="font-medium text-gray-500 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔒 [ProtectedRoute] Non authentifié → /login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;