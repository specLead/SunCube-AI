
import { setAuth, clearAuth } from '../lib/authAdapter';

// --- CONFIG ---
const DUMMY_ACCEPT_ALL = false;

// --- SEED DATA (Simulated DB) ---
const USERS = [
  { id: 'demo-customer-1', email: 'demo@sun.cube', password: 'DemoPass!23', name: 'Demo Customer', role: 'Customer' },
  { id: 'demo-tech-1', email: 'tech@sun.cube', password: 'TechPass!23', name: 'Demo Technician', role: 'Technician' },
  { id: 'demo-admin-1', email: 'admin@sun.cube', password: 'AdminPass!23', name: 'Demo Admin', role: 'Admin' }
];

// --- API TYPES ---
export interface LoginRequest {
  email: string;
  password?: string;
  role: 'Customer' | 'Technician' | 'Admin';
}

export interface LoginResponse {
  token: string;
  role: string;
  redirect: string;
  user: { id: string; email: string; name: string };
  expiresAt: string;
}

// --- CLIENT SIDE SERVICE ---

export const login = async (creds: LoginRequest): Promise<LoginResponse> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    const response = await mockBackendLogin(creds);
    return response;
  } catch (err) {
    throw err;
  }
};

export const logout = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  clearAuth();
};


// --- SIMULATED BACKEND (Server Logic) ---

const mockBackendLogin = async (req: LoginRequest): Promise<LoginResponse> => {
  const { email, password, role } = req;
  
  let user = USERS.find(u => u.email === email);

  if (!DUMMY_ACCEPT_ALL) {
    if (!user || user.password !== password) {
       throw new Error('Invalid credentials');
    }
  } else {
    // If DUMMY_ACCEPT_ALL, create a mock user on the fly if not found
    if (!user) {
        user = { 
            id: `dev-${Date.now()}`, 
            email, 
            password: 'any', 
            name: email.split('@')[0], 
            role 
        };
    }
  }

  // Generate Dummy Token
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ id: user.id, email: user.email, role: role }));
  const signature = "dummy_signature_hash";
  const token = `${header}.${payload}.${signature}`;

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1h expiry

  // Determine Redirect
  let redirect = '/customer-dashboard';
  if (role === 'Technician') redirect = '/technician-dashboard';
  if (role === 'Admin') redirect = '/admin-dashboard';

  return {
    token,
    role,
    redirect,
    user: { id: user.id, email: user.email, name: user.name },
    expiresAt: expiresAt.toISOString()
  };
};

export const getDemoCredentials = (role: string) => {
    const u = USERS.find(u => u.role === role);
    return u ? { email: u.email, password: u.password } : { email: '', password: '' };
}
