// ============================================================
// src/contexts/LicenseContext.tsx
// ⭐ FIX: TSY MAMPISAO useNavigate (mampiasa window.location.hash)
// ⭐ FIX: MANAMPY INTERVAL CHECK (60 segondra)
// ⭐ FIX: REDIRECTION AUTOMATIQUE ANY AMIN'NY /license
// ============================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

// ============================================================
// TYPES
// ============================================================

export type LicenseStatus =
  | 'UNKNOWN'
  | 'VALID'
  | 'INVALID'
  | 'EXPIRED';

export interface LicenseState {
  status: LicenseStatus;
  isValid: boolean;
  isActive: boolean;
  packageType: string | null;
  packageName: string;
  licenseKey: string | null;
  daysRemaining: number;
  minutesRemaining: number | null;
  isTest: boolean;
  isLifetime: boolean;
  expirationDate: string | null;
  isLoading: boolean;
  error: string | null;
}

interface LicenseContextType extends LicenseState {
  refresh: () => Promise<void>;
  activateWithCode: (
    code: string
  ) => Promise<{
    success: boolean;
    message?: string;
    data?: any;
  }>;
  reset: () => Promise<void>;
  isLicenseValid: () => boolean;
}

// ============================================================
// INITIAL STATE
// ============================================================

const initialState: LicenseState = {
  status: 'UNKNOWN',
  isValid: false,
  isActive: false,
  packageType: null,
  packageName: 'Aucune licence',
  licenseKey: null,
  daysRemaining: 0,
  minutesRemaining: null,
  isTest: false,
  isLifetime: false,
  expirationDate: null,
  isLoading: true,
  error: null,
};

// ============================================================
// CONTEXT
// ============================================================

const LicenseContext = createContext<
  LicenseContextType | undefined
>(undefined);

// ============================================================
// HOOK
// ============================================================

export const useLicense = (): LicenseContextType => {
  const context = useContext(LicenseContext);

  if (!context) {
    throw new Error(
      'useLicense must be used within LicenseProvider'
    );
  }

  return context;
};

// ============================================================
// PROVIDER
// ============================================================

