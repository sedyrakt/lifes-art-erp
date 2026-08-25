// ============================================================
// src/components/StartupGate.tsx
// ⭐ LIFE'S ART ERP
// ⭐ INITIAL ROUTING ONLY
// ⭐ FIX: Rehefa tsy misy license, dia manao redirection any amin'ny /license
// ============================================================

import React, {
  useEffect,
  useRef,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  useAuth,
} from '../contexts/AuthContext';

import {
  useLicense,
} from '../contexts/LicenseContext';

import {
  Loader2,
} from 'lucide-react';

// ============================================================
// COMPONENT
// ============================================================

const StartupGate: React.FC = () => {
  const navigate = useNavigate();

  const {
    user,
    isLoading: authLoading,
  } = useAuth();

  const {
    status: licenseStatus,
    isValid: licenseIsValid,
    isLoading: licenseLoading,
    refresh: refreshLicense, // ⭐ FIX: Ampidirina ny refreshLicense
  } = useLicense();

  const redirectedRef = useRef(false);

  // ==========================================================
  // REFRESH LICENSE AU DÉMARRAGE
  // ==========================================================

  useEffect(() => {
    // ⭐ FIX: Refresher ny license rehefa monté
    refreshLicense();
  }, [refreshLicense]);

  // ==========================================================
  // STARTUP ROUTING
  // ==========================================================

  useEffect(() => {
    if (redirectedRef.current) {
      return;
    }

    // ========================================================
    // WAIT LICENSE
    // ========================================================

    if (licenseLoading) {
      return;
    }

    // ========================================================
    // WAIT AUTH
    // ========================================================

    if (authLoading) {
      return;
    }

    redirectedRef.current = true;

    // ========================================================
    // NO LICENSE - ⭐ FIX: Miverina any amin'ny /license
    // ========================================================

    if (
      licenseStatus !== 'VALID' ||
      !licenseIsValid
    ) {
      console.log(
        '🔐 [StartupGate] Licence invalide → /license'
      );

      navigate('/license', {
        replace: true,
      });

      return;
    }

    // ========================================================
    // LICENSE OK + NO USER
    // ========================================================

    if (!user) {
      console.log(
        '🔑 [StartupGate] Licence OK → /login'
      );

      navigate('/login', {
        replace: true,
      });

      return;
    }

    // ========================================================
    // LICENSE OK + AUTH OK
    // ========================================================

    console.log(
      '🚀 [StartupGate] Licence + Auth OK → /dashboard'
    );

    navigate('/dashboard', {
      replace: true,
    });
  }, [
    licenseLoading,
    licenseStatus,
    licenseIsValid,
    authLoading,
    user,
    navigate,
  ]);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-rose-500" />

        <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          Vérification de la licence...
        </p>
      </div>
    </div>
  );
};

export default StartupGate;