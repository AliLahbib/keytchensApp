/**
 * Login Page Component
 * @file Clean component following single responsibility principle
 * Handles UI and user interactions, delegates business logic to service
 */

import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AuthService } from '../services/AuthService';
import { LoginRequest, AuthError, AuthErrorType } from '../types/auth.types';
import Logo from '../assets/icons/logoKeytchens.svg';

interface LoginPageProps {
  authService: AuthService;
  onLoginSuccess: () => void;
}

interface FormState {
  email: string;
  password: string;
  isPasswordVisible: boolean;
}

/**
 * LoginPage - Presentational component for user authentication
 * Responsibilities:
 * - Display login form
 * - Capture user input
 * - Show loading and error states
 * - Delegate to AuthService
 */
export const LoginPage: React.FC<LoginPageProps> = ({
  authService,
  onLoginSuccess,
}) => {
  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    isPasswordVisible: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  /**
   * Update form field
   */
  const handleFieldChange = useCallback(
    (field: keyof Omit<FormState, 'isPasswordVisible'>, value: string) => {
      setForm(prev => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (error) {
        setError(null);
      }
    },
    [error],
  );

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = useCallback(() => {
    setForm(prev => ({
      ...prev,
      isPasswordVisible: !prev.isPasswordVisible,
    }));
  }, []);

  /**
   * Handle login submission
   */
  const handleLogin = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const credentials: LoginRequest = {
        email: form.email.trim(),
        password: form.password,
      };

      await authService.login(credentials);
      onLoginSuccess();
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setError(err as AuthError);
        Alert.alert('Login Failed', (err as AuthError).message);
      } else {
        const genericError: AuthError = {
          type: AuthErrorType.UNKNOWN_ERROR,
          message: 'An unexpected error occurred',
        };
        setError(genericError);
        Alert.alert('Login Failed', 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, [authService, form, isLoading, onLoginSuccess]);

  /**
   * Check if login button should be enabled
   */
  const isLoginButtonEnabled =
    form.email.trim().length > 0 &&
    form.password.length > 0 &&
    !isLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Logo width={200} height={200} />
          </View>
          <Text style={styles.title}>Keytchens</Text>
          <Text style={styles.subtitle}>Welcome Back</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[
                styles.input,
                error?.type === AuthErrorType.VALIDATION_ERROR &&
                  styles.inputError,
              ]}
              placeholder="your@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              value={form.email}
              onChangeText={value => handleFieldChange('email', value)}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  error?.type === AuthErrorType.VALIDATION_ERROR &&
                    styles.inputError,
                ]}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry={!form.isPasswordVisible}
                editable={!isLoading}
                value={form.password}
                onChangeText={value => handleFieldChange('password', value)}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                disabled={isLoading}
                style={styles.passwordToggle}
              >
                <Text style={styles.passwordToggleText}>
                  {form.isPasswordVisible ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error.message}</Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              !isLoginButtonEnabled && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={!isLoginButtonEnabled}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  formContainer: {
    marginVertical: 20,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#ff4444',
    backgroundColor: '#fff5f5',
  },
  passwordInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  passwordToggleText: {
    fontSize: 18,
  },
  errorContainer: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderRadius: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#cc0000',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});