export const LicenseProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, setState] =
    useState<LicenseState>(initialState);

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const initializedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================================
  // MOUNT / UNMOUNT
  // ==========================================================

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ==========================================================
  // BUILD STATE FROM API RESULT
  // ==========================================================

  const buildStateFromResult = useCallback(
    (result: any): LicenseState => {
      console.log(
        '📌 [LicenseContext] License API result:',
        result
      );

      if (!result) {
        return {
          ...initialState,
          status: 'UNKNOWN',
          isLoading: false,
          error: 'Réponse licence vide',
        };
      }

      // ⭐ FIX: Raha tsy misy ny licence, dia resetta ny state
      if (!result.exists) {
        console.log('❌ [LicenseContext] Aucune licence trouvée - RESET STATE');
        return {
          ...initialState,
          status: 'UNKNOWN',
          isValid: false,
          isActive: false,
          isLoading: false,
          error: null,
        };
      }

      if (!result.isValid) {
        const status: LicenseStatus =
          result.status === 'EXPIRED'
            ? 'EXPIRED'
            : 'INVALID';

        return {
          ...initialState,
          status,
          isValid: false,
          isActive: false,
          packageType:
            result.packageType || null,
          packageName:
            result.packageName ||
            result.packageType ||
            'Licence invalide',
          licenseKey:
            result.licenseKey || null,
          daysRemaining:
            Number(result.daysRemaining) || 0,
          minutesRemaining:
            result.minutesRemaining != null
              ? Number(result.minutesRemaining)
              : null,
          isTest: Boolean(result.isTest),
          isLifetime: Boolean(result.isLifetime),
          expirationDate:
            result.expirationDate || null,
          isLoading: false,
          error:
            result.message ||
            'Licence invalide ou expirée',
        };
      }

      return {
        status: 'VALID',
        isValid: true,
        isActive: true,
        packageType:
          result.packageType || null,
        packageName:
          result.packageName ||
          result.packageType ||
          'Licence',
        licenseKey:
          result.licenseKey || null,
        daysRemaining:
          Number(result.daysRemaining) || 0,
        minutesRemaining:
          result.minutesRemaining != null
            ? Number(result.minutesRemaining)
            : null,
        isTest: Boolean(result.isTest),
        isLifetime: Boolean(result.isLifetime),
        expirationDate:
          result.expirationDate || null,
        isLoading: false,
        error: null,
      };
    },
    []
  );

  // ==========================================================
  // CHECK LICENSE STATUS
  // ==========================================================

  const checkLicenseStatus = useCallback(
    async (): Promise<LicenseState> => {
      try {
        if (!window.api?.license?.checkStatus) {
          console.warn(
            '⚠️ [LicenseContext] license.checkStatus indisponible'
          );

          return {
            ...initialState,
            status: 'UNKNOWN',
            isLoading: false,
            error:
              'API license.checkStatus non disponible',
          };
        }

        const result =
          await window.api.license.checkStatus();

        return buildStateFromResult(result);
      } catch (error: any) {
        console.error(
          '❌ [LicenseContext] checkLicenseStatus:',
          error
        );

        return {
          ...initialState,
          status: 'UNKNOWN',
          isLoading: false,
          error:
            error?.message ||
            'Erreur de vérification de la licence',
        };
      }
    },
    [buildStateFromResult]
  );

  // ==========================================================
  // REFRESH
  // ⭐ PROTECTED AGAINST RACE CONDITIONS
  // ⭐ FIX: Mampiasa window.location.hash fa tsy useNavigate
  // ==========================================================

  const refresh = useCallback(async (): Promise<void> => {
    const currentRequestId =
      ++requestIdRef.current;

    if (mountedRef.current) {
      setState((prev) => ({
        ...prev,
        isLoading: true,
      }));
    }

    const newState =
      await checkLicenseStatus();

    if (!mountedRef.current) {
      return;
    }

    if (
      currentRequestId !==
      requestIdRef.current
    ) {
      console.log(
        '⏭️ [LicenseContext] Ancienne requête ignorée:',
        currentRequestId
      );

      return;
    }

    console.log(
      '✅ [LicenseContext] State license appliqué:',
      newState
    );

    setState(newState);

    // ⭐ FIX: Raha tsy valid na tsy active ny licence, dia redirect
    if (!newState.isValid || !newState.isActive) {
      console.log('🚨 [LicenseContext] Licence invalide - redirection vers /license');
      window.location.hash = '#/license';
    }
  }, [checkLicenseStatus]);

  // ==========================================================
  // INITIAL CHECK
  // ⭐ UNE SEULE FOIS
  // ==========================================================

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    console.log(
      '🚀 [LicenseContext] Initial license check'
    );

    refresh();
  }, [refresh]);

  // ==========================================================
  // ⭐ FIX: INTERVAL CHECK - ISAKY 60 SEGONDA
  // ==========================================================

  useEffect(() => {
    // Raha tsy misy interval, dia mamorona
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        console.log('⏰ [LicenseContext] Interval check - refresh');
        refresh();
      }, 60000); // ⭐ 60 segondra (azonao ovaina ho 300000 raha 5 minitra)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refresh]);

  // ==========================================================
  // ACTIVATE WITH CODE
  // ==========================================================

  const activateWithCode = useCallback(
    async (
      code: string
    ): Promise<{
      success: boolean;
      message?: string;
      data?: any;
    }> => {
      if (!code?.trim()) {
        return {
          success: false,
          message:
            "Veuillez saisir le code d'activation",
        };
      }

      if (
        !window.api?.license?.activateWithCode
      ) {
        return {
          success: false,
          message:
            'API license.activateWithCode non disponible',
        };
      }

      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));
      }

      try {
        console.log(
          '🔐 [LicenseContext] Activation...'
        );

        const result =
          await window.api.license.activateWithCode(
            code.trim()
          );

        console.log(
          '📌 [LicenseContext] Activation result:',
          result
        );

        if (!result?.success) {
          if (mountedRef.current) {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error:
                result?.message ||
                "Code d'activation invalide",
            }));
          }

          return {
            success: false,
            message:
              result?.message ||
              "Code d'activation invalide",
            data: result?.data,
          };
        }

        // ======================================================
        // IMPORTANT
        // Invalider les anciennes requêtes.
        // ======================================================

        requestIdRef.current++;

        // ======================================================
        // Recheck après activation
        // ======================================================

        const newState =
          await checkLicenseStatus();

        if (!mountedRef.current) {
          return {
            success: true,
            message:
              result.message ||
              'Licence activée avec succès',
            data: result.data,
          };
        }

        setState({
          ...newState,
          isLoading: false,
        });

        console.log(
          '🎉 [LicenseContext] Licence activée:',
          newState
        );

        return {
          success: true,
          message:
            result.message ||
            'Licence activée avec succès',
          data: result.data,
        };
      } catch (error: any) {
        console.error(
          '❌ [LicenseContext] Activation:',
          error
        );

        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error:
              error?.message ||
              "Erreur lors de l'activation",
          }));
        }

        return {
          success: false,
          message:
            error?.message ||
            "Erreur lors de l'activation",
        };
      }
    },
    [checkLicenseStatus]
  );

  // ==========================================================
  // RESET
  // ==========================================================

  const reset = useCallback(async (): Promise<void> => {
    if (
      !window.api?.license?.reset
    ) {
      console.error(
        '❌ [LicenseContext] license.reset indisponible'
      );

      return;
    }

    if (mountedRef.current) {
      setState((prev) => ({
        ...prev,
        isLoading: true,
      }));
    }

    try {
      await window.api.license.reset();

      requestIdRef.current++;

      if (mountedRef.current) {
        setState({
          ...initialState,
          isLoading: false,
        });
      }

      console.log(
        '🗑️ [LicenseContext] Licence reset'
      );
    } catch (error: any) {
      console.error(
        '❌ [LicenseContext] Reset:',
        error
      );

      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error?.message ||
            'Erreur lors du reset',
        }));
      }
    }
  }, []);

  // ==========================================================
  // IS LICENSE VALID
  // ==========================================================

  const isLicenseValid = useCallback((): boolean => {
    return (
      state.status === 'VALID' &&
      state.isValid === true &&
      state.isActive === true
    );
  }, [
    state.status,
    state.isValid,
    state.isActive,
  ]);

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const contextValue: LicenseContextType = {
    ...state,
    refresh,
    activateWithCode,
    reset,
    isLicenseValid,
  };

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <LicenseContext.Provider
      value={contextValue}
    >
      {children}
    </LicenseContext.Provider>
  );
};

export default LicenseProvider;