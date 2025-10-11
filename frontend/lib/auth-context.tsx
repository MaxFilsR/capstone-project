import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

type User = {
  email?: string;
  onboarded?: boolean;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (token: string, email?: string, onboarded?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Auto-login on app start
  useEffect(() => {
    async function loadUser() {
      const token = await SecureStore.getItemAsync("accessToken");
      const email = await SecureStore.getItemAsync("userEmail");
      const onboardedStr = await SecureStore.getItemAsync("onboarded");

      if (token) {
        setUser({
          email: email || undefined,
          onboarded: onboardedStr === "true",
        });
      }
    }
    loadUser();
  }, []);

  const login = async (
    token: string,
    email?: string,
    onboarded: boolean = false
  ) => {
    await SecureStore.setItemAsync("accessToken", token);
    if (email) {
      await SecureStore.setItemAsync("userEmail", email);
    }
    await SecureStore.setItemAsync("onboarded", String(onboarded));

    setUser({
      email,
      onboarded,
    });
  };

  const completeOnboarding = async () => {
    await SecureStore.setItemAsync("onboarded", "true");
    setUser((prev) => (prev ? { ...prev, onboarded: true } : null));
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("userEmail");
    await SecureStore.deleteItemAsync("onboarded");
    setUser(null);
    router.replace("../auth");
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, completeOnboarding }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
