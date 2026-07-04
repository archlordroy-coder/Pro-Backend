# 🚀 Quick Start Guide - Pro Informatique API

## Installation Rapide (5 min)

### 1. Cloner et Installer
```bash
# Cloner le repository
git clone <your-repo-url>
cd pro-informatique-api

# Installer dépendances
npm install
```

### 2. Configuration Environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env et remplir:
# - JWT_SECRET (générer: openssl rand -base64 32)
# - JWT_REFRESH_SECRET (générer: openssl rand -base64 32)
# - FIREBASE_* variables (depuis Firebase Console)
# - ALLOWED_ORIGINS (ex: http://localhost:3000)
```

### 3. Lancer le Serveur
```bash
# Mode développement (avec rechargement auto)
npm run dev

# Mode production
npm run build
npm start
```

Le serveur démarre sur `http://localhost:3000` 🎉

---

## First API Calls

### 1. Health Check
```bash
curl http://localhost:3000/health
```

Réponse:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 123.45,
    "timestamp": "2024-07-04T14:42:00Z"
  }
}
```

### 2. Register User (Authentication)
```bash
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

Réponse:
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 3. Login
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### 4. Get Services (Protected - requires token)
```bash
curl -X GET http://localhost:3000/v1/services \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Create Service (Admin only)
```bash
curl -X POST http://localhost:3000/v1/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "Réparation Ordinateur",
    "description": "Service de réparation et maintenance",
    "price": 50,
    "category": "Maintenance",
    "icon": "wrench"
  }'
```

---

## Accéder à la Documentation Interactive

Swagger UI est disponible à:
```
http://localhost:3000/api-docs
```

Vous pouvez:
- Tester tous les endpoints
- Voir les schémas complets
- Essayer les requêtes directs
- Consulter les réponses d'exemple

---

## Variables d'Environnement Essentielles

```env
# Server
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=generate_with_openssl_rand_-base64_32
JWT_REFRESH_SECRET=generate_with_openssl_rand_-base64_32

# Firebase (obtenir depuis Firebase Console)
FIREBASE_PROJECT_ID=pro-informatique
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info
```

---

## Endpoints Principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/v1/auth/register` | Créer un compte |
| POST | `/v1/auth/login` | Se connecter |
| POST | `/v1/auth/refresh` | Rafraîchir token |
| GET | `/v1/services` | Lister services |
| POST | `/v1/services` | Créer service (admin) |
| GET | `/v1/products` | Lister produits |
| POST | `/v1/products` | Créer produit (admin) |
| GET | `/v1/users` | Lister utilisateurs (admin) |

**Documentation complète** à `/api-docs`

---

## Troubleshooting

### Port déjà utilisé
```bash
# Trouver le processus
lsof -i :3000

# Ou utiliser un port différent
PORT=3001 npm run dev
```

### Erreur Firebase
```
❌ Firebase not initialized
```
Vérifier:
- `FIREBASE_PROJECT_ID` configuré
- JSON de service account valide
- Firestore database créée dans Firebase

### Erreur JWT
```
❌ Invalid token
```
Vérifier:
- `JWT_SECRET` défini et identique au token generation
- Token non expiré
- Format: `Authorization: Bearer <token>`

### CORS Error
```
❌ Access-Control-Allow-Origin
```
Ajouter votre URL à `ALLOWED_ORIGINS` dans `.env`

---

## Next Steps

1. **Lire la documentation** - Consulter README.md complet
2. **Explorer l'architecture** - Voir ARCHITECTURE.md
3. **Configurer deploiement** - Suivre DEPLOYMENT.md
4. **Ajouter tests** - Implémenter tests unitaires
5. **Intégrer frontend** - Connecter une app frontend

---

## Aide & Support

- 📚 **Documentation**: Consulter les fichiers .md
- 🔍 **API Docs**: Visitez `/api-docs` pour Swagger
- 🐛 **Debugging**: Activer `LOG_LEVEL=debug` dans .env
- 📖 **Troubleshooting**: Voir README.md section "Common Issues"

**Vous êtes prêt! Bonne luck! 🎉**
