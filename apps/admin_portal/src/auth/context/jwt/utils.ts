// routes
import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

function jwtDecode(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.parse(jsonPayload);
}

// ----------------------------------------------------------------------

export const isValidToken = (accessToken: string) => {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);
    // If there's no exp field, treat as valid (some backend tokens don't set it)
    if (!decoded.exp) {
      return true;
    }
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (e) {
    // If we can't decode the token, assume it's valid and let the API decide
    return true;
  }
};

// ----------------------------------------------------------------------

export const tokenExpired = (exp: number) => {
  if (!exp) return;

  let expiredTimer: ReturnType<typeof setTimeout>;

  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  if (timeLeft <= 0) return;

  clearTimeout(expiredTimer!);

  expiredTimer = setTimeout(() => {
    localStorage.removeItem('tubulu_session');
    sessionStorage.removeItem('accessToken');
    window.location.href = '/'; // Redirect to app root login, NOT /auth/jwt/login
  }, timeLeft);
};

// ----------------------------------------------------------------------

export const setSession = (accessToken: string | null) => {
  if (accessToken) {
    sessionStorage.setItem('accessToken', accessToken);

    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    try {
      const { exp } = jwtDecode(accessToken);
      tokenExpired(exp);
    } catch (e) {
      // ignore decode errors
    }
  } else {
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('tubulu_session');
    delete axios.defaults.headers.common.Authorization;
  }
};
