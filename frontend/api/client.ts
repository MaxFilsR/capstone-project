import axios from "axios";
import { storage } from "@/utils/storageHelper";

const API_BASE_URL = "http://localhost:8080";
// const API_BASE_URL = "https://capstone.danielyentin.com";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // optional
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
