import React, { createContext, useContext, useState, useEffect } from "react";
import { loginApi, registerApi, getMeApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Restore session on initial mount
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }


      try {
        const userData = await getMeApi();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (err) {
        console.warn("Session restore failed, logging out:", err.message);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async ({ email, password }) => {
    const data = await loginApi({ email, password });
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const register = async ({ email, password, full_name, company_name }) => {
    const data = await registerApi({ email, password, full_name, company_name });
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

