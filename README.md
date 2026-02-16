# Starter-Kit

Ce document est un guide technique (Starter Kit) pour créer une base de projet web moderne utilisant Node.js, Express, React et MySQL.

## Structure du projet

```
starter-kit/
├── server/
│   ├── config/
│   │   └── db.js              # Connexion MySQL (pool)
│   ├── controllers/
│   │   └── auth.controller.js # Logique d'authentification
│   ├── middlewares/
│   │   └── auth.middleware.js # Vérification JWT
│   ├── models/
│   │   └── user.model.js      # Modèle User
│   ├── routes/
│   │   └── auth.routes.js     # Routes /api/auth
│   ├── .env                   # Variables d'environnement
│   ├── .env.example           # Template des variables
│   ├── package.json
│   └── server.js              # Point d'entrée
├── database/
│   └── schema.sql             # Script de création BDD
├── client/                    # (React - Vite) À créer
└── README.md
```

## Installation

### 1. Base de données

Exécuter le script SQL pour créer la base de données :

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd server
npm install
```

Configurer les variables d'environnement dans `server/.env` :

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=starter_kit
JWT_SECRET=votre_secret_super_securise_a_changer
JWT_EXPIRES_IN=7d
```

### 3. Lancer le serveur

```bash
npm run dev
```

Le serveur démarre sur http://localhost:5000

## API Endpoints

| Route | Méthode | Description | Auth |
|-------|---------|-------------|------|
| `/` | GET | Status de l'API | Non |
| `/api/auth/register` | POST | Inscription | Non |
| `/api/auth/login` | POST | Connexion | Non |
| `/api/auth/me` | GET | Profil utilisateur | Oui |

### Exemples de requêtes

**Register :**
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "motdepasse",
  "firstname": "John",
  "lastname": "Doe"
}
```

**Login :**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "motdepasse"
}
```

**Profile (avec token) :**
```
GET /api/auth/me
Authorization: Bearer <token>
```

## Technologies

| Package | Usage |
|---------|-------|
| express | Framework web |
| cors | Gestion CORS |
| mysql2 | Driver MySQL avec promises |
| dotenv | Variables d'environnement |
| bcrypt | Hashage des mots de passe |
| jsonwebtoken | Authentification JWT |

## Notes ES Modules

- `"type": "module"` activé dans package.json
- Extension `.js` obligatoire pour les imports locaux
- `node --watch` intégré (Node.js 18+) remplace nodemon
