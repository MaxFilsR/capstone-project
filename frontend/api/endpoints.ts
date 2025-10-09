import { apiClient } from "./client";
// Example type
export type User = {
id: string;
name: string;
email: string;
};
// Example: get user list
export async function getUsers(): Promise<User[]> {
const response = await apiClient.get("/users");
return response.data;
}
// Example: create a new user
export async function createUser(payload: { name: string; email:
string }) {
const response = await apiClient.post("/users", payload);
return response.data;
}
// Example: login endpoint
export async function login(payload: { email: string; password:
string }) {
const response = await apiClient.post("/auth/login", payload);
return response.data;
}