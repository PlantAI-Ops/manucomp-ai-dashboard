import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/services/api";

export interface UserInfo {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "manager" | "employee";
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  user: UserInfo | null;
  userLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);

  // Load token from storage
  useEffect(() => {
    const stored = localStorage.getItem("auth_token");
    if (stored) setToken(stored);
    setLoading(false);
  }, []);

  // Fetch user info when token changes
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    let cancelled = false;
    setUserLoading(true);
    api
      .get("/auth/me")
      .then(({ data }) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        if (!cancelled) {
          // 401 handled by interceptor
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setUserLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback((newToken: string) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: !!token, user, userLoading, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
