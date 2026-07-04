# Pro Informatique - API Backend

## Description

API REST pour l'application Pro Informatique, gérant les services, produits, promotions, utilisateurs et authentification.

## Technologies

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Firebase Admin SDK** - Base de données Firestore
- **TypeScript** - Typage statique
- **Vercel** - Déploiement cloud

## Installation

```bash
npm install
```

## Configuration

### Variables d'environnement

Créer un fichier `.env` avec les variables suivantes :

```env
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"..."}'
```

### Configuration Firebase

L'API utilise Firebase Firestore comme base de données. Deux modes de configuration sont possibles :

1. **Avec variable d'environnement** (recommandé pour production) :
   - Définir `FIREBASE_SERVICE_ACCOUNT_JSON` avec le JSON du compte de service Firebase

2. **Avec identifiants par défaut** (développement) :
   - Définir la variable d'environnement `GOOGLE_APPLICATION_CREDENTIALS` pointant vers le fichier de clés

### Mode Mock

Si Firebase n'est pas configuré, l'API fonctionne en mode mock avec des données de démonstration automatiques.

## Endpoints API

### Base URL
```
https://api.proinformatique.dev
```

### Services

#### GET /services
Récupérer tous les services

**Réponse :**
```json
[
  {
    "id": "1",
    "title": "Réparation PC",
    "description": "Réparation et maintenance de PC",
    "iconCode": 58709,
    "features": ["Diagnostic", "Réparation", "Maintenance"],
    "category": "Réparation",
    "priceDisplay": "À partir de 5 000 FCFA"
  }
]
```

#### POST /services
Créer un nouveau service

**Corps de la requête :**
```json
{
  "id": "unique-id",
  "title": "Titre du service",
  "description": "Description",
  "iconCode": 58709,
  "features": ["Feature 1", "Feature 2"],
  "category": "Catégorie",
  "priceDisplay": "Prix affiché"
}
```

#### PUT /services/:id
Mettre à jour un service

#### DELETE /services/:id
Supprimer un service

### Produits

#### GET /products
Récupérer tous les produits

**Réponse :**
```json
[
  {
    "id": "1",
    "name": "Ordinateur Portable HP",
    "description": "PC portable performant",
    "price": 150000,
    "priceDisplay": "150 000 FCFA",
    "category": "Ordinateurs",
    "imageUrl": "https://example.com/image.jpg"
  }
]
```

#### POST /products
Créer un nouveau produit

#### PUT /products/:id
Mettre à jour un produit

#### DELETE /products/:id
Supprimer un produit

### Promotions

#### GET /promotions
Récupérer toutes les promotions

**Réponse :**
```json
[
  {
    "id": "1",
    "title": "Promo Été",
    "description": "-20% sur tous les ordinateurs",
    "imageUrl": "https://example.com/promo.jpg"
  }
]
```

#### POST /promotions
Créer une nouvelle promotion

#### PUT /promotions/:id
Mettre à jour une promotion

#### DELETE /promotions/:id
Supprimer une promotion

### Authentification

#### POST /auth/register
Créer un compte utilisateur

**Corps de la requête :**
```json
{
  "name": "Nom complet",
  "email": "email@example.com",
  "password": "motdepasse"
}
```

**Réponse :**
```json
{
  "message": "User created successfully",
  "userId": "user-id"
}
```

#### POST /auth/login
Connexion utilisateur

**Corps de la requête :**
```json
{
  "email": "email@example.com",
  "password": "motdepasse"
}
```

**Réponse :**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "email": "email@example.com",
    "name": "Nom complet",
    "role": "user"
  },
  "token": "simple-token-user-id"
}
```

### Gestion des Utilisateurs (Admin)

#### GET /users
Récupérer tous les utilisateurs (admin uniquement)

**Réponse :**
```json
[
  {
    "id": "1",
    "email": "admin@proinformatique.dev",
    "name": "Admin User",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### DELETE /users/:id
Supprimer un utilisateur (admin uniquement)

#### PUT /users/:id/role
Modifier le rôle d'un utilisateur (admin uniquement)

**Corps de la requête :**
```json
{
  "role": "admin"
}
```

### Autres Endpoints

- **Reviews** : `/reviews` (GET, POST, DELETE)
- **Cyber Tickets** : `/cyber-tickets` (GET, POST, PUT, DELETE)
- **Computers** : `/computers` (GET, PUT)

## Déploiement

### Vercel

L'API est déployée sur Vercel avec la configuration suivante :

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/src/index.ts"
    }
  ]
}
```

Pour déployer :

```bash
vercel --prod
```

### URL de Production

L'API est accessible à l'adresse suivante :
```
https://api.proinformatique.dev
```

### Configuration des Variables d'Environnement sur Vercel

1. Aller sur le dashboard Vercel
2. Sélectionner le projet
3. Aller dans Settings > Environment Variables
4. Ajouter `FIREBASE_SERVICE_ACCOUNT_JSON` avec le JSON du compte de service Firebase
5. Redéployer l'application

## Utilisation de l'API par les Autres Projets

### Web Panel

Le web panel (Next.js) utilise cette API via le fichier `lib/api.ts` :

```typescript
const API_BASE_URL = 'https://api.proinformatique.dev';

// Exemple d'appel
export async function getServices() {
  const response = await fetch(`${API_BASE_URL}/services`);
  return response.json();
}
```

### Application Mobile

L'application mobile (Flutter) utilise cette API via le fichier `lib/services/api_service.dart` :

```dart
const String baseUrl = 'https://api.proinformatique.dev';

// Exemple d'appel
Future<List<Service>> getServices() async {
  final response = await http.get(Uri.parse('$baseUrl/services'));
  return json.decode(response.body);
}
```

### Intégration

Pour intégrer cette API dans un nouveau projet :

1. **Installer les dépendances HTTP** :
   - JavaScript/TypeScript : `npm install axios` ou utiliser `fetch`
   - Flutter : `flutter pub add http`

2. **Configurer l'URL de base** :
   ```typescript
   const API_BASE_URL = 'https://api.proinformatique.dev';
   ```

3. **Faire des requêtes** :
   ```typescript
   // GET
   const response = await fetch(`${API_BASE_URL}/services`);
   const data = await response.json();

   // POST
   const response = await fetch(`${API_BASE_URL}/auth/login`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   });
   ```

4. **Gérer les erreurs** :
   ```typescript
   try {
     const response = await fetch(`${API_BASE_URL}/services`);
     if (!response.ok) throw new Error('API error');
     const data = await response.json();
   } catch (error) {
     console.error('Error:', error);
   }
   ```

## Structure du Projet

```
API/
├── src/
│   └── index.ts          # Point d'entrée principal
├── package.json          # Dépendances
├── tsconfig.json         # Configuration TypeScript
├── vercel.json           # Configuration Vercel
├── .env.example          # Exemple de variables d'environnement
└── README.md             # Documentation
```

## Sécurité

- Les mots de passe sont stockés en clair (à améliorer avec bcrypt en production)
- CORS configuré pour accepter toutes les origines (à restreindre en production)
- Pas de middleware d'authentification sur les endpoints publics

## Améliorations Futures

- [ ] Hashage des mots de passe avec bcrypt
- [ ] JWT pour l'authentification
- [ ] Rate limiting
- [ ] Validation des entrées plus stricte
- [ ] Tests unitaires
- [ ] Logging avancé
