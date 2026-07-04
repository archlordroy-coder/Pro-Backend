# Pro Informatique - API Backend (v1.0 - Production Ready)

## Description

API REST moderne et sécurisée pour l'application Pro Informatique, gérant les services, produits, promotions, utilisateurs et authentification. Cette version améliore complètement l'architecture pour une production robuste.

## Améliorations v1.0

✅ **Architecture Modulaire** - Structure organisée en routes, contrôleurs, middleware et types  
✅ **Sécurité Renforcée** - JWT, bcrypt, CORS sécurisé, rate limiting, headers de sécurité  
✅ **Validation Complète** - Schémas Zod pour tous les endpoints  
✅ **Error Handling** - Middleware d'erreur centralisé et cohérent  
✅ **Logging Structuré** - Winston pour des logs JSON production-grade  
✅ **Pagination & Filtering** - Support complet des requêtes avec page, limit, search  
✅ **Soft Delete** - Tous les endpoints supportent le soft delete (deletedAt)  
✅ **Authentification JWT** - Access tokens (15m) et refresh tokens (7j)  
✅ **TypeScript Strict** - Types entièrement typés et vérifiés  
✅ **Mock Mode** - Fonctionne sans Firebase pour le développement  

## Technologies

- **Node.js** - Runtime JavaScript
- **Express 5** - Framework web moderne
- **Firebase Admin SDK** - Base de données Firestore
- **TypeScript 6** - Typage statique strict
- **Zod** - Validation de schémas
- **bcryptjs** - Hashing de mots de passe
- **jsonwebtoken** - Authentification JWT
- **Helmet** - Headers de sécurité HTTP
- **Winston** - Logging structuré
- **Vercel** - Déploiement cloud

## Installation

```bash
# Clone le repository
git clone <repo-url>
cd Pro-Backend

# Installe les dépendances
npm install

# Build le projet
npm run build

# Configure les variables d'environnement
cp .env.example .env
# Édite .env avec tes configurations Firebase et JWT
```

## Configuration

### Variables d'environnement (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Firebase
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# JWT (change ces valeurs en production!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourdomain.com

# Logging
LOG_LEVEL=info
```

### Mode Développement

```bash
# Lance le serveur en mode développement
npm run dev  # Si un script de dev est configuré
# Ou directement
node dist/index.js
```

## Structure du Projet

```
src/
├── index.ts                    # Point d'entrée principal
├── types/
│   ├── common.ts              # Types communs (ApiResponse, ApiError, etc.)
│   └── entities.ts            # Types des entités (Service, Product, User, etc.)
├── lib/
│   ├── firebase.ts            # Initialisation et config Firebase
│   ├── logger.ts              # Configuration Winston
│   ├── mock-data.ts           # Données mock pour le développement
│   ├── validation.ts          # Schémas de validation Zod
│   └── responses.ts           # Helpers pour formater les réponses API
├── middleware/
│   ├── auth.ts               # JWT authentication et authorization
│   ├── error.ts              # Global error handler
│   ├── logging.ts            # Request/response logging
│   └── cors.ts               # CORS configuration
├── routes/
│   ├── health.ts             # Health check
│   ├── auth.ts               # Authentification (login, register, refresh)
│   ├── services.ts           # Gestion des services
│   ├── products.ts           # Gestion des produits
│   ├── promotions.ts         # Gestion des promotions
│   ├── reviews.ts            # Gestion des avis
│   ├── tickets.ts            # Cyber tickets
│   ├── computers.ts          # Gestion des ordinateurs
│   └── users.ts              # Gestion admin des utilisateurs
└── utils/
    ├── constants.ts          # Constantes et énums
    └── pagination.ts         # Utilitaires de pagination
```

## API Documentation

### Base URL
```
http://localhost:3000/v1
```

### Health Check

```http
GET /health
GET /health/db
```

### Authentication

#### Register
```http
POST /v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

Response: 201
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user-1234",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### Login
```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-1234",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

#### Refresh Token
```http
POST /v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response: 200
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

#### Get Current User
```http
GET /v1/auth/me
Authorization: Bearer <accessToken>

Response: 200
{
  "success": true,
  "data": {
    "id": "user-1234",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Services

#### Get All Services
```http
GET /v1/services?page=1&limit=20&category=Réparation

Response: 200
{
  "success": true,
  "data": [{
    "id": "service-1",
    "title": "Réparation PC",
    "description": "Réparation et maintenance",
    "category": "Réparation",
    "features": ["Diagnostic", "Réparation"],
    "priceDisplay": "À partir de 5 000 FCFA",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "pages": 1
  }
}
```

#### Create Service (Admin Only)
```http
POST /v1/services
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "title": "New Service",
  "description": "Description",
  "category": "Development",
  "iconCode": 58842,
  "features": ["Feature 1", "Feature 2"],
  "priceDisplay": "Custom price"
}

Response: 201
```

#### Update Service (Admin Only)
```http
PUT /v1/services/:id
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "title": "Updated Service",
  "priceDisplay": "New price"
}

