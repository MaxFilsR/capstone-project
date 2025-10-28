import axios from "axios";
import { storage } from "@/utils/storageHelper";
import { router } from "expo-router";
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

// ✅ Define which endpoints DON'T require a token
const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/sign-up"];

// ✅ Request Interceptor
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

        // ✅ If no token, skip the request entirely
        if (!token) {
            console.warn(
                `Skipping protected request — no token for ${config.url}`
            );
            throw new axios.Cancel("Request cancelled: user not authenticated");
        }

        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Response Interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (axios.isCancel(error)) {
            // Request was intentionally skipped — not a real error
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            console.warn(
                "Unauthorized — clearing credentials and redirecting..."
            );
            await storage.deleteItem("accessToken");
            await storage.deleteItem("onboarded");
            router.replace("/auth/logIn");
        }

        return Promise.reject(error);
    }
);
