"use client";

import React, { createContext, useContext } from "react";
import { UserProfile } from "./types";

const DEMO_USER: UserProfile = {
  id: "demo_learner_alex",
  name: "Alex Rivera",
  email: "alex.rivera@example.com",
  is_google_verified: false,
  current_role: "Marketing & Operations Associate",
  target_role: "data_analyst",
  career_goal: "Transition to Data Analyst",
  timeline_months: 4,
  weekly_hours: 8
};

interface AuthContextType {
  user: UserProfile | null;
  token: null;
  isLoading: false;
  isAuthenticated: true;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: DEMO_USER,
        token: null,
        isLoading: false,
        isAuthenticated: true
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
