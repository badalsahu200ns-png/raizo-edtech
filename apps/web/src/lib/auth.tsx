"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile, GoogleAuthResponse } from "./types";
import { api } from "./api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  loginWithGoogle: (credential: string) => Promise<GoogleAuthResponse>;
  loginAsDemo: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Initialize session from localStorage and backend
  const checkSession = useCallback(async () => {
    setIsLoading(true);
    try {
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      const storedToken = localStorage.getItem("raizo_token");
      const storedUser = localStorage.getItem("raizo_user");

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // Ignore parse errors
          }
        }

        // Verify active session with backend
        try {
          const res = await api.getMe();
          if (res && res.authenticated && res.user) {
            setUser(res.user);
            localStorage.setItem("raizo_user", JSON.stringify(res.user));
          } else if (res && res.authenticated === false) {
            // Expired or invalid token
            localStorage.removeItem("raizo_token");
            localStorage.removeItem("raizo_user");
            setToken(null);
            setUser(null);
          }
        } catch {
          // If server is temporarily unreachable, keep stored session
        }
      } else {
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const loginWithGoogle = async (credential: string): Promise<GoogleAuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.googleAuth(credential);
      if (res && res.success && res.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("raizo_token", res.token);
          localStorage.setItem("raizo_user", JSON.stringify(res.user));
        }
        setToken(res.token);
        setUser(res.user as UserProfile);
        return res;
      } else {
        throw new Error("Authentication was unsuccessful. Please try again.");
      }
    } catch (err: any) {
      const msg = err.message || "Failed to authenticate with Google.";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (): Promise<void> => {
    const isLocalDev =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        process.env.NODE_ENV === "development" ||
        process.env.NEXT_PUBLIC_ENABLE_LOCAL_DEMO === "true");

    if (!isLocalDev) {
      throw new Error("Demo accounts are strictly disabled in production builds and deployments.");
    }
    await loginWithGoogle("test_google:alex.rivera@example.com:Alex Rivera:demo_learner_alex:");
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (token) {
        await api.logout().catch(() => null);
      }
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("raizo_token");
        localStorage.removeItem("raizo_user");
      }
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const res = await api.getMe();
      if (res && res.authenticated && res.user) {
        setUser(res.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("raizo_user", JSON.stringify(res.user));
        }
      }
    } catch (err) {
      console.warn("Failed to refresh user profile:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        error,
        loginWithGoogle,
        loginAsDemo,
        logout,
        refreshUser,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
