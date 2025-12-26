import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage globally for Jest environment
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
