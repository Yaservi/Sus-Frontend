// API utility functions for the anonymous messaging platform

import { 
  AuthResponse, 
  LoginCredentials, 
  MarkAsReadRequest, 
  Message, 
  RegisterCredentials, 
  SendMessageRequest, 
  UnreadCountResponse, 
  User 
} from '../types';

// Base URL for the API
const API_BASE_URL = '/api'; // Using Next.js proxy to avoid CORS issues

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Try to get detailed error information from the response
    const errorData = await response.json().catch(() => ({}));

    // Create a more descriptive error message
    let errorMessage = errorData.message || `API error: ${response.status}`;

    // Add more context for server errors
    if (response.status >= 500) {
      errorMessage = `Server error (${response.status}): ${errorMessage}. This might be a temporary issue, please try again later.`;
      console.error('Server error details:', {
        status: response.status,
        url: response.url,
        errorData
      });
    }

    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

// Authentication API calls

export async function registerUser(credentials: RegisterCredentials): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(credentials),
    mode: 'cors',
    credentials: 'include',
  });

  return handleResponse<User>(response);
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    mode: 'cors',
    credentials: 'include',
  });

  return handleResponse<AuthResponse>(response);
}

// Message API calls

export async function sendMessage(username: string, messageData: SendMessageRequest): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/messages/${username}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageData),
    mode: 'cors',
    credentials: 'include',
  });

  return handleResponse<Message>(response);
}

// Cache for storing the last successful messages response
const messagesCache: Record<string, { data: Message[], timestamp: number }> = {};

// Maximum age for cached data in milliseconds (5 minutes)
const CACHE_MAX_AGE = 5 * 60 * 1000;

// Circuit breaker state
const circuitBreakers: Record<string, { failures: number, lastFailure: number, status: 'closed' | 'open' | 'half-open' }> = {};

// Circuit breaker thresholds
const CIRCUIT_BREAKER_THRESHOLD = 5; // Number of failures before opening the circuit
const CIRCUIT_BREAKER_RESET_TIMEOUT = 30 * 1000; // Time to wait before trying again (30 seconds)

export async function getMessages(username: string, token: string, retries = 3): Promise<Message[]> {
  const cacheKey = `${username}`;
  const circuitBreakerKey = `messages_${username}`;

  // Check circuit breaker state
  const breaker = circuitBreakers[circuitBreakerKey] || { failures: 0, lastFailure: 0, status: 'closed' };

  // If circuit is open, check if it's time to try again
  if (breaker.status === 'open') {
    const now = Date.now();
    if (now - breaker.lastFailure < CIRCUIT_BREAKER_RESET_TIMEOUT) {
      console.log(`Circuit breaker open for ${circuitBreakerKey}. Using cached data if available.`);

      // Return cached data if available and not too old
      if (messagesCache[cacheKey] && (Date.now() - messagesCache[cacheKey].timestamp) < CACHE_MAX_AGE) {
        console.log(`Returning cached messages for ${username} (${messagesCache[cacheKey].data.length} messages)`);
        return messagesCache[cacheKey].data;
      }

      // If no cache or cache too old, throw a more user-friendly error
      throw new Error(`The server is currently unavailable. Please try again later. (Circuit breaker open)`);
    } else {
      // Time to try again - set to half-open
      console.log(`Circuit breaker for ${circuitBreakerKey} switching to half-open`);
      breaker.status = 'half-open';
      circuitBreakers[circuitBreakerKey] = breaker;
    }
  }

  try {
    console.log(`Fetching messages for ${username}`);
    const response = await fetch(`${API_BASE_URL}/messages/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'include',
    });

    const result = await handleResponse<Message[]>(response);

    // Handle null result by converting it to an empty array
    const safeResult = result || [];
    console.log(`Successfully fetched ${safeResult.length} messages for ${username}`);

    // Reset circuit breaker on success
    if (breaker.status !== 'closed') {
      console.log(`Circuit breaker for ${circuitBreakerKey} reset to closed`);
      circuitBreakers[circuitBreakerKey] = { failures: 0, lastFailure: 0, status: 'closed' };
    }

    // Cache the successful response
    messagesCache[cacheKey] = { data: safeResult, timestamp: Date.now() };

    return safeResult;
  } catch (error) {
    // Update circuit breaker state
    breaker.failures++;
    breaker.lastFailure = Date.now();

    // If we've reached the threshold, open the circuit
    if (breaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
      console.log(`Circuit breaker for ${circuitBreakerKey} opened after ${breaker.failures} failures`);
      breaker.status = 'open';
    }

    circuitBreakers[circuitBreakerKey] = breaker;

    // If we have retries left and it's a server error (5xx), retry the request
    if (retries > 0 && error instanceof Error && error.message.includes('Server error')) {
      // Calculate delay with exponential backoff (1s, 2s, 4s)
      const delay = Math.pow(2, 3 - retries) * 1000;
      console.log(`Retrying getMessages (${retries} retries left) after ${delay}ms delay...`);
      // Wait before retrying to give the server time to recover
      await new Promise(resolve => setTimeout(resolve, delay));
      return getMessages(username, token, retries - 1);
    }

    // Check if we have cached data we can use as a fallback
    if (messagesCache[cacheKey] && (Date.now() - messagesCache[cacheKey].timestamp) < CACHE_MAX_AGE) {
      console.log(`Using cached messages for ${username} after fetch error`);
      // Add a warning to the console about using stale data
      console.warn(`Returning stale data due to API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Ensure we're returning a valid array even if the cached data is somehow null
      return messagesCache[cacheKey].data || [];
    }

    // If no retries left or not a server error, rethrow
    throw error;
  }
}

