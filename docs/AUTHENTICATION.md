# 🔐 Authentication Feature - Documentation

## 📋 Architecture Overview

Ce module d'authentification suit les principes **Clean Code** et **SOLID** :

```
src/
├── types/
│   └── auth.types.ts          # Types & Interfaces (Single source of truth)
├── services/
│   ├── AuthService.ts         # Business logic (Single Responsibility)
│   ├── ServiceContainer.ts    # Dependency Injection (Inversion of Control)
│   ├── api/
│   │   └── HttpClient.ts      # Network layer (Interface Segregation)
│   ├── storage/
│   │   └── AsyncStorageTokenStorage.ts  # Token persistence
│   └── __tests__/
│       ├── AuthService.test.ts
│       └── HttpClient.test.ts
├── screens/
│   └── LoginPage.tsx          # UI Component (Presentation layer)
├── hooks/
│   └── useAuth.ts             # Custom hook (React integration)
└── App.tsx                    # App entry point with routing
```

## 🎯 Principes SOLID Appliqués

### 1. **S - Single Responsibility Principle**
- `AuthService`: Gère uniquement la logique d'authentification
- `HttpClient`: Gère uniquement les requêtes HTTP
- `LoginPage`: Gère uniquement l'affichage et les interactions UI
- Chaque classe a une raison unique de changer

### 2. **O - Open/Closed Principle**
- Services sont ouverts à l'extension (new methods)
- Fermés à la modification (interfaces stables)
- Possible d'ajouter de nouveaux types de stockage sans modifier AuthService

### 3. **L - Liskov Substitution Principle**
- Interfaces (`IHttpClient`, `ITokenStorage`) permettent substituabilité
- Tests peuvent utiliser des implémentations mock sans changer le code

### 4. **I - Interface Segregation Principle**
- Interfaces spécialisées : `IHttpClient`, `ITokenStorage`, `IAuthValidator`
- Les clients ne dépendent que des méthodes qu'ils utilisent

### 5. **D - Dependency Inversion Principle**
- `AuthService` dépend d'abstractions, pas d'implémentations concrètes
- `ServiceContainer` centralise les dépendances
- Injection de dépendances facilite les tests et les changements

## 🚀 Utilisation

### Initialiser les services

```typescript
import { serviceContainer } from './src/services/ServiceContainer';

const authService = serviceContainer.getAuthService();
```

### Utiliser dans un composant

```typescript
import { LoginPage } from './src/screens/LoginPage';

<LoginPage 
  authService={authService}
  onLoginSuccess={() => setNavigationState('home')}
/>
```

### Utiliser le hook personnalisé

```typescript
import { useAuth } from './src/hooks/useAuth';

const { user, isLoading, error, isAuthenticated, login, logout } = useAuth(authService);

// Effectuer un login
try {
  await login(email, password);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

## 🧪 Tests

Exécuter les tests :

```bash
npm test
```

### Structure des tests

- **AAA Pattern** : Arrange, Act, Assert
- **Mock implementations** : HttpClient et TokenStorage mocké
- **Cas d'erreur** : Tests des erreurs de validation, réseau, etc.
- **Couverture** : AuthService, HttpClient, validation

## 📦 API Contracts

### Login Request
```typescript
{
  email: string;
  password: string;
}
```

### Login Response
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    token: string;
    createdAt: string;
  };
  accessToken: string;
  refreshToken?: string;
}
```

## 🛡️ Error Handling

Types d'erreurs définies :

```typescript
enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',  // 401/403
  NETWORK_ERROR = 'NETWORK_ERROR',              // Timeout, connexion perdue
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',              // Erreurs inattendues
  VALIDATION_ERROR = 'VALIDATION_ERROR',        // Email/password invalides
}
```

## 🔄 Configuration

### Changer l'URL de l'API

Modifier dans `ServiceContainer.ts` :

```typescript
const baseUrl = process.env.API_URL || 'http://votre-api.com';
```

### Changer le timeout

```typescript
this.httpClient = new HttpClient(baseUrl, 15000); // 15 secondes
```

## 📱 UI/UX Features

- ✅ Validation en temps réel
- ✅ Loading states
- ✅ Error messages clairs
- ✅ Password visibility toggle
- ✅ Responsive design
- ✅ Keyboard handling
- ✅ Disabled state pour le bouton submit

## 🔐 Sécurité

- ✅ Tokens stockés dans AsyncStorage
- ✅ Validation des email et password
- ✅ Gestion des erreurs sans révéler les détails sensibles
- ✅ Timeout réseau
- ✅ Séparation des concerns (pas de data sensible en UI)

## ♻️ Extensibilité

### Ajouter un nouveau type de stockage

```typescript
export class SecureStorageTokenStorage implements ITokenStorage {
  async setToken(token: string): Promise<void> {
    // Implémenter avec une bibliothèque sécurisée
  }
  // ...
}
```

### Ajouter un nouveau validateur

```typescript
export class AdvancedAuthValidator implements IAuthValidator {
  validateLoginRequest(request: LoginRequest): AuthError | null {
    // Logique de validation personnalisée
  }
}
```

## 📝 Prochaines étapes

1. **Intégrer une API réelle** : Tester avec votre backend
2. **Ajouter refresh token** : Gestion de la session
3. **Implémenter sign up** : Inscription d'utilisateurs
4. **Ajouter biometric auth** : Face ID / Touch ID
5. **Social login** : Google, Facebook, etc.

---

**Version**: 1.0.0  
**Dernière mise à jour**: 26 décembre 2025
