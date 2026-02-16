# Cahier des Charges

## Application de Reservation de Salles - TechSpace Solutions

| | |
|---|---|
| **Projet** | Application web de reservation de salle de reunion |
| **Client** | Marc Dupont - TechSpace Solutions |
| **Equipe** | Formation DWWM - La Plateforme_ |
| **Date** | 16/02/2026 |
| **Version** | 1.0 |
| **Delai** | 2 semaines (06/02/2026 - 18/02/2026) |

---

## Table des matieres

1. [Synopsis](#1-synopsis)
2. [Cahier des Charges Frontend](#2-cahier-des-charges-frontend)
3. [Cahier des Charges Backend](#3-cahier-des-charges-backend)
4. [Annexes](#4-annexes)

---

## 1. Synopsis

### 1.1 Description de l'application

L'application de reservation de salles est une application web permettant aux collaborateurs de TechSpace Solutions de reserver la salle de reunion de maniere autonome et centralisee, eliminant les conflits de double reservation.

### 1.2 Besoin

TechSpace Solutions est un espace de coworking accueillant environ 50 collaborateurs repartis en plusieurs equipes. Ils disposent d'une salle de reunion partagee (capacite 12 personnes).

**Probleme actuel** : Les reservations se font de maniere artisanale (post-its, emails, tableau blanc, bouche a oreille), ce qui entraine :
- Des **conflits de double reservation** (3 le mois dernier)
- Des **creneaux vides** par manque de visibilite
- Une **perte de temps** dans la coordination

**Solution** : Une application web simple et efficace permettant de visualiser le planning en temps reel, de reserver/modifier/annuler des creneaux, et de garantir l'absence de chevauchement.

### 1.3 Contexte d'utilisation

| | |
|---|---|
| **Utilisateurs** | ~50 collaborateurs de TechSpace Solutions |
| **Frequence** | Utilisation quotidienne |
| **Support** | Desktop principalement (navigateur web) |
| **Horaires** | Pendant les heures de bureau (8h00-19h00) |
| **Salle concernee** | 1 salle de reunion (capacite 12 personnes) |

### 1.4 Perimetre du projet (V1)

**Inclus :**
- Authentification (inscription, connexion, deconnexion, profil)
- Visualisation du planning hebdomadaire
- Gestion des reservations (creer, modifier, annuler)
- Regles metier (pas de chevauchement, horaires, jours ouvres)

**Exclus (V2) :**
- Role administrateur
- Gestion multi-salles
- Notifications par email
- Recurrence de reservation
- Application mobile

---

## 2. Cahier des Charges Frontend

### 2.1 Partie Fonctionnelle

#### Besoin

L'interface utilisateur doit permettre aux collaborateurs de TechSpace Solutions de :
- S'inscrire et se connecter de maniere securisee
- Visualiser le planning hebdomadaire avec les creneaux libres/occupes
- Reserver, modifier et annuler des creneaux
- Consulter la liste de leurs reservations

L'interface doit etre **simple, intuitive et rapide** pour une utilisation quotidienne.

#### User Stories & Epics

##### Epic 1 : Authentification

**US-01 | MUST | 5 pts - Inscription**

> En tant que visiteur, je veux creer un compte avec mon email et un mot de passe, afin de pouvoir acceder a l'application.

Criteres de validation :
- Le formulaire contient : email, mot de passe, confirmation du mot de passe
- L'email doit etre au format valide
- Le mot de passe fait minimum 6 caracteres
- Les deux mots de passe doivent correspondre
- Si l'email existe deja -> message d'erreur
- Apres inscription reussie -> redirection vers la page de connexion

**US-02 | MUST | 5 pts - Connexion**

> En tant que visiteur, je veux me connecter avec mon email et mon mot de passe, afin d'acceder au planning et a mes reservations.

Criteres de validation :
- Le formulaire contient : email et mot de passe
- Si identifiants incorrects -> message d'erreur
- Apres connexion reussie -> redirection vers le planning
- Token JWT stocke dans localStorage
- Session expire apres 24h

**US-03 | MUST | 1 pt - Deconnexion**

> En tant que utilisateur connecte, je veux me deconnecter, afin de securiser mon compte.

Criteres de validation :
- Bouton "Deconnexion" visible dans la navigation
- Au clic -> token supprime, redirection vers connexion
- Pages protegees inaccessibles apres deconnexion

**US-04 | SHOULD | 3 pts - Profil**

> En tant que utilisateur connecte, je veux consulter mon profil, afin de verifier mes informations.

Criteres de validation :
- La page affiche : email, prenom, nom, date d'inscription
- Accessible uniquement si connecte

##### Epic 2 : Planning

**US-05 | MUST | 8 pts - Planning hebdomadaire**

> En tant que utilisateur connecte, je veux voir le planning de la semaine en cours (lundi-vendredi), afin de visualiser les creneaux disponibles et occupes.

Criteres de validation :
- Affichage des 5 jours ouvrables (lundi a vendredi)
- Creneaux horaires de 8h00 a 19h00
- Creneaux libres visuellement distincts des occupes
- Creneaux occupes affichent le titre et le nom du reservant
- Dates affichees pour chaque jour

**US-06 | SHOULD | 5 pts - Navigation entre semaines**

> En tant que utilisateur connecte, je veux naviguer entre les semaines, afin de consulter les reservations passees et futures.

Criteres de validation :
- Boutons "Semaine precedente" / "Semaine suivante"
- Bouton "Aujourd'hui" pour revenir a la semaine courante
- Mise a jour dynamique du planning

##### Epic 3 : Reservations

**US-07 | MUST | 5 pts - Creer une reservation**

> En tant que utilisateur connecte, je veux reserver un creneau disponible, afin de bloquer la salle pour ma reunion.

Criteres de validation :
- Formulaire : date, heure debut, heure fin, titre de la reunion
- Duree minimum 1 heure
- Horaires autorises uniquement (8h-19h, lun-ven)
- Impossible de reserver dans le passe
- Impossible de reserver un creneau deja occupe
- Message de confirmation apres reservation

**US-08 | MUST | 3 pts - Mes reservations**

> En tant que utilisateur connecte, je veux voir la liste de mes reservations, afin de suivre mes reunions.

Criteres de validation :
- Liste de toutes mes reservations (passees et futures)
- Chaque reservation : titre, date, heure debut/fin
- Tri par date (les plus proches en premier)

**US-09 | SHOULD | 5 pts - Modifier une reservation**

> En tant que utilisateur connecte, je veux modifier une reservation que j'ai creee, afin de changer l'horaire ou le titre.

Criteres de validation :
- Bouton "Modifier" sur mes reservations uniquement
- Formulaire pre-rempli
- Memes regles de validation
- Impossible de modifier une reservation passee

**US-10 | MUST | 3 pts - Annuler une reservation**

> En tant que utilisateur connecte, je veux annuler une reservation que j'ai creee, afin de liberer le creneau.

Criteres de validation :
- Bouton "Annuler" sur mes reservations uniquement
- Confirmation demandee avant annulation
- Impossible d'annuler une reservation passee
- Planning mis a jour apres annulation

---

### 2.2 Partie Non-Fonctionnelle (Technique)

#### Stack technique Frontend

| | |
|---|---|
| **Framework** | React 19 |
| **Bundler** | Vite 7 |
| **Routing** | React Router DOM 7 |
| **Langage** | JavaScript (ES Modules) |
| **Linter** | ESLint 9 |

#### Routes Frontend

| Route | Composant | Auth | Description |
|-------|-----------|------|-------------|
| `/` | Home | Non | Page d'accueil |
| `/login` | Login | Non | Page de connexion |
| `/register` | Register | Non | Page d'inscription |
| `/dashboard` | Dashboard | Oui | Planning hebdomadaire |
| `/reservations` | MyReservations | Oui | Mes reservations |
| `/profile` | Profile | Oui | Mon profil |
| `*` | - | - | Redirection vers `/` |

#### Architecture des composants

```
src/
├── App.jsx                    # Routes principales
├── main.jsx                   # Point d'entree React
├── index.css                  # Styles globaux
├── components/
│   ├── Header.jsx             # Barre de navigation
│   ├── Footer.jsx             # Pied de page
│   ├── PrivateRoute.jsx       # Protection des routes
│   ├── Planning.jsx           # Grille du planning hebdo
│   └── ReservationForm.jsx    # Formulaire de reservation
├── contexts/
│   └── AuthContext.jsx        # Contexte d'authentification
├── hooks/
│   └── useAuth.js             # Hook custom auth
├── layouts/
│   ├── MainLayout.jsx         # Layout avec Header/Footer
│   └── AuthLayout.jsx         # Layout plein ecran (login/register)
├── pages/
│   ├── Home.jsx               # Page d'accueil
│   ├── Login.jsx              # Page connexion
│   ├── Register.jsx           # Page inscription
│   ├── Dashboard.jsx          # Planning + reservations
│   ├── MyReservations.jsx     # Liste de mes reservations
│   └── Profile.jsx            # Page profil
└── services/
    └── api.js                 # Service d'appels API (fetch)
```

#### Contraintes de securite Frontend

| Mesure | Detail |
|--------|--------|
| **Routes protegees** | Composant `PrivateRoute` redirige vers `/login` si non authentifie |
| **Token JWT** | Stocke dans `localStorage`, envoye via header `Authorization: Bearer <token>` |
| **Validation inputs** | Validation cote client (format email, longueur mdp, champs requis) |
| **Protection XSS** | Pas d'utilisation de `dangerouslySetInnerHTML` |

#### Deploiement Frontend

| | |
|---|---|
| **Build** | `npm run build` (Vite) |
| **Sortie** | Dossier `dist/` |
| **Plateforme** | Vercel / Netlify / GitHub Pages |
| **Variable d'env** | `VITE_API_URL` pour l'URL de l'API backend |

---

## 3. Cahier des Charges Backend

### 3.1 Partie Fonctionnelle

#### Besoin

Le backend doit fournir une API REST consommee par le frontend React (SPA). Il doit gerer :
- L'authentification securisee (inscription, connexion, verification de token)
- Le CRUD des reservations avec validation des regles metier
- La prevention des conflits de double reservation

| | |
|---|---|
| **Consommateur** | Application React (SPA) via fetch API |
| **Utilisateurs simultanes** | ~20 max en periode normale |
| **Pic de charge** | Lundi 8h-10h (~50 requetes/min) |
| **Disponibilite** | 99% pendant les heures ouvrees |

---

### 3.2 Partie Non-Fonctionnelle (Technique)

#### Stack technique Backend

| | |
|---|---|
| **Runtime** | Node.js v18+ |
| **Framework** | Express.js v4.18 |
| **Base de donnees** | MySQL v8 (via mysql2/promise) |
| **Authentification** | JWT (jsonwebtoken v9) + bcrypt v5 |
| **ORM** | Aucun (requetes SQL natives parametrees) |
| **Modules** | ES Modules (`"type": "module"`) |
| **Hot reload** | `node --watch` (Node.js 18+ natif) |
| **Variables d'env** | dotenv v16 |
| **CORS** | cors v2.8 |

#### Architecture Backend

```
backend/
├── server.js                  # Point d'entree Express
├── package.json
├── .env                       # Variables d'environnement (non committe)
├── .env.example               # Template des variables
├── config/
│   └── db.js                  # Pool de connexion MySQL
├── controllers/
│   ├── auth.controller.js     # Logique authentification
│   └── reservation.controller.js  # Logique reservations
├── middlewares/
│   └── auth.middleware.js     # Verification JWT
├── models/
│   ├── user.model.js          # Modele User (requetes SQL)
│   └── reservation.model.js   # Modele Reservation (requetes SQL)
└── routes/
    ├── auth.routes.js         # Routes /api/auth
    └── reservation.routes.js  # Routes /api/reservations
```

#### Endpoints API

##### Authentification

| Methode | Endpoint | Description | Auth | Status |
|---------|----------|-------------|------|--------|
| `POST` | `/api/auth/register` | Inscription | Non | 201, 400, 409 |
| `POST` | `/api/auth/login` | Connexion | Non | 200, 401 |
| `GET` | `/api/auth/me` | Profil utilisateur | Oui | 200, 401 |

##### Reservations

| Methode | Endpoint | Description | Auth | Status |
|---------|----------|-------------|------|--------|
| `GET` | `/api/reservations` | Mes reservations | Oui | 200, 401 |
| `GET` | `/api/reservations/week?date=YYYY-MM-DD` | Reservations de la semaine | Oui | 200, 401 |
| `POST` | `/api/reservations` | Creer une reservation | Oui | 201, 400, 409 |
| `PUT` | `/api/reservations/:id` | Modifier une reservation | Oui | 200, 400, 403, 404, 409 |
| `DELETE` | `/api/reservations/:id` | Annuler une reservation | Oui | 200, 403, 404 |

#### DTOs (Data Transfer Objects)

##### POST /api/auth/register

**Request Body :**
```json
{
  "email": "user@techspace.fr",
  "password": "motdepasse123",
  "firstname": "Jean",
  "lastname": "Dupont"
}
```

**Response 201 :**
```json
{
  "message": "Inscription reussie",
  "user": {
    "id": 1,
    "email": "user@techspace.fr",
    "firstname": "Jean",
    "lastname": "Dupont"
  },
  "token": "eyJhbGciOiJIUzI1..."
}
```

**Response 409 :**
```json
{
  "error": "Email deja utilise"
}
```

##### POST /api/auth/login

**Request Body :**
```json
{
  "email": "user@techspace.fr",
  "password": "motdepasse123"
}
```

**Response 200 :**
```json
{
  "user": {
    "id": 1,
    "email": "user@techspace.fr",
    "firstname": "Jean",
    "lastname": "Dupont"
  },
  "token": "eyJhbGciOiJIUzI1..."
}
```

**Response 401 :**
```json
{
  "error": "Identifiants incorrects"
}
```

##### GET /api/auth/me

**Headers :** `Authorization: Bearer <token>`

**Response 200 :**
```json
{
  "user": {
    "id": 1,
    "email": "user@techspace.fr",
    "firstname": "Jean",
    "lastname": "Dupont",
    "created_at": "2026-02-06T10:00:00.000Z"
  }
}
```

##### POST /api/reservations

**Headers :** `Authorization: Bearer <token>`

**Request Body :**
```json
{
  "title": "Reunion equipe marketing",
  "date": "2026-02-18",
  "start_time": "09:00",
  "end_time": "10:00"
}
```

**Response 201 :**
```json
{
  "message": "Reservation creee avec succes",
  "reservation": {
    "id": 42,
    "title": "Reunion equipe marketing",
    "date": "2026-02-18",
    "start_time": "09:00",
    "end_time": "10:00",
    "user_id": 1
  }
}
```

**Response 409 (conflit) :**
```json
{
  "error": "Ce creneau est deja reserve"
}
```

**Response 400 (validation) :**
```json
{
  "error": "La duree minimum est de 1 heure"
}
```

##### GET /api/reservations/week?date=2026-02-16

**Headers :** `Authorization: Bearer <token>`

**Response 200 :**
```json
{
  "week_start": "2026-02-16",
  "week_end": "2026-02-20",
  "reservations": [
    {
      "id": 42,
      "title": "Reunion equipe marketing",
      "date": "2026-02-18",
      "start_time": "09:00",
      "end_time": "10:00",
      "user_id": 1,
      "user_firstname": "Jean",
      "user_lastname": "Dupont"
    }
  ]
}
```

##### PUT /api/reservations/:id

**Headers :** `Authorization: Bearer <token>`

**Request Body :**
```json
{
  "title": "Reunion equipe marketing (modifiee)",
  "date": "2026-02-18",
  "start_time": "10:00",
  "end_time": "11:00"
}
```

**Response 200 :**
```json
{
  "message": "Reservation modifiee avec succes"
}
```

**Response 403 :**
```json
{
  "error": "Vous ne pouvez modifier que vos propres reservations"
}
```

##### DELETE /api/reservations/:id

**Headers :** `Authorization: Bearer <token>`

**Response 200 :**
```json
{
  "message": "Reservation annulee avec succes"
}
```

#### Codes de statut HTTP utilises

| Code | Signification | Utilisation |
|------|--------------|-------------|
| **200** | OK | Requete reussie (GET, PUT, DELETE) |
| **201** | Created | Ressource creee (POST register, POST reservation) |
| **400** | Bad Request | Donnees invalides (champs manquants, format incorrect) |
| **401** | Unauthorized | Token manquant, expire ou invalide |
| **403** | Forbidden | Action non autorisee (modifier/supprimer la reservation d'un autre) |
| **404** | Not Found | Ressource introuvable |
| **409** | Conflict | Conflit (email deja utilise, creneau deja reserve) |
| **500** | Internal Server Error | Erreur serveur inattendue |

#### Regles metier (validations serveur)

| Regle | Description |
|-------|-------------|
| **Jours ouvres** | Lundi a vendredi uniquement (pas de samedi/dimanche) |
| **Horaires** | De 8h00 a 19h00 strictement |
| **Duree minimum** | 1 heure par creneau |
| **Pas de chevauchement** | Un creneau = une seule reservation (verification en BDD) |
| **Pas de passe** | Impossible de reserver un creneau dont la date/heure est passee |
| **Propriete** | Seul le createur peut modifier/annuler sa reservation |

#### Contraintes de securite Backend

| Mesure | Implementation |
|--------|---------------|
| **Authentification** | JWT (JSON Web Token) avec expiration 24h |
| **Hachage MDP** | bcrypt avec salt (10 rounds par defaut) |
| **Validation** | Validation des entrees cote serveur (email, formats, champs requis) |
| **SQL Injection** | Requetes parametrees (`pool.execute(sql, params)`) |
| **CORS** | Origine autorisee : `http://localhost:5173` uniquement |
| **Propriete** | Verification `user_id` avant modification/suppression |

#### RGPD (Protection des donnees)

**Donnees personnelles collectees :**

| Donnee | Justification | Protection |
|--------|--------------|------------|
| Email | Identification et connexion | Unique en BDD, non expose publiquement |
| Mot de passe | Authentification | Hashe avec bcrypt (jamais stocke en clair) |
| Prenom / Nom | Affichage dans le planning | Visible uniquement par les utilisateurs connectes |

**Mesures RGPD :**
- **Minimisation** : Seules les donnees strictement necessaires sont collectees
- **Securisation** : Mots de passe hashes, token JWT avec expiration
- **Logs** : Aucune information sensible (IP, mot de passe) dans les logs
- **Droit a l'oubli** : `ON DELETE CASCADE` sur les reservations (suppression utilisateur = suppression de ses donnees)

#### Logging

| Niveau | Usage | Exemple |
|--------|-------|---------|
| **DEBUG** | Details techniques (dev uniquement) | Requetes SQL, params |
| **INFO** | Actions normales | `POST /api/auth/login`, `POST /api/reservations` |
| **WARNING** | Comportements suspects | Tentative de connexion echouee |
| **ERROR** | Erreurs applicatives | Erreur BDD, erreur serveur |

*En mode developpement* : Un middleware logger affiche `[timestamp] | METHOD URL` pour chaque requete.

#### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port du serveur | `5000` |
| `NODE_ENV` | Environnement | `development` |
| `DB_HOST` | Hote MySQL | `localhost` |
| `DB_USER` | Utilisateur MySQL | `root` |
| `DB_PASSWORD` | Mot de passe MySQL | *(vide en dev)* |
| `DB_NAME` | Nom de la base | `reservation_salles` |
| `JWT_SECRET` | Cle secrete JWT | *(chaine aleatoire longue)* |
| `JWT_EXPIRES_IN` | Duree du token | `24h` |

#### Deploiement Backend

| | |
|---|---|
| **Plateforme** | Serveur local (Laragon) en developpement |
| **Commande dev** | `npm run dev` (node --watch) |
| **Commande prod** | `npm start` |
| **Port** | 5000 |
| **Prerequis** | Node.js 18+, MySQL 8 |

---

## 4. Annexes

### 4.1 MCD (Modele Conceptuel de Donnees)

*A integrer - voir document `docs/mcd-mld-mpd.md`*

```
┌──────────────────┐                    ┌──────────────────────┐
│   UTILISATEUR    │                    │     RESERVATION      │
├──────────────────┤      cree          ├──────────────────────┤
│ id               │  1,1─────────0,n   │ id                   │
│ email            │                    │ title                │
│ password         │                    │ date                 │
│ firstname        │                    │ start_time           │
│ lastname         │                    │ end_time             │
│ created_at       │                    │ created_at           │
│ updated_at       │                    │ updated_at           │
└──────────────────┘                    └──────────────────────┘
```

Un utilisateur peut creer 0 ou plusieurs reservations (0,n).
Une reservation est creee par exactement 1 utilisateur (1,1).

### 4.2 MLD (Modele Logique de Donnees)

**TABLE : users**
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL |
| firstname | VARCHAR(100) | NOT NULL |
| lastname | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE |

**TABLE : reservations**
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT |
| title | VARCHAR(255) | NOT NULL |
| date | DATE | NOT NULL |
| start_time | TIME | NOT NULL |
| end_time | TIME | NOT NULL |
| user_id | INT UNSIGNED | FK -> users.id, NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE |

### 4.3 MPD (Script SQL)

```sql
CREATE DATABASE IF NOT EXISTS reservation_salles
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE reservation_salles;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reservations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_date (date),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;
```

### 4.4 Diagramme de cas d'utilisation

```
                    ┌─────────────────────────────────┐
                    │    Application Reservation      │
                    │                                 │
   Visiteur ───────>│  - S'inscrire                   │
       |            │  - Se connecter                 │
       |            │                                 │
       v            │                                 │
  Utilisateur ─────>│  - Voir le planning             │
  connecte          │  - Creer une reservation        │
                    │  - Modifier sa reservation      │
                    │  - Annuler sa reservation       │
                    │  - Voir ses reservations        │
                    │  - Consulter son profil         │
                    │  - Se deconnecter               │
                    │                                 │
   Systeme ────────>│  - Valider les regles metier    │
                    │  - Empecher les chevauchements  │
                    │  - Verifier les horaires        │
                    └─────────────────────────────────┘
```

### 4.5 Maquettes / Wireframes

*A integrer - wireframes des pages :*
- Page de connexion / inscription
- Planning hebdomadaire
- Formulaire de reservation
- Liste de mes reservations
- Page profil

*Outils recommandes : Figma, draw.io, Excalidraw*

---

## Checklist de validation du CDC

- [x] Synopsis : description, besoin, contexte
- [x] CDC Frontend - Fonctionnel : User Stories avec criteres de validation
- [x] CDC Frontend - Non-fonctionnel : Routes, securite, deploiement
- [x] CDC Backend - Fonctionnel : Besoin, utilisateurs, charge
- [x] CDC Backend - Stack : Technologies utilisees
- [x] CDC Backend - Endpoints : Toutes les routes avec status codes et DTOs
- [x] CDC Backend - Securite : Auth, validation, CORS
- [x] CDC Backend - RGPD : Donnees personnelles, logs
- [x] Annexes : MCD, MLD, MPD, diagrammes
