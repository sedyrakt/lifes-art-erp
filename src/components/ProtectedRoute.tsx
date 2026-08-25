// ============================================================
// src/components/ProtectedRoute.tsx
// ⭐ LIFE'S ART ERP
// ⭐ AUTH GUARD ONLY
// ⭐ NO LICENSE LOGIC
// ============================================================

import React from 'react';

import {
  Navigate,
} from 'react-router-dom';

import {
  useAuth,
} from '../contexts/AuthContext';

// ============================================================
// TYPES
// ============================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// ============================================================
// COMPONENT
// ============================================================

const ProtectedRoute: React.FC<
  ProtectedRouteProps
> = ({ children }) => {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  // ==========================================================
  // AUTH LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#6366F1]/30 border-t-[#6366F1]" />

          <p className="font-medium text-gray-500 dark:text-gray-400">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // NOT AUTHENTICATED
  // ==========================================================

  if (!isAuthenticated) {
    console.log(
      '🔒 [ProtectedRoute] Non authentifié → /login'
    );

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ==========================================================
  // AUTHENTICATED
  // ==========================================================

  return <>{children}</>;
};

export default ProtectedRoute;