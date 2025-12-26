/**
 * Authentication Types - Defines domain models
 * @file Centralized type definitions for authentication feature
 */

/**
 * Represents a user in the system
 */
export interface User {
  id: string;
  email: string;
  name: string;
  token: string;
  createdAt: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response from API
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

/**
 * Authentication state for UI
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
}

/**
 * Application-specific authentication errors
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * Structured error object for authentication
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  statusCode?: number;
}

/**
 * Type guard for checking if error is AuthError
 */
export const isAuthError = (error: unknown): error is AuthError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error
  );
};
