/**
 * AsyncStorage Implementation - Concrete token storage
 * @file Uses React Native's AsyncStorage for persistent token storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ITokenStorage } from '../AuthService';

const TOKEN_KEY = '@keytchens_auth_token';

/**
 * AsyncStorage-based token storage implementation
 * Provides persistent token management across app sessions
 */
export class AsyncStorageTokenStorage implements ITokenStorage {
  /**
   * Store auth token securely
   */
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store token:', error);
      throw new Error('Failed to store authentication token');
    }
  }

  /**
   * Retrieve stored auth token
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }

  /**
   * Clear stored auth token
   */
  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove token:', error);
      throw new Error('Failed to clear authentication token');
    }
  }
}
