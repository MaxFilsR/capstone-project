import { router } from "expo-router";
import React, { createContext, useContext, useState } from "react";

type FakeUser = {
  $id: string;
  email: string;
  name?: string;
};

type AuthContextType = {
  user: FakeUser | null;
  register: (
    email: string,
    password: string,
    name?: string
  ) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Temporary Fake Auth Storage ---
let fakeDatabase: Record<string, { password: string; name?: string }> = {};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FakeUser | null>(null);

  // Simulate latency
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  async function register(email: string, password: string, name?: string) {
    await delay(500);

    // If user already exists
    if (fakeDatabase[email]) {
      return "User already exists.";
    }

    // Store in fake DB
    fakeDatabase[email] = { password, name };

    // Auto-login
    return await login(email, password);
  }

  async function login(email: string, password: string) {
    await delay(500);

    const record = fakeDatabase[email];
    if (!record || record.password !== password) {
      setUser(null);
      return "Invalid email or password.";
    }

    const fakeUser: FakeUser = {
      $id: Math.random().toString(36).substring(2, 9),
      email,
      name: record.name,
    };

    setUser(fakeUser);
    router.replace("@/(tabs)");
    return null; // success
  }

  async function logout() {
    await delay(200);
    setUser(null);
    router.replace("@/auth");
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
