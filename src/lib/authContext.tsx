import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserRole } from './types';

interface AuthState {
  isLoggedIn: boolean;
  role: UserRole | null;
  employeeId: string | null;
  name: string | null;
}

interface AuthContextType extends AuthState {
  login: (role: UserRole, employeeId?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ isLoggedIn: false, role: null, employeeId: null, name: null });

  const login = useCallback((role: UserRole, employeeId?: string) => {
    setAuth({
      isLoggedIn: true,
      role,
      employeeId: employeeId || (role === 'employee' ? 'new' : null),
      name: role === 'admin' ? 'Admin User' : 'New Employee',
    });
  }, []);

  const logout = useCallback(() => {
    setAuth({ isLoggedIn: false, role: null, employeeId: null, name: null });
  }, []);

  return <AuthContext.Provider value={{ ...auth, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
