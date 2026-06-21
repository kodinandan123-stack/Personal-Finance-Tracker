import * as SecureStore from 'expo-secure-store'

// Secure token storage for the mobile client.
// Replaces the web app's localStorage-based token handling with
// expo-secure-store so the JWT is kept in the device keychain/keystore.

const TOKEN_KEY = 'pft_auth_token'

// Persist the JWT after a successful login/register.
export async function setToken(token) {
  if (!token) return
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

// Read the stored JWT (used by the API request interceptor).
export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

// Clear the JWT on logout.
export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

// Convenience helper for guarding authenticated screens.
export async function isAuthenticated() {
  const token = await getToken()
  return Boolean(token)
}