Response: 200
```

#### Delete Service (Admin Only)
```http
DELETE /v1/services/:id
Authorization: Bearer <adminToken>

Response: 200
{
  "success": true,
  "data": { "id": "service-1" }
}
```

### Products

#### Get All Products
```http
GET /v1/products?page=1&limit=20&category=Ordinateurs&search=HP

Response: 200 (with pagination)
```

#### Create Product (Admin Only)
```http
POST /v1/products
Authorization: Bearer <adminToken>

{
  "name": "HP Laptop",
  "description": "High-performance laptop",
  "price": 150000,
  "category": "Ordinateurs",
  "imageUrl": "https://...",
  "stock": 5
}

Response: 201
```

### Promotions

Similar endpoints to Services:
- `GET /v1/promotions?page=1&limit=20`
- `POST /v1/promotions` (admin only)
- `PUT /v1/promotions/:id` (admin only)
- `DELETE /v1/promotions/:id` (admin only)

### Reviews

```http
GET /v1/reviews?page=1&limit=20&productId=product-1

POST /v1/reviews
Authorization: Bearer <userToken>
{
  "productId": "product-1",
  "rating": 5,
  "title": "Excellent product",
  "comment": "Very satisfied with this purchase"
}

DELETE /v1/reviews/:id (user who created it or admin)
```

### Cyber Tickets

```http
GET /v1/cyber-tickets?page=1&limit=20
Authorization: Bearer <userToken>

POST /v1/cyber-tickets
Authorization: Bearer <userToken>
{
  "title": "Security Issue",
  "description": "Description of the issue",
  "priority": "high"
}

PUT /v1/cyber-tickets/:id (owner or admin)
{
  "status": "in-progress",
  "priority": "critical",
  "assignedTo": "admin-1"
}
```

### Computers

```http
GET /v1/computers?page=1&limit=20&status=available

POST /v1/computers (admin only)
{
  "brand": "Dell",
  "model": "OptiPlex 7090",
  "status": "available",
  "location": "Main office"
}

PUT /v1/computers/:id (admin only)

DELETE /v1/computers/:id (admin only)
```

### Users (Admin Only)

```http
GET /v1/users?page=1&limit=20
Authorization: Bearer <adminToken>

GET /v1/users/:id
Authorization: Bearer <adminToken>

PUT /v1/users/:id/role
Authorization: Bearer <adminToken>
{
  "role": "admin"  # ou "user" ou "moderator"
}

PUT /v1/users/:id/deactivate
Authorization: Bearer <adminToken>

DELETE /v1/users/:id (soft delete)
Authorization: Bearer <adminToken>
```

## Response Format

Tous les endpoints retournent une réponse standardisée :

```json
{
  "success": true|false,
  "message": "Optional message",
  "data": {},
  "error": "Optional error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Pour les réponses paginées :

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

## Error Handling

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Database not available |

## Sécurité

✅ **JWT Authentication** - Tous les endpoints protégés utilisent JWT  
✅ **Password Hashing** - bcryptjs pour hasher les mots de passe (10 rounds)  
✅ **CORS Configurable** - Whitelist d'origines au lieu de accept all  
✅ **Rate Limiting** - 100 requêtes par 15 minutes par IP  
✅ **Security Headers** - Helmet pour les headers de sécurité HTTP  
✅ **Input Validation** - Zod validation sur tous les inputs  
✅ **Error Sanitization** - Pas de stack traces en production  

## Déploiement sur Vercel

```bash
# Login à Vercel
vercel login

# Deploy
vercel --prod

# Ou via GitHub CI/CD (recommandé)
git push origin master
# GitHub Actions automatiquement déploiera sur Vercel
```

### Configuration Vercel

1. Variables d'environnement:
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - FIREBASE_SERVICE_ACCOUNT_JSON
   - ALLOWED_ORIGINS

2. Domaines personnalisés dans Vercel Dashboard

## Performance

- Pagination par défaut: 20 items max
- Cache HTTP: 10 minutes sur les GETs
- Compression: gzip automatique sur Vercel
- Lazy loading pour les relations Firebase

## Tests

```bash
# Run tests (à implémenter dans Phase 4)
npm run test

# Run with coverage
npm run test:coverage
```

## Monitoring & Logging

Les logs sont envoyés à:
- Console (développement)
- Fichiers logs (production)
- Optional: Sentry pour error tracking

## Roadmap Futur

- [ ] OpenAPI/Swagger documentation
- [ ] Caching avec Redis
- [ ] Search avancé avec Elasticsearch
- [ ] Webhooks pour événements
- [ ] GraphQL API alternative
- [ ] WebSocket support pour notifications
- [ ] Tests unitaires & intégration
- [ ] Performance monitoring

## Support & Documentation

- **Documentation API** : http://localhost:3000/api-docs (coming soon)
- **Issues** : GitHub Issues
- **Discussions** : GitHub Discussions

## Licence

ISC

---

**Last Updated**: 2024-01-XX  
**Version**: 1.0.0  
**Status**: Production Ready
