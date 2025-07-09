// JWT utility functions

/**
 * Decodes a JWT token to get its payload
 * @param token JWT token
 * @returns Decoded payload or null if invalid
 */
export function decodeJwt(token: string): any {
  if (!token) {
    console.error('Error decoding JWT token: Token is undefined or null');
    return null;
  }

  // Check if token has the correct format (header.payload.signature)
  if (!token.includes('.') || token.split('.').length !== 3) {
    console.error('Error decoding JWT token: Invalid token format');
    return null;
  }

  try {
    // JWT tokens are in the format: header.payload.signature
    // We only need the payload part
    const base64Payload = token.split('.')[1];
    if (!base64Payload) {
      console.error('Error decoding JWT token: Invalid token format');
      return null;
    }
    // Replace characters that are not valid in base64url encoding
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    // Decode the base64 string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    // Parse the JSON payload
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Checks if a JWT token is expired
 * @param token JWT token
 * @returns true if token is expired or invalid, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  if (!token) return true;

  const payload = decodeJwt(token);
  if (!payload) return true;

  // Check if the token has an expiration claim
  if (!payload.exp) return false;

  // Convert exp to milliseconds (JWT exp is in seconds)
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  // Add a small buffer (30 seconds) to account for clock skew
  return currentTime > expirationTime - 30000;
}

/**
 * Gets the time remaining before a token expires
 * @param token JWT token
 * @returns Time in milliseconds until expiration, or 0 if expired/invalid
 */
export function getTokenTimeRemaining(token: string): number {
  if (!token) return 0;

  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return 0;

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  return Math.max(0, expirationTime - currentTime);
}
