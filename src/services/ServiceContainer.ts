/**
 * Service Container - Dependency Injection Container
 * @file Creates and provides all service instances following Factory pattern
 * Single source of truth for service instantiation
 */

import { AuthService, AuthValidator } from './AuthService';
import { HttpClient, IHttpClient } from './api/HttpClient';
import { AsyncStorageTokenStorage } from './storage/AsyncStorageTokenStorage';
import { AsyncStorageUserStorage } from './storage/AsyncStorageUserStorage';

/**
 * Container for all application services
 * Centralizes dependency instantiation and management
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  private httpClient: IHttpClient;
  private authService: AuthService;
  private userStorage: AsyncStorageUserStorage;

  private constructor() {
    // Initialize HTTP Client
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    this.httpClient = new HttpClient(baseUrl, 10000);

    // Initialize storage
    const tokenStorage = new AsyncStorageTokenStorage();
    this.userStorage = new AsyncStorageUserStorage();

    // Initialize validators
    const authValidator = new AuthValidator();

    // Initialize Auth Service with dependencies
    this.authService = new AuthService(
      this.httpClient,
      tokenStorage,
      authValidator,
      this.userStorage,
    );
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Get HTTP Client instance
   */
  getHttpClient(): IHttpClient {
    return this.httpClient;
  }

  /**
   * Get Auth Service instance
   */
  getAuthService(): AuthService {
    return this.authService;
  }

  /**
   * Get User Storage instance
   */
  getUserStorage(): AsyncStorageUserStorage {
    return this.userStorage;
  }
}

/**
 * Export singleton instance for easy access
 */
export const serviceContainer = ServiceContainer.getInstance();
