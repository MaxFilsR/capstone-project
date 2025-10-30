import axios from "axios";
import { storage } from "@/utils/storageHelper";
import { Platform } from "react-native";

const API_BASE_URL =
  Platform.OS === "android"
    ? "http://localhost:8080" // Android emulator → host machine
    : "http://localhost:8080"; // iOS simulator or web

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/sign-up"];

// Store logout callback that will be set by AuthProvider
let logoutCallback: (() => Promise<void>) | null = null;

export function setLogoutCallback(callback: () => Promise<void>) {
  logoutCallback = callback;
}

apiClient.interceptors.request.use(
  async (config) => {
    const isPublic = PUBLIC_ENDPOINTS.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (isPublic) {
      // Allow login/signup requests through
      return config;
    }

    const token = await storage.getItem("accessToken");

    if (!token) {
      console.warn(`Skipping protected request — no token for ${config.url}`);
      throw new axios.Cancel("Request cancelled: user not authenticated");
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isCancel(error)) {
      // Request was intentionally skipped — not a real error
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      console.warn("Unauthorized — token expired or invalid");

      // Call the logout callback if it's set
      if (logoutCallback) {
        await logoutCallback();
      }
    }

    return Promise.reject(error);
  }
);
