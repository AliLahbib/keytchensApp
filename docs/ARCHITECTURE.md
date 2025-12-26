# Architecture Diagram - Authentication Feature

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          App.tsx (Entry Point)                          │
│                     - Navigation State Management                        │
│                  - Auth Status Initialization (useEffect)              │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
          ┌─────────▼──────────┐      ┌──────────▼────────────┐
          │   LoginPage        │      │  Home Screen          │
          │  Component (UI)    │      │  (Future)             │
          │                    │      │                       │
          │ - Email input      │      └───────────────────────┘
          │ - Password input   │
          │ - Validation       │
          │ - Error display    │
          │ - Loading state    │
          └─────────┬──────────┘
                    │
                    │ uses
                    │
          ┌─────────▼──────────────────────┐
          │     ServiceContainer           │
          │  (Dependency Injection Factory) │
          │                                │
          │ - getInstance()                │
          │ - getAuthService()             │
          └─────────┬──────────────────────┘
                    │
        ┌───────────┴──────────────┐
        │                          │
        │                          │
┌───────▼──────────────┐   ┌──────▼─────────────────┐
│   AuthService        │   │  HttpClient           │
│ (Business Logic)     │   │  (Network Layer)      │
│                      │   │                       │
│ - login()            │   │ - post()              │
│ - logout()           │   │ - get()               │
│ - getToken()         │   │ - put()               │
│ - isAuthenticated()  │   │ - request()           │
│                      │   │ - error handling      │
│ Dependencies:        │   │ - timeout management  │
│ • IHttpClient        │   │                       │
│ • ITokenStorage      │   └──────────────────────┘
│ • IAuthValidator     │
└───────┬──────────────┘
        │
        │ uses
        │
┌───────▼──────────────────┬──────────────┬──────────────┐
│                          │              │              │
│                          │              │              │
│   AuthValidator          │   ITokenStorage           │
│  (Input Validation)      │   Interface              │
│                          │                          │
│ - validateLoginRequest() │  Implementations:       │
│ - EMAIL_REGEX           │  • AsyncStorageToken    │
│ - PASSWORD_LENGTH       │    Storage              │
│                          │                          │
└──────────────────────────┴──────────────┴──────────────┘


┌──────────────────────────────────────────────────────────┐
│                   Types & Interfaces                     │
│                 (src/types/auth.types.ts)               │
│                                                          │
│ • User                                                   │
│ • LoginRequest                                           │
│ • LoginResponse                                          │
│ • AuthState                                              │
│ • AuthError                                              │
│ • AuthErrorType (enum)                                   │
│ • IHttpClient                                            │
│ • ITokenStorage                                          │
│ • IAuthValidator                                         │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    Testing Layer                         │
│                                                          │
│ • AuthService.test.ts                                    │
│   - Validator tests                                      │
│   - Service tests                                        │
│   - Mock implementations                                │
│                                                          │
│ • HttpClient.test.ts                                     │
│   - Network tests                                        │
│   - Error handling tests                                 │
│   - Fetch mock                                           │
└──────────────────────────────────────────────────────────┘
```

## Data Flow - Login Process

```
User Input (Email, Password)
         │
         ▼
   LoginPage Component
         │
    Validation
         │
    ┌────────────────────┐
    │   No Errors?       │
    └────┬───────────────┘
         │ Yes
         ▼
  AuthService.login()
         │
  ┌──────────────────────┐
  │ Validate with        │
  │ AuthValidator        │
  └────┬─────────────────┘
       │
       ▼
   HttpClient.post()
       │
  ┌────────────────────┐
  │ Network Request    │
  │ to API             │
  └────┬───────────────┘
       │
       ├─── Success ──┐
       │              │
       │         Store Token
       │              │
       │         AsyncStorage
       │              │
       │              ▼
       │         Return LoginResponse
       │              │
       │              ▼
       │         LoginPage -> onLoginSuccess()
       │              │
       │              ▼
       │         Navigate to Home
       │
       └─── Error ──┐
              │
         Handle Error
              │
         Display Alert
              │
         Clear Loading State
```

## Dependency Injection Flow

```
ServiceContainer (Singleton)
         │
         ├─▶ HttpClient(baseUrl, timeout)
         │
         ├─▶ AsyncStorageTokenStorage()
         │        └─▶ Implements ITokenStorage
         │
         ├─▶ AuthValidator()
         │        └─▶ Implements IAuthValidator
         │
         └─▶ AuthService(httpClient, tokenStorage, validator)
                      │
                      ├─▶ Depends on IHttpClient
                      ├─▶ Depends on ITokenStorage
                      └─▶ Depends on IAuthValidator

All resolved at initialization
No runtime dependency resolution
Easy to test with mocks
```

## Error Handling Flow

```
LoginPage.handleLogin()
      │
      ▼
AuthService.login()
      │
  ┌───┴────────────────────┐
  │                        │
  ▼                        ▼
Validation Error    Network Request
  │                        │
  │              ┌─────────┼─────────┐
  │              │         │         │
  │              ▼         ▼         ▼
  │            200        401        Error
  │            ✅         │          │
  │            Return    Invalid    Network/
  │            Response  Creds      Timeout
  │                       │          │
  └─────────┬─────────────┴──────────┘
            │
            ▼
    Throw AuthError
            │
    ┌───────┴────────────────────┐
    │                            │
    ▼                            ▼
Catch in Component        Catch in Test
    │                            │
    ▼                            ▼
setError(AuthError)        Verify Error Type
    │                            │
    ▼                            ▼
Alert.alert()              Assert Message
    │
    ▼
Display to User
```
