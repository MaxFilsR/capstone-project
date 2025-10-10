import axios from "axios";

const API_BASE_URL = "http://localhost:8080";
// const API_BASE_URL = "https://capstone.danielyentin.com";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // optional
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: interceptors for auth, logging, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Example: attach token if available
    // const token = getAuthToken();
    // if (token) config.headers.Authorization = `Bearer${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
