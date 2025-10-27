import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { router } from "expo-router";
import { getMe, UserProfile } from "@/api/endpoints";
import { storage } from "@/utils/storageHelper";

type User = {
  onboarded?: boolean;
  profile?: UserProfile;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (token: string, onboarded: boolean) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  fetchUserProfile: () => Promise<UserProfile>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

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

  const logout = async () => {
    await storage.deleteItem("accessToken");
    await storage.deleteItem("onboarded");
    setUser(null);
    router.replace("/auth/logIn");
  };

  const fetchUserProfile = async (): Promise<UserProfile> => {
    const profile = await getMe();
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
