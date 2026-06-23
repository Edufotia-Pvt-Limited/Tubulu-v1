import { LogoutOptions, RedirectLoginOptions, PopupLoginOptions } from '@auth0/auth0-react';

// ----------------------------------------------------------------------

export type ActionMapType<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type AuthUserType = {
  id: string;
  phoneNumber: string;
  role: 'super_admin' | 'SuperAdmin' | 'admin' | 'merchant_admin' | 'user' | 'regional_manager' | 'state_manager' | 'city_manager' | 'ops_admin' | 'onboarding_specialist' | 'content_moderator' | 'finance_admin' | 'regional_partner' | 'merchant' | 'ops_manager' | 'enabler';
  createdByUserId?: string;
  merchantId?: string;
  name?: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  scopedCityId?: string | null;
  scopedStateId?: string | null;
  scopedCountryId?: string | null;
  gstNumber?: string;
  panNumber?: string;
  aadharNumber?: string;
  isDocumentsUploaded?: boolean;
  isTubuluAppSetupDone?: boolean;
  isApproved?: boolean;
  integrationName?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  logo?: string;
  _id?: string;
  isOnboarded?: boolean;
  emailVerified?: boolean;
} | null;

export type AuthStateType = {
  status?: string;
  loading: boolean;
  user: AuthUserType;
};

// ----------------------------------------------------------------------

type CanRemove = {
  login?: (email: string, password: string) => Promise<void>;
  register?: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  //
  loginWithGoogle?: () => Promise<void>;
  loginWithGithub?: () => Promise<void>;
  loginWithTwitter?: () => Promise<void>;
  //
  loginWithPopup?: (options?: PopupLoginOptions) => Promise<void>;
  loginWithRedirect?: (options?: RedirectLoginOptions) => Promise<void>;
  //
  confirmRegister?: (email: string, code: string) => Promise<void>;
  forgotPassword?: (email: string) => Promise<void>;
  resendCodeRegister?: (email: string) => Promise<void>;
  newPassword?: (email: string, code: string, password: string) => Promise<void>;
};

export type JWTContextType = CanRemove & {
  user: AuthUserType;
  method: string;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  sendOtp: (phoneNumber: string, forgotPin?: boolean) => Promise<{ hasPin: boolean }>;
  verifyOtp: (phoneNumber: string, otp: string, forgotPin?: boolean) => Promise<{ requiresPinSetup: boolean; authToken?: string; user?: any }>;
  verifyPin: (phoneNumber: string, pin: string) => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  finalizeLogin: (authToken: string, user: any) => void;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export type FirebaseContextType = CanRemove & {
  user: AuthUserType;
  method: string;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithTwitter: () => Promise<void>;
  forgotPassword?: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
};

export type AmplifyContextType = CanRemove & {
  user: AuthUserType;
  method: string;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  login: (email: string, password: string) => Promise<unknown>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<unknown>;
  logout: () => Promise<unknown>;
  confirmRegister: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resendCodeRegister: (email: string) => Promise<void>;
  newPassword: (email: string, code: string, password: string) => Promise<void>;
};

// ----------------------------------------------------------------------

export type Auth0ContextType = CanRemove & {
  user: AuthUserType;
  method: string;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  loginWithPopup: (options?: PopupLoginOptions) => Promise<void>;
  loginWithRedirect: (options?: RedirectLoginOptions) => Promise<void>;
  logout: (options?: LogoutOptions) => Promise<void>;
};
