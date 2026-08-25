import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_URL_STORAGE_KEY = "backend_api_url";

export async function getApiUrl(): Promise<string | null> {
  try {
    const stored = await AsyncStorage.getItem(API_URL_STORAGE_KEY);
    if (stored && stored.trim()) return stored.trim().replace(/\/+$/, "");
    return null;
  } catch (e) {
    console.error("Failed to get API URL:", e);
    return null;
  }
}

export async function getStoredApiUrl(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(API_URL_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to get stored API URL:", e);
    return null;
  }
}

/**
 * Persist the backend API base URL.
 * Trims whitespace and removes trailing slashes.
 */
export async function setApiUrl(url: string): Promise<void> {
  const cleaned = url.trim().replace(/\/+$/, "");
  await AsyncStorage.setItem(API_URL_STORAGE_KEY, cleaned);
}

export async function clearApiUrl(): Promise<void> {
  await AsyncStorage.removeItem(API_URL_STORAGE_KEY);
}
