import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { router } from "expo-router";
import { getCharacter, CharacterProfile } from "@/api/endpoints";
import { storage } from "@/utils/storageHelper";
import { setLogoutCallback } from "@/api/client";

type User = {
  onboarded?: boolean;
  profile?: CharacterProfile;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (token: string, onboarded: boolean) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  fetchUserProfile: () => Promise<CharacterProfile>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const logout = async () => {
    console.log("Logging out user...");
    await storage.deleteItem("accessToken");
    await storage.deleteItem("onboarded");
    setUser(null);
    router.replace("../auth");
  };

  // Register logout callback with API client on mount
  useEffect(() => {
    setLogoutCallback(logout);
  }, []);

  // Auto-login on app start
  useEffect(() => {
    async function loadUser() {
      const token = await storage.getItem("accessToken");
      const onboardedStr = await storage.getItem("onboarded");

      if (token) {
        setUser({
          onboarded: onboardedStr === "true",
        });
      }
    }
    loadUser();
  }, []);

  const login = async (token: string, onboarded: boolean) => {
    await storage.setItem("accessToken", token);
    await storage.setItem("onboarded", String(onboarded));

    setUser({
      onboarded,
    });
  };

  const completeOnboarding = async () => {
    await storage.setItem("onboarded", "true");
    setUser((prev) => (prev ? { ...prev, onboarded: true } : null));
  };

  const fetchUserProfile = async (): Promise<CharacterProfile> => {
    const profile = await getCharacter();
    setUser((prev) => (prev ? { ...prev, profile } : null));
    return profile;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        completeOnboarding,
        fetchUserProfile,
      }}
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
