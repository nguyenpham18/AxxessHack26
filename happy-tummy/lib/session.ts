import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'happy_tummy_access_token';

let accessToken: string | null = null;
let initialized = false;

function isWebPlatform() {
  return Platform.OS === 'web';
}

function getWebToken(): string | null {
  try {
    return globalThis.localStorage?.getItem(ACCESS_TOKEN_KEY) ?? null;
  } catch {
    return null;
  }
}

function setWebToken(token: string | null) {
  try {
    if (token) {
      globalThis.localStorage?.setItem(ACCESS_TOKEN_KEY, token);
      return;
    }
    globalThis.localStorage?.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // no-op when storage is unavailable
  }
}

export async function initSession() {
  if (initialized) return;

  if (isWebPlatform()) {
    accessToken = getWebToken();
    initialized = true;
    return;
  }

  accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  initialized = true;
}

export async function setAccessToken(token: string | null) {
  if (!initialized) {
    await initSession();
  }

  accessToken = token;
  if (isWebPlatform()) {
    setWebToken(token);
    return;
  }

  if (token) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    return;
  }

  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export async function getAccessToken() {
  if (!initialized) {
    await initSession();
  }

  return accessToken;
}
