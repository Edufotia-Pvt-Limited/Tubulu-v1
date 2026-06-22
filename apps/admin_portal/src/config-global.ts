// routes
import { paths } from 'src/routes/paths';

// API
// ----------------------------------------------------------------------

const resolveHostApi = () => {
  const envValue = import.meta.env.VITE_HOST_API;
  if (envValue && !envValue.includes('localhost')) {
    return envValue;
  }
  return `${window.location.protocol}//${window.location.hostname}:3008`;
};

const resolveAssetsApi = () => {
  const envValue = import.meta.env.VITE_ASSETS_API;
  if (envValue && !envValue.includes('localhost')) {
    return envValue;
  }
  return `${window.location.protocol}//${window.location.hostname}:3008`;
};

export const HOST_API = resolveHostApi();
export const ASSETS_API = resolveAssetsApi();

export const FIREBASE_API = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const AMPLIFY_API = {
  userPoolId: import.meta.env.VITE_AWS_AMPLIFY_USER_POOL_ID,
  userPoolWebClientId: import.meta.env.VITE_AWS_AMPLIFY_USER_POOL_WEB_CLIENT_ID,
  region: import.meta.env.VITE_AWS_AMPLIFY_REGION,
};

export const AUTH0_API = {
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  callbackUrl: import.meta.env.VITE_AUTH0_CALLBACK_URL,
};

export const MAPBOX_API = import.meta.env.VITE_MAPBOX_API;

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.root; // as '/dashboard'
