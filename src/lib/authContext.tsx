import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserRole } from './types';
import { saveSession, loadSession, clearSession } from './localDB';

interface AuthState {
  isLoggedIn: boolean;
  role: UserRole | null;
  employeeId: string | null;
  name: string | null;
}

interface AuthContextType extends AuthState {
  login: (role: UserRole, employeeId?: string, name?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    // Restore session from localStorage on load
    const session = loadSession();
    if (session) {
      return {
        isLoggedIn: true,
        role: session.role,
        employeeId: session.employeeId,
        name: session.name,
      };
    }
    return { isLoggedIn: false, role: null, employeeId: null, name: null };
  });

  const login = useCallback((role: UserRole, employeeId?: string, name?: string) => {
    const empId = employeeId || (role === 'employee' ? 'emp1' : null);
    const displayName = name || (role === 'admin' ? 'Admin User' : 'Employee');
    const newAuth = {
      isLoggedIn: true,
      role,
      employeeId: empId,
      name: displayName,
    };
    setAuth(newAuth);
    saveSession({ employeeId: empId || '', role, name: displayName });
  }, []);

  const logout = useCallback(() => {
    setAuth({ isLoggedIn: false, role: null, employeeId: null, name: null });
    clearSession();
  }, []);

  return <AuthContext.Provider value={{ ...auth, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