// Cache for storing the last successful mark-as-read response
const markAsReadCache: Record<string, { messageIds: number[], timestamp: number, result: { success: boolean } }> = {};

export async function markMessagesAsRead(username: string, messageIds: number[], token: string, retries = 3): Promise<{ success: boolean }> {
  const circuitBreakerKey = `markAsRead_${username}`;
  const cacheKey = `${username}_${messageIds.join('_')}`;

  // Check circuit breaker state
  const breaker = circuitBreakers[circuitBreakerKey] || { failures: 0, lastFailure: 0, status: 'closed' };

  // If circuit is open, check if it's time to try again
  if (breaker.status === 'open') {
    const now = Date.now();
    if (now - breaker.lastFailure < CIRCUIT_BREAKER_RESET_TIMEOUT) {
      console.log(`Circuit breaker open for ${circuitBreakerKey}. Cannot mark messages as read.`);

      // For mark-as-read, we don't use cached results as it's a write operation
      // Instead, we throw a more user-friendly error
      throw new Error(`The server is currently unavailable. Messages will be marked as read when the server is back online. (Circuit breaker open)`);
    } else {
      // Time to try again - set to half-open
      console.log(`Circuit breaker for ${circuitBreakerKey} switching to half-open`);
      breaker.status = 'half-open';
      circuitBreakers[circuitBreakerKey] = breaker;
    }
  }

  try {
    console.log(`Marking messages as read for ${username}:`, messageIds);
    const response = await fetch(`${API_BASE_URL}/messages/${username}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message_ids: messageIds } as MarkAsReadRequest),
      mode: 'cors',
      credentials: 'include',
    });

    const result = await handleResponse<{ success: boolean }>(response);
    console.log(`Successfully marked messages as read for ${username}:`, messageIds);

    // Reset circuit breaker on success
    if (breaker.status !== 'closed') {
      console.log(`Circuit breaker for ${circuitBreakerKey} reset to closed`);
      circuitBreakers[circuitBreakerKey] = { failures: 0, lastFailure: 0, status: 'closed' };
    }

    // Cache the successful response
    markAsReadCache[cacheKey] = { messageIds, timestamp: Date.now(), result };

    return result;
  } catch (error) {
    // Update circuit breaker state
    breaker.failures++;
    breaker.lastFailure = Date.now();

    // If we've reached the threshold, open the circuit
    if (breaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
      console.log(`Circuit breaker for ${circuitBreakerKey} opened after ${breaker.failures} failures`);
      breaker.status = 'open';
    }

    circuitBreakers[circuitBreakerKey] = breaker;

    // If we have retries left and it's a server error (5xx), retry the request
    if (retries > 0 && error instanceof Error && error.message.includes('Server error')) {
      // Calculate delay with exponential backoff (1s, 2s, 4s)
      const delay = Math.pow(2, 3 - retries) * 1000;
      console.log(`Retrying markMessagesAsRead (${retries} retries left) after ${delay}ms delay...`);
      // Wait before retrying to give the server time to recover
      await new Promise(resolve => setTimeout(resolve, delay));
      return markMessagesAsRead(username, messageIds, token, retries - 1);
    }

    // For mark-as-read, we don't use cached results as it's a write operation
    // Instead, we throw the error
    throw error;
  }
}

// Cache for storing the last successful unread count response
const unreadCountCache: Record<string, { data: UnreadCountResponse, timestamp: number }> = {};

export async function getUnreadCount(username: string, token: string, retries = 3): Promise<UnreadCountResponse> {
  const cacheKey = `unread_${username}`;
  const circuitBreakerKey = `unreadCount_${username}`;

  // Check circuit breaker state
  const breaker = circuitBreakers[circuitBreakerKey] || { failures: 0, lastFailure: 0, status: 'closed' };

  // If circuit is open, check if it's time to try again
  if (breaker.status === 'open') {
    const now = Date.now();
    if (now - breaker.lastFailure < CIRCUIT_BREAKER_RESET_TIMEOUT) {
      console.log(`Circuit breaker open for ${circuitBreakerKey}. Using cached data if available.`);

      // Return cached data if available and not too old
      if (unreadCountCache[cacheKey] && (Date.now() - unreadCountCache[cacheKey].timestamp) < CACHE_MAX_AGE) {
        console.log(`Returning cached unread count for ${username}: ${unreadCountCache[cacheKey].data.count}`);
        return unreadCountCache[cacheKey].data;
      }

      // If no cache or cache too old, return a default value (0 unread messages)
      // This is better than throwing an error for unread count
      console.log(`No valid cache for unread count. Returning default value (0).`);
      return { count: 0 };
    } else {
      // Time to try again - set to half-open
      console.log(`Circuit breaker for ${circuitBreakerKey} switching to half-open`);
      breaker.status = 'half-open';
      circuitBreakers[circuitBreakerKey] = breaker;
    }
  }

  try {
    console.log(`Fetching unread count for ${username}`);
    const response = await fetch(`${API_BASE_URL}/messages/${username}/unread`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
      credentials: 'include',
    });

    const result = await handleResponse<UnreadCountResponse>(response);
    console.log(`Successfully fetched unread count for ${username}: ${result.count}`);

    // Reset circuit breaker on success
    if (breaker.status !== 'closed') {
      console.log(`Circuit breaker for ${circuitBreakerKey} reset to closed`);
      circuitBreakers[circuitBreakerKey] = { failures: 0, lastFailure: 0, status: 'closed' };
    }

    // Cache the successful response
    unreadCountCache[cacheKey] = { data: result, timestamp: Date.now() };

    return result;
  } catch (error) {
    // Update circuit breaker state
    breaker.failures++;
    breaker.lastFailure = Date.now();

    // If we've reached the threshold, open the circuit
    if (breaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
      console.log(`Circuit breaker for ${circuitBreakerKey} opened after ${breaker.failures} failures`);
      breaker.status = 'open';
    }

    circuitBreakers[circuitBreakerKey] = breaker;

    // If we have retries left and it's a server error (5xx), retry the request
    if (retries > 0 && error instanceof Error && error.message.includes('Server error')) {
      // Calculate delay with exponential backoff (1s, 2s, 4s)
      const delay = Math.pow(2, 3 - retries) * 1000;
      console.log(`Retrying getUnreadCount (${retries} retries left) after ${delay}ms delay...`);
      // Wait before retrying to give the server time to recover
      await new Promise(resolve => setTimeout(resolve, delay));
      return getUnreadCount(username, token, retries - 1);
    }

    // Check if we have cached data we can use as a fallback
    if (unreadCountCache[cacheKey] && (Date.now() - unreadCountCache[cacheKey].timestamp) < CACHE_MAX_AGE) {
      console.log(`Using cached unread count for ${username} after fetch error`);
      return unreadCountCache[cacheKey].data;
    }

    // If no cache available, return a default value (0 unread messages)
    // This is better than throwing an error for unread count
    console.log(`No valid cache for unread count and fetch failed. Returning default value (0).`);
    return { count: 0 };
  }
}
