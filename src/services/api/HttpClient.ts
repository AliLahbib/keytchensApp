/**
 * HTTP Client - Abstraction for network requests
 * @file Handles all HTTP communication with proper error handling
 */

import {
  AuthError,
  AuthErrorType,
  LoginRequest,
  LoginResponse,
  isAuthError,
} from '../../types/auth.types';

/**
 * Interface for HTTP client - allows for different implementations/mocking
 */
export interface IHttpClient {
  post<T>(url: string, data: unknown): Promise<T>;
  get<T>(url: string): Promise<T>;
  put<T>(url: string, data: unknown): Promise<T>;
}

/**
 * Default HTTP client implementation
 * Uses React Native's fetch API
 */
export class HttpClient implements IHttpClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout: number = 10000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Perform POST request with timeout handling
   */
  async post<T>(url: string, data: unknown): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Perform GET request
   */
  async get<T>(url: string): Promise<T> {
    return this.request<T>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Perform PUT request
   */
  async put<T>(url: string, data: unknown): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Core request logic with error handling and timeout
   */
  private async request<T>(
    url: string,
    options: RequestInit,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw this.createError(response.status, response.statusText);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      throw this.handleFetchError(error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Create structured error from HTTP response
   */
  private createError(statusCode: number, statusText: string): AuthError {
    if (statusCode === 401 || statusCode === 403) {
      return {
        type: AuthErrorType.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
        statusCode,
      };
    }

    return {
      type: AuthErrorType.UNKNOWN_ERROR,
      message: statusText,
      statusCode,
    };
  }

  /**
   * Handle fetch errors (network, timeout, etc.)
   */
  private handleFetchError(error: unknown): AuthError {
    // Preserve structured AuthError thrown inside request flow
    if (isAuthError(error)) {
      return error;
    }

    if (error instanceof TypeError) {
      return {
        type: AuthErrorType.NETWORK_ERROR,
        message: 'Network error. Please check your connection.',
      };
    }

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        type: AuthErrorType.NETWORK_ERROR,
        message: 'Request timeout. Please try again.',
      };
    }

    return {
      type: AuthErrorType.UNKNOWN_ERROR,
      message: 'An unexpected error occurred',
    };
  }
}

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
};
