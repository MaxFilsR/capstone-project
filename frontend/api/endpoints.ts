import { apiClient } from "./client";
// Example type
export type User = {
    email: string;
    password: string;
};

export type SignUpRequest = {
    email: string;
    password: string;
};

export type SignUpResponse = {
    access_token: string;
    refresh_token: string;
};

export async function signUp(payload: SignUpRequest): Promise<SignUpResponse> {
    const response = await apiClient.post("/auth/sign-up", payload);
    return response.data;
}

// Example: create a new user
export async function createUser(payload: { name: string; email: string }) {
    const response = await apiClient.post("/users", payload);
    return response.data;
}

// Example: login endpoint
export async function login(payload: { email: string; password: string }) {
    const response = await apiClient.post("/auth/login", payload);
    return response.data;
}
