# 📚 Guide d'Utilisation - Authentication Module

## Table of Contents
1. [Setup Initial](#setup-initial)
2. [Intégration dans Composants](#intégration-dans-composants)
3. [Gestion d'Erreurs](#gestion-derreurs)
4. [Tests](#tests)
5. [Customisation](#customisation)

## Setup Initial

### 1. Installation des dépendances

```bash
npm install
# ou
yarn install
```

### 2. Configuration de l'API

Dans `src/services/ServiceContainer.ts` :

```typescript
const baseUrl = process.env.API_URL || 'http://localhost:3000';
```

Ou via variables d'environnement :
```bash
API_URL=https://api.monapp.com npm run android
```

## Intégration dans Composants

### Option 1: Utiliser LoginPage directement

```typescript
import { LoginPage } from './src/screens/LoginPage';
import { serviceContainer } from './src/services/ServiceContainer';

const MyComponent = () => {
  const authService = serviceContainer.getAuthService();

  const handleLoginSuccess = () => {
    console.log('User logged in!');
    // Navigate to home screen
  };

  return (
    <LoginPage
      authService={authService}
      onLoginSuccess={handleLoginSuccess}
    />
  );
};
```

### Option 2: Utiliser le hook useAuth

```typescript
import { useAuth } from './src/hooks/useAuth';
import { serviceContainer } from './src/services/ServiceContainer';

const MyComponent = () => {
  const authService = serviceContainer.getAuthService();
  const { user, isLoading, error, isAuthenticated } = useAuth(authService);

  // State is automatically managed
  return (
    <View>
      {isLoading && <Text>Loading...</Text>}
      {user && <Text>Welcome, {user.name}</Text>}
      {error && <Text>Error: {error.message}</Text>}
    </View>
  );
};
```

### Option 3: Appeler directement le service

```typescript
import { serviceContainer } from './src/services/ServiceContainer';
import { LoginRequest } from './src/types/auth.types';

const login = async (email: string, password: string) => {
  const authService = serviceContainer.getAuthService();
  
  try {
    const credentials: LoginRequest = { email, password };
    const response = await authService.login(credentials);
    
    console.log('Logged in user:', response.user);
    // Token est automatiquement stocké
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

## Gestion d'Erreurs

### Capturer et gérer les erreurs

```typescript
import { AuthError, AuthErrorType } from './src/types/auth.types';

try {
  await authService.login({ email, password });
} catch (error) {
  const authError = error as AuthError;
  
  switch (authError.type) {
    case AuthErrorType.INVALID_CREDENTIALS:
      // Email ou password incorrect
      Alert.alert('Invalid Email or Password', 'Please try again');
      break;

    case AuthErrorType.NETWORK_ERROR:
      // Problème de connexion réseau
      Alert.alert('Network Error', 'Check your internet connection');
      break;

    case AuthErrorType.VALIDATION_ERROR:
      // Données invalides (email format, password length, etc.)
      Alert.alert('Invalid Input', authError.message);
      break;

    case AuthErrorType.UNKNOWN_ERROR:
      // Erreur inattendue
      Alert.alert('Unexpected Error', 'Please try again later');
      break;
  }
}
```

### Utiliser le type guard

```typescript
import { isAuthError } from './src/types/auth.types';

try {
  await authService.login({ email, password });
} catch (error) {
  if (isAuthError(error)) {
    console.log('Auth error:', error.message);
  } else {
    console.log('Unknown error:', error);
  }
}
```

## Tests

### Exécuter tous les tests

```bash
npm test
```

### Exécuter les tests en mode watch

```bash
npm test -- --watch
```

### Exécuter un fichier de test spécifique

```bash
npm test -- AuthService.test.ts
```

### Couverte de code

```bash
npm test -- --coverage
```

### Exemple: Tester votre propre composant

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginPage } from './LoginPage';
import { AuthService } from '../services/AuthService';

// Mock AuthService
const mockAuthService = {
  login: jest.fn().mockResolvedValue({ 
    user: { id: '1', email: 'test@test.com' } 
  }),
} as unknown as AuthService;

describe('LoginPage', () => {
  it('should display login form', () => {
    const { getByPlaceholderText } = render(
      <LoginPage
        authService={mockAuthService}
        onLoginSuccess={jest.fn()}
      />
    );

    expect(getByPlaceholderText('your@email.com')).toBeTruthy();
  });

  it('should call login on submit', async () => {
    const mockOnSuccess = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <LoginPage
        authService={mockAuthService}
        onLoginSuccess={mockOnSuccess}
      />
    );

    // Remplir le formulaire
    fireEvent.changeText(
      getByPlaceholderText('your@email.com'),
      'test@test.com'
    );
    fireEvent.changeText(
      getByPlaceholderText('Enter your password'),
      'password123'
    );

    // Soumettre
    fireEvent.press(getByText('Sign In'));

    // Attendre l'appel du callback
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
```

## Customisation

### Ajouter un nouveau validateur

```typescript
import { IAuthValidator } from './AuthService';
import { AuthError, AuthErrorType, LoginRequest } from '../types/auth.types';

export class StrictAuthValidator implements IAuthValidator {
  validateLoginRequest(request: LoginRequest): AuthError | null {
    // Votre logique personnalisée
    if (request.password.length < 8) {
      return {
        type: AuthErrorType.VALIDATION_ERROR,
        message: 'Password must be at least 8 characters',
      };
    }
    return null;
  }
}

// Utiliser dans ServiceContainer
const authValidator = new StrictAuthValidator();
this.authService = new AuthService(
  this.httpClient,
  tokenStorage,
  authValidator,
);
```

### Utiliser une autre implémentation de stockage

```typescript
import { ITokenStorage } from './AuthService';
import * as SecureStore from 'expo-secure-store';

export class SecureStorageTokenStorage implements ITokenStorage {
  private readonly KEY = 'auth_token';

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(this.KEY, token);
  }

  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(this.KEY);
  }

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(this.KEY);
  }
}

// Utiliser dans ServiceContainer
const tokenStorage = new SecureStorageTokenStorage();
```

### Ajouter des headers personnalisés

```typescript
export class AuthHttpClient extends HttpClient {
  async request<T>(url: string, options: RequestInit): Promise<T> {
    const token = await this.getToken();
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'X-App-Version': '1.0.0',
    };

    return super.request(url, { ...options, headers });
  }

  private async getToken(): Promise<string | null> {
    // Votre logique pour récupérer le token
    return null;
  }
}
```

### Ajouter un refresh token automatique

```typescript
export class AuthServiceWithRefresh extends AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await super.login(credentials);
    
    if (response.refreshToken) {
      // Sauvegarder le refresh token
      await this.storeRefreshToken(response.refreshToken);
    }
    
    return response;
  }

  private async storeRefreshToken(token: string): Promise<void> {
    // Implémenter selon vos besoins
  }
}
```

## Best Practices

### ✅ À faire

```typescript
// 1. Trim les inputs
const email = form.email.trim();

// 2. Utiliser les interfaces
const credentials: LoginRequest = { email, password };

// 3. Gérer les erreurs spécifiques
if (error.type === AuthErrorType.INVALID_CREDENTIALS) {
  // traiter
}

// 4. Utiliser les types génériques
const response: LoginResponse = await authService.login(credentials);

// 5. Tester avec des mocks
jest.spyOn(mockService, 'login').mockResolvedValueOnce(mockResponse);
```

### ❌ À éviter

```typescript
// 1. Ne pas oublier de trim
const email = form.email; // ❌ Peut avoir des espaces

// 2. Utiliser any
const response: any = await login(); // ❌ Pas de type safety

// 3. Catch all errors sans les traiter
try {
  // ...
} catch (error) {
  console.log(error); // ❌ Pas d'action
}

// 4. Stocker les tokens en clair
localStorage.setItem('token', token); // ❌ Web only, pas sécurisé

// 5. Ne pas tester
// ❌ Pas de tests
```

---

**Questions fréquentes**

**Q: Où est stocké le token?**
R: Dans AsyncStorage (mobile) ou vous pouvez utiliser Secure Store.

**Q: Comment gérer les tokens expirés?**
R: Implémenter un refresh token endpoint et intercepter les 401 responses.

**Q: Puis-je utiliser ce module sans servicContainer?**
R: Oui, créer les instances directement, mais ServiceContainer est recommandé.

**Q: Comment ajouter d'autres endpoints?**
R: Étendre AuthService avec de nouvelles méthodes qui utilisent httpClient.
