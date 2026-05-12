"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AuthState {
  token: string | null;
  tenantId: string | null;
  userId: string | null;
  role: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (tenantName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  tenantId: null,
  userId: null,
  role: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false
});

import { API_BASE } from "./api-client.js";

function loadState(): AuthState {
  if (typeof window === "undefined") return { token: null, tenantId: null, userId: null, role: null };
  try {
    const stored = localStorage.getItem("era_auth");
    if (stored) return JSON.parse(stored);
  } catch {}
  return { token: null, tenantId: null, userId: null, role: null };
}

function saveState(state: AuthState) {
  localStorage.setItem("era_auth", JSON.stringify(state));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadState);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error ?? "Login failed");
    }

    const result = await response.json();
    const newState: AuthState = {
      token: result.data.token,
      tenantId: result.data.tenant_id,
      userId: result.data.user_id,
      role: result.data.role
    };

    saveState(newState);
    setState(newState);
  };

  const register = async (tenantName: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenant_name: tenantName, email, password })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error ?? "Registration failed");
    }

    const result = await response.json();
    const newState: AuthState = {
      token: result.data.token,
      tenantId: result.data.tenant_id,
      userId: result.data.user_id,
      role: result.data.role
    };

    saveState(newState);
    setState(newState);
  };

  const logout = () => {
    localStorage.removeItem("era_auth");
    setState({ token: null, tenantId: null, userId: null, role: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, isAuthenticated: !!state.token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
