import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn("localStorage not available:", error);
        return null;
      }
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn("SecureStore not available:", error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn("localStorage not available:", error);
      }
    } else {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.warn("SecureStore not available:", error);
      }
    }
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn("localStorage not available:", error);
      }
    } else {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.warn("SecureStore not available:", error);
      }
    }
  },
};

export default storage;
