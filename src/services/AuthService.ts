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
import { API_ENDPOINTS, IHttpClient } from './api/HttpClient';

interface LoginV2ApiResponse {
  data?: {
    loginV2?: {
      token?: string;
      user?: {
        uuid?: string;
        email?: string;
        roles?: string[];
        lang?: string;
        enabled?: boolean;
      };
    };
  };
}

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

    // const apiResponse = await this.httpClient.post<LoginV2ApiResponse>(
    //   API_ENDPOINTS.login,
    //   credentials,
    // );
    // Mock response for development without backend
    const apiResponse: LoginV2ApiResponse = {
      data: {
        loginV2: {
          token: 'mock_token_' + Date.now(),
          user: {
            uuid: 'mock_uuid_123',
            email: credentials.email,
            roles: ['user'],
            lang: 'fr-FR',
            enabled: true,
          },
        },
      },
    };
    const loginData = apiResponse?.data?.loginV2;
    console.log('Login API Response:', loginData);

    if (!loginData?.token || !loginData.user?.uuid || !loginData.user.email) {
      throw {
        type: AuthErrorType.UNKNOWN_ERROR,
        message: 'Invalid login response',
      } as AuthError;
    }

    const mappedUser: User = {
      id: loginData.user.uuid,
      email: loginData.user.email,
      roles: loginData.user.roles ?? [],
      lang: loginData.user.lang ?? 'fr-FR',
      enabled: Boolean(loginData.user.enabled),
    };

    const response: LoginResponse = {
      user: mappedUser,
      token: loginData.token,
    };

    await this.tokenStorage.setToken(response.token);

    if (this.userStorage) {
      await this.userStorage.setUser(response.user);
    }

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
