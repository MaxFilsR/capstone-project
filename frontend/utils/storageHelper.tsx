/**
 * Storage Helper
 * 
 * Cross-platform secure storage utility that abstracts storage operations
 * across web and native platforms. Uses localStorage for web and SecureStore
 * for iOS/Android to ensure secure credential storage.
 */

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// ============================================================================
// Storage API
// ============================================================================

/**
 * Cross-platform storage interface
 */
export const storage = {
  /**
   * Retrieve an item from storage
   */
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

  /**
   * Store an item in storage
   */
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

  /**
   * Remove an item from storage
   */
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