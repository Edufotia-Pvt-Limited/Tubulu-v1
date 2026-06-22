import { useEffect, useReducer, useCallback, useMemo, useRef } from 'react';
// utils
import axios, { endpoints } from 'src/utils/axios';
//
import { AuthContext } from './auth-context';
import { isValidToken, setSession } from './utils';
import { ActionMapType, AuthStateType, AuthUserType } from '../../types';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
}

type Payload = {
  [Types.INITIAL]: {
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  user: null,
  loading: true,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === Types.REGISTER) {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Holds auth data temporarily while user is on the set-pin screen
  const pendingSession = useRef<null | { authToken: string; user: any }>(null);

  const initialize = useCallback(async () => {
    try {
      // Primary: sessionStorage (JWT auth flow)
      let accessToken = sessionStorage.getItem(STORAGE_KEY);

      // Fallback: localStorage tubulu_session (OTP login screen flow)
      if (!accessToken) {
        const tubuluSession = localStorage.getItem('tubulu_session');
        if (tubuluSession) {
          try {
            const session = JSON.parse(tubuluSession);
            accessToken = session.authToken;
          } catch (e) {
            console.warn('Could not parse tubulu_session:', e);
          }
        }
      }

      // If there's a pending PIN setup, don't auto-login — wait for PIN to be set
      const pendingPin = sessionStorage.getItem('pendingPinSetup');
      if (pendingPin === 'true') {
        dispatch({ type: Types.INITIAL, payload: { user: null } });
        return;
      }

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        // Check localStorage session for role/phone first (faster & reliable)
        const tubuluSession = localStorage.getItem('tubulu_session');
        let sessionData: any = null;
        if (tubuluSession) {
          try { sessionData = JSON.parse(tubuluSession); } catch (e) { /* ignore */ }
        }

        let user = null;
        try {
          const res = await axios.get(endpoints.auth.me);
          user = res.data?.data || res.data?.user || res.data;
        } catch (error: any) {
          console.warn('Profile fetch failed, using session data fallback', error);
          if (error.response?.status === 401) {
            setSession(null);
            dispatch({
              type: Types.INITIAL,
              payload: { user: null },
            });
            window.location.href = '/';
            return;
          }
        }

        let role = sessionData?.role || 'merchant_admin';
        try {
          const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
          role = sessionData?.role || tokenPayload.role || 'merchant_admin';
        } catch (e) {
          // ignore
        }

        const finalRole = sessionData?.role || user?.role || role;
        const finalPhoneNumber = sessionData?.phoneNumber || user?.phoneNumber || sessionData?.username;

        dispatch({
          type: Types.INITIAL,
          payload: {
            user: {
              ...user,
              role: finalRole,
              phoneNumber: finalPhoneNumber,
            },
          },
        });
      } else {
        dispatch({
          type: Types.INITIAL,
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      dispatch({
        type: Types.INITIAL,
        payload: {
          user: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // SEND OTP
  const sendOtp = useCallback(async (phoneNumber: string, forgotPin: boolean = false) => {
    const data = { phoneNumber, forgotPin };
    const res = await axios.post(endpoints.auth.register, data);
    return {
      hasPin: res.data?.hasPin === true,
    };
  }, []);

  // VERIFY OTP (LOGIN)
  const verifyOtp = useCallback(async (phoneNumber: string, otp: string, forgotPin: boolean = false) => {
    const data = { phoneNumber, code: otp, forgotPin };

    const res = await axios.post(endpoints.auth.verify, data);

    const responseData = res.data?.data || res.data;
    const authToken = responseData?.authToken;
    const role = responseData?.role || responseData?.user?.role || 'merchant_admin';
    const finalPhoneNumber = responseData?.phoneNumber || responseData?.user?.phoneNumber || phoneNumber;
    const requiresPinSetup = res.data?.requiresPinSetup === true;

    if (!authToken) {
      throw new Error('Auth token not received');
    }

    const userData = {
      ...responseData,
      ...(responseData?.user || {}),
      role,
      phoneNumber: finalPhoneNumber,
    };

    if (requiresPinSetup) {
      // Return token + user to the login view — it will call finalizeLogin after PIN is saved.
      // Don't touch sessionStorage or dispatch LOGIN yet.
      // Set axios header temporarily so the /set-pin API call can work.
      axios.defaults.headers.common.Authorization = `Bearer ${authToken}`;
      return { requiresPinSetup: true, authToken, user: userData };
    }

    // No PIN setup needed — finalize session immediately
    setSession(authToken);
    dispatch({ type: Types.LOGIN, payload: { user: userData } });
    return { requiresPinSetup: false };
  }, []);

  // VERIFY PIN
  const verifyPin = useCallback(async (phoneNumber: string, pin: string) => {
    const data = { phoneNumber, pin };
    const res = await axios.post(endpoints.auth.verifyPin, data);

    const responseData = res.data?.data || res.data;
    const authToken = responseData?.authToken;
    const role = responseData?.role || responseData?.user?.role || 'merchant_admin';
    const finalPhoneNumber = responseData?.phoneNumber || responseData?.user?.phoneNumber || phoneNumber;

    if (!authToken) {
      throw new Error('Auth token not received');
    }

    setSession(authToken);

    dispatch({
      type: Types.LOGIN,
      payload: {
        user: {
          ...responseData,
          ...(responseData?.user || {}),
          role,
          phoneNumber: finalPhoneNumber,
        },
      },
    });
  }, []);

  // SET PIN — called by login view. Saves PIN using the temp token stored in pendingSession.
  const setPin = useCallback(async (pin: string) => {
    await axios.post(endpoints.auth.setPin, { pin });
    // Remove the pending flag and finalize the session
    sessionStorage.removeItem('pendingPinSetup');
    if (pendingSession.current) {
      dispatch({
        type: Types.LOGIN,
        payload: { user: pendingSession.current.user },
      });
      pendingSession.current = null;
    }
  }, []);

  // FINALIZE LOGIN — called by login view after PIN setup. Accepts pre-fetched auth data.
  const finalizeLogin = useCallback((authToken: string, user: AuthUserType) => {
    sessionStorage.removeItem('pendingPinSetup');
    setSession(authToken);
    dispatch({ type: Types.LOGIN, payload: { user } });
  }, []);

  // LOGIN (Legacy)
  const login = useCallback(async (email: string, password: string) => {
    // Keep for compatibility if needed, but we use verifyOtp now
    console.warn('Standard login called, use verifyOtp instead');
  }, []);

  // ADMIN LOGIN
  const adminLogin = useCallback(async (username: string, password: string) => {
    const data = { username, password };
    const res = await axios.post(endpoints.auth.adminLogin, data);

    const responseData = res.data?.data || res.data;
    const authToken = responseData?.authToken;
    const role = responseData?.role || 'super_admin';

    if (!authToken) {
      throw new Error('Auth token not received');
    }

    setSession(authToken);

    dispatch({
      type: Types.LOGIN,
      payload: {
        user: {
          ...responseData,
          ...(responseData?.user || {}),
          role,
          phoneNumber: responseData?.phoneNumber || responseData?.username || '',
        },
      },
    });
  }, []);

  // REGISTER
  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      const data = {
        email,
        password,
        firstName,
        lastName,
      };

      const res = await axios.post(endpoints.auth.register, data);

      const { accessToken, user } = res.data;

      sessionStorage.setItem(STORAGE_KEY, accessToken);

      dispatch({
        type: Types.REGISTER,
        payload: {
          user,
        },
      });
    },
    []
  );

  // LOGOUT
  const logout = useCallback(async () => {
    sessionStorage.removeItem('pendingPinSetup');
    setSession(null);
    // Remove the guest settings key so pre-login theme changes don't persist
    // across sessions. User-specific keys (settings-<role>-<id>) are intentionally
    // preserved so each user's theme preference is restored on their next login.
    localStorage.removeItem('settings-guest');
    dispatch({
      type: Types.LOGOUT,
    });
    // Hard redirect to ensure clean state and show login screen
    window.location.href = '/';
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      adminLogin,
      sendOtp,
      verifyOtp,
      verifyPin,
      setPin,
      finalizeLogin,
      register,
      logout,
      refreshUser: initialize,
    }),
    [login, adminLogin, logout, register, sendOtp, verifyOtp, verifyPin, setPin, finalizeLogin, state.user, status, initialize]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
