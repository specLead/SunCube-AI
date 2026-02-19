
export const AUTH_KEY = 'suncube_auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface AuthState {
  token: string;
  role: string;
  user: User;
  expiresAt: string;
}

export const getAuth = (): AuthState | null => {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse auth state', e);
    return null;
  }
};

export const getToken = (): string | null => {
  const auth = getAuth();
  return auth ? auth.token : null;
};

export const getRole = (): string | null => {
  const auth = getAuth();
  return auth ? auth.role : null;
};

export const setAuth = (authObj: AuthState): void => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(authObj));
};

export const clearAuth = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = (): boolean => {
  const auth = getAuth();
  if (!auth) return false;
  // Basic expiry check
  const now = new Date();
  const expires = new Date(auth.expiresAt);
  return now < expires;
};
