
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { LoginScreen } from './components/LoginScreen';
import { TechnicianDashboard } from './components/TechnicianDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { isAuthenticated, getRole } from './lib/authAdapter';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    
    // Initial Auth Check & Redirect Logic
    const path = window.location.pathname;
    const isAuth = isAuthenticated();

    if (path === '/' || path === '') {
        if (isAuth) {
            const role = getRole();
            if (role === 'Technician') {
                window.history.replaceState({}, '', '/technician-dashboard');
                setCurrentPath('/technician-dashboard');
            } else if (role === 'Admin') {
                window.history.replaceState({}, '', '/admin-dashboard');
                setCurrentPath('/admin-dashboard');
            } else {
                window.history.replaceState({}, '', '/customer-dashboard');
                setCurrentPath('/customer-dashboard');
            }
        } else {
            window.history.replaceState({}, '', '/login');
            setCurrentPath('/login');
        }
    } else if (!isAuth && path !== '/login') {
        // Protect other routes
        window.history.replaceState({}, '', '/login');
        setCurrentPath('/login');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Router Logic
  if (currentPath === '/login') {
      return <LoginScreen />;
  }

  if (currentPath === '/technician-dashboard') {
      return <TechnicianDashboard />;
  }

  if (currentPath === '/admin-dashboard') {
      return <AdminDashboard />;
  }

  if (currentPath === '/customer-dashboard') {
      return <Dashboard />;
  }

  // Fallback / 404 handled by defaulting to login if not auth, or dashboard if auth
  return isAuthenticated() ? <Dashboard /> : <LoginScreen />;
}

export default App;
