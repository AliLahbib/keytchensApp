/**
 * Authentication Service - Business logic layer
 * @file Handles authentication operations with dependency injection
 * Follows SOLID principles: Single Responsibility, Dependency Inversion
 */

import {
  AuthError,
  AuthErrorType,
  LoginRequest,
  LoginResponse,
  User,
} from '../types/auth.types';
import { IHttpClient } from './api/HttpClient';

/**
 * Interface for token storage - allows different implementations
 * Follows Interface Segregation and Dependency Inversion principles
 */
export interface ITokenStorage {
  setToken(token: string): Promise<void>;
  getToken(): Promise<string | null>;
  removeToken(): Promise<void>;
}

/**
 * Interface for user storage - allows storing the connected user
 */
export interface IUserStorage {
  setUser(user: User): Promise<void>;
  getUser(): Promise<User | null>;
  removeUser(): Promise<void>;
}

/**
 * Interface for validation logic
 */
export interface IAuthValidator {
  validateLoginRequest(request: LoginRequest): AuthError | null;
}

/**
 * Default email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Default implementation of auth validator
 */
export class AuthValidator implements IAuthValidator {
  validateLoginRequest(request: LoginRequest): AuthError | null {
    if (!request.email || !request.password) {
      return {
        type: AuthErrorType.VALIDATION_ERROR,
        message: 'Email and password are required',
      };
    }

    if (!EMAIL_REGEX.test(request.email)) {
      return {
        type: AuthErrorType.VALIDATION_ERROR,
        message: 'Invalid email format',
      };
    }

    if (request.password.length < 6) {
      return {
        type: AuthErrorType.VALIDATION_ERROR,
        message: 'Password must be at least 6 characters',
      };
    }

    return null;
  }
}

/**
 * Main authentication service
 * Responsible for:
 * - Coordinating login flow
 * - Token management
 * - Input validation
 *
 * Depends on interfaces, not concrete implementations (Dependency Inversion)
 */
export class AuthService {
  constructor(
    private httpClient: IHttpClient,
    private tokenStorage: ITokenStorage,
    private validator: IAuthValidator,
    private userStorage?: IUserStorage,
  ) {}

  /**
   * Perform login operation
   * @param credentials User login credentials
   * @returns LoginResponse with user data and tokens
   * @throws AuthError
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Validate input
    const validationError = this.validator.validateLoginRequest(credentials);
    if (validationError) {
      throw validationError;
    }

    // Call API
    // const response = await this.httpClient.post<LoginResponse>(
    //   '/auth/login',
    //   credentials,
    // );
    const response: LoginResponse = {
      user: {
        id: '1',
        email: credentials.email,
        name: 'John Doe',
        token: 'fake-jwt-token',
        createdAt: new Date().toISOString(),
      },
      accessToken: 'fake-jwt-token',
    };
    // Store token
    if (response.accessToken) {
      await this.tokenStorage.setToken(response.accessToken);
    }
    // Store user if storage is provided
    if (this.userStorage && response.user) {
      await this.userStorage.setUser(response.user);
    }

    console.log('AuthService.login :'); // Debug log
    console.log("user : ",await this.userStorage?.getUser()); // Debug log
    console.log("token : ",await this.tokenStorage.getToken()); // Debug log
    return response;
  }

  /**
   * Get stored token
   */
  async getToken(): Promise<string | null> {
    return this.tokenStorage.getToken();
  }

  /**
   * Logout operation
   */
  async logout(): Promise<void> {
    await this.tokenStorage.removeToken();
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.tokenStorage.getToken();
    return Boolean(token);
  }
}
