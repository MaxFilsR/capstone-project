/**
 * API Client Configuration
 * 
 * Configures the Axios HTTP client with authentication interceptors.
 * Automatically attaches JWT tokens to requests and handles token expiration.
 * Uses environment variables for API base URL configuration.
 */

import axios from "axios";
import { storage } from "@/utils/storageHelper";
import { router } from "expo-router";
import { Platform } from "react-native";

// const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const API_BASE_URL = Platform.OS === "android"
    ? "http://10.0.2.2:8080" // Android emulator → host machine
    : "http://localhost:8080"; // iOS simulator or web

/**
 * Configured Axios instance for API requests
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Endpoints that don't require authentication
 */
const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/sign-up"];

/**
 * Callback function to handle logout when token expires
 */
let logoutCallback: (() => Promise<void>) | null = null;

/**
 * Set the logout callback to be invoked on 401 responses
 */
export function setLogoutCallback(callback: () => Promise<void>) {
  logoutCallback = callback;
}

/**
 * Request interceptor to attach JWT token to protected endpoints
 */
apiClient.interceptors.request.use(
  async (config) => {
    const isPublic = PUBLIC_ENDPOINTS.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (isPublic) {
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

/**
 * Response interceptor to handle authentication errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      console.warn("Unauthorized — token expired or invalid");

      if (logoutCallback) {
        await logoutCallback();
      }
    }

    return Promise.reject(error);
  }
);
