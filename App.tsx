/**
 * Main App Component
 * @format
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { LoginPage } from './src/screens/LoginPage';
import { HomeScreen } from './src/screens/HomeScreen';
import { serviceContainer } from './src/services/ServiceContainer';

/**
 * Navigation state type
 */
type NavigationState = 'login' | 'home' | 'splash';

function App() {
  const [navigationState, setNavigationState] = useState<NavigationState>('splash');
  const authService = serviceContainer.getAuthService();

  /**
   * Check authentication status on app launch
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        setNavigationState(isAuthenticated ? 'home' : 'login');
      } catch {
        setNavigationState('login');
      }
    };

    initializeApp();
  }, []);

  /**
   * Handle successful login
   */
  const handleLoginSuccess = () => {
    setNavigationState('home');
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    authService.logout();
    setNavigationState('login');
  };

  /**
   * Render appropriate screen based on navigation state
   */
  const renderScreen = () => {
    switch (navigationState) {
      case 'login':
        return (
          <LoginPage
            authService={authService}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'home':
        return <HomeScreen onLogout={handleLogout} />;
      case 'splash':
      default:
        return <View style={styles.splashContainer} />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {renderScreen()}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
