/**
 * AsyncStorage User Storage - Persists connected user
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IUserStorage } from '../AuthService';
import { User } from '../../types/auth.types';

const USER_KEY = '@keytchens_user';

export class AsyncStorageUserStorage implements IUserStorage {
  async setUser(user: User): Promise<void> {
    try {
      const value = JSON.stringify(user);
      await AsyncStorage.setItem(USER_KEY, value);
    } catch (error) {
      console.error('Failed to store user:', error);
      throw new Error('Failed to store user');
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const value = await AsyncStorage.getItem(USER_KEY);
      return value ? (JSON.parse(value) as User) : null;
    } catch (error) {
      console.error('Failed to retrieve user:', error);
      return null;
    }
  }

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Failed to remove user:', error);
      throw new Error('Failed to remove user');
    }
  }
}
