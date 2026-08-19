// ============================================================
// src/components/StartupGate.tsx - VERSION PRODUCTION
// ⭐ FANAPAHAN-KEVITRA TOKANA HO AN'NY NAVIGATION
// ⭐ Mamaky ny AuthContext ihany (License nesorina)
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface StartupGateProps {
  children?: React.ReactNode;
}

const StartupGate: React.FC<StartupGateProps> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  // ⭐ Mbola mitady ny Auth (License ihany no nesorina)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#6366F1]/30 border-t-[#6366F1]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl text-[#6366F1]">⚡</span>
            </div>
          </div>
          <p className="font-medium text-gray-500 dark:text-gray-400">
            Chargement de l'application...
          </p>
        </div>
      </div>
    );
  }

  // ⭐ 1. Efa niditra → /dashboard
  if (isAuthenticated) {
    console.log('🔀 [StartupGate] → /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // ⭐ 2. Tsy niditra → /login
  console.log('🔀 [StartupGate] → /login');
  return <Navigate to="/login" replace />;
};

export default StartupGate;