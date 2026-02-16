# Modelisation de Base de Donnees

## MCD / MLD / MPD - Application de Reservation de Salles

**Projet** : TechSpace Solutions
**Date** : 16/02/2026
**SGBD** : MySQL 8
**Outil** : draw.io / MySQL Workbench

---

## 1. Rappel des 3 niveaux

| Niveau | Description | Question |
|--------|-------------|----------|
| **MCD** | Modele Conceptuel de Donnees - Vision "metier" | QUOI stocker ? |
| **MLD** | Modele Logique de Donnees - Tables, colonnes, cles | COMMENT organiser ? |
| **MPD** | Modele Physique de Donnees - Script SQL | COMMENT implementer ? |

```
MCD  -->  MLD  -->  MPD  -->  Base de donnees
```

---

## 2. MCD - Modele Conceptuel de Donnees

### 2.1 Identification des entites

A partir du brief client, on identifie les "choses" a stocker :

| Entite | Description | Justification |
|--------|-------------|---------------|
| **UTILISATEUR** | Un collaborateur de TechSpace | Il s'inscrit, se connecte, reserve |
| **RESERVATION** | Un creneau reserve dans la salle | C'est l'objet principal de l'application |

> **Note** : Pas d'entite SALLE dans la V1 car le brief precise qu'il n'y a qu'une seule salle. L'entite SALLE sera ajoutee en V2 (multi-salles).

### 2.2 Identification des attributs

**UTILISATEUR**
| Attribut | Description | Obligatoire |
|----------|-------------|-------------|
| id | Identifiant unique | Oui (auto) |
| email | Adresse email (identifiant de connexion) | Oui |
| password | Mot de passe (hashe) | Oui |
| firstname | Prenom | Oui |
| lastname | Nom de famille | Oui |
| created_at | Date d'inscription | Oui (auto) |
| updated_at | Date de derniere modification | Oui (auto) |

**RESERVATION**
| Attribut | Description | Obligatoire |
|----------|-------------|-------------|
| id | Identifiant unique | Oui (auto) |
| title | Titre/objet de la reunion | Oui |
| date | Date de la reservation (YYYY-MM-DD) | Oui |
| start_time | Heure de debut (HH:MM) | Oui |
| end_time | Heure de fin (HH:MM) | Oui |
| created_at | Date de creation | Oui (auto) |
| updated_at | Date de derniere modification | Oui (auto) |

### 2.3 Identification des associations

| Association | Entite 1 | Entite 2 | Description |
|-------------|----------|----------|-------------|
| **cree** | UTILISATEUR | RESERVATION | Un utilisateur cree des reservations |

### 2.4 Cardinalites

**UTILISATEUR** (1,1) ---- cree ---- (0,n) **RESERVATION**

- Un **utilisateur** peut creer **0 ou plusieurs** reservations (0,n)
  - 0 : un utilisateur peut ne jamais avoir reserve
  - n : un utilisateur peut faire autant de reservations qu'il veut
- Une **reservation** est creee par **exactement 1** utilisateur (1,1)
  - 1,1 : chaque reservation a obligatoirement un et un seul createur

### 2.5 Schema MCD

```
┌────────────────────────┐                         ┌────────────────────────┐
│      UTILISATEUR       │                         │      RESERVATION       │
│========================│                         │========================│
│ #id                    │                         │ #id                    │
│  email                 │         cree            │  title                 │
│  password              │  (1,1)────────(0,n)     │  date                  │
│  firstname             │                         │  start_time            │
│  lastname              │                         │  end_time              │
│  created_at            │                         │  created_at            │
│  updated_at            │                         │  updated_at            │
└────────────────────────┘                         └────────────────────────┘
```

**Lecture :**
- Un utilisateur **cree** zero ou plusieurs reservations
- Une reservation **est creee par** exactement un utilisateur

---

## 3. MLD - Modele Logique de Donnees

### 3.1 Regles de transformation MCD -> MLD

| Regle | MCD | MLD |
|-------|-----|-----|
| 1 | Chaque ENTITE | Devient une TABLE |
| 2 | Chaque ATTRIBUT | Devient une COLONNE |
| 3 | L'identifiant (#id) | Devient la CLE PRIMAIRE (PK) |
| 4 | Association 1,n | La cle primaire du cote "1" migre comme CLE ETRANGERE (FK) dans la table cote "n" |

### 3.2 Application au projet

L'association **UTILISATEUR (1,1) -- cree -- (0,n) RESERVATION** est de type **1:N** (un-a-plusieurs).

Regle 4 : La cle primaire de UTILISATEUR (`id`) migre comme cle etrangere dans RESERVATION sous le nom `user_id`.

### 3.3 Schema MLD

**Notation : NomTable (colonne1, colonne2, #cle_etrangere)**

```
users (id, email, password, firstname, lastname, created_at, updated_at)
reservations (id, title, date, start_time, end_time, #user_id, created_at, updated_at)
```

### 3.4 Tables detaillees

#### TABLE : users

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| **id** | INT UNSIGNED | PK, AUTO_INCREMENT | Identifiant unique |
| email | VARCHAR(255) | NOT NULL, UNIQUE, INDEX | Adresse email |
| password | VARCHAR(255) | NOT NULL | Mot de passe hashe (bcrypt) |
| firstname | VARCHAR(100) | NOT NULL | Prenom |
| lastname | VARCHAR(100) | NOT NULL | Nom de famille |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de creation |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Date de modification |

#### TABLE : reservations

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| **id** | INT UNSIGNED | PK, AUTO_INCREMENT | Identifiant unique |
| title | VARCHAR(255) | NOT NULL | Titre/objet de la reunion |
| date | DATE | NOT NULL, INDEX | Date de la reservation |
| start_time | TIME | NOT NULL | Heure de debut |
| end_time | TIME | NOT NULL | Heure de fin |
| **user_id** | INT UNSIGNED | FK -> users.id, NOT NULL, INDEX | Createur de la reservation |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de creation |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Date de modification |

### 3.5 Schema relationnel

```
┌─────────────────────────────┐         ┌─────────────────────────────────┐
│          users              │         │        reservations             │
│─────────────────────────────│         │─────────────────────────────────│
│ PK  id          INT         │───┐     │ PK  id            INT          │
│     email       VARCHAR(255)│   │     │     title         VARCHAR(255) │
│     password    VARCHAR(255)│   │     │     date          DATE         │
│     firstname   VARCHAR(100)│   │     │     start_time    TIME         │
│     lastname    VARCHAR(100)│   ├────>│ FK  user_id       INT          │
│     created_at  TIMESTAMP   │         │     end_time      TIME         │
│     updated_at  TIMESTAMP   │         │     created_at    TIMESTAMP    │
└─────────────────────────────┘         │     updated_at    TIMESTAMP    │
                                        └─────────────────────────────────┘

                users.id  ──1────N──>  reservations.user_id
```

### 3.6 Justification des choix de types

| Choix | Justification |
|-------|---------------|
| **DATE** pour la date | Permet les comparaisons et tris natifs MySQL (`WHERE date >= '2026-02-16'`) |
| **TIME** pour les heures | Plus precis que DATETIME, separe bien date et horaires |
| **VARCHAR(255)** pour le password | bcrypt genere un hash de 60 caracteres, 255 laisse de la marge |
| **INT UNSIGNED** pour les id | Pas de valeur negative, double la plage positive |
| **ON DELETE CASCADE** | Si un utilisateur est supprime, ses reservations le sont aussi (RGPD) |
| **INDEX sur date** | Les requetes filtrent souvent par semaine -> performance |
| **INDEX sur user_id** | Les requetes "mes reservations" filtrent par user_id -> performance |

---

## 4. MPD - Modele Physique de Donnees (Script SQL)

### 4.1 Script complet

```sql
-- ============================================
-- MPD - Reservation de Salles
-- TechSpace Solutions
-- MySQL 8 | UTF8MB4
-- Date : 16/02/2026
-- ============================================

-- Creation de la base de donnees
CREATE DATABASE IF NOT EXISTS reservation_salles
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE reservation_salles;

-- ============================================
-- TABLE : users
-- Stocke les collaborateurs de TechSpace
-- ============================================
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

-- ============================================
-- TABLE : reservations
-- Stocke les reservations de la salle
-- ============================================
CREATE TABLE IF NOT EXISTS reservations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Cle etrangere vers users
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Index pour les performances
    INDEX idx_date (date),
    INDEX idx_user_id (user_id),
    INDEX idx_date_times (date, start_time, end_time)
) ENGINE=InnoDB;
```

### 4.2 Requetes utiles (exemples)

```sql
-- Recuperer les reservations d'une semaine (lundi 16/02 au vendredi 20/02)
SELECT r.*, u.firstname, u.lastname
FROM reservations r
JOIN users u ON r.user_id = u.id
WHERE r.date BETWEEN '2026-02-16' AND '2026-02-20'
ORDER BY r.date, r.start_time;

-- Verifier si un creneau est deja pris (detection chevauchement)
SELECT id FROM reservations
WHERE date = '2026-02-18'
  AND start_time < '10:00'
  AND end_time > '09:00';

-- Recuperer mes reservations (user_id = 1)
SELECT * FROM reservations
WHERE user_id = 1
ORDER BY date DESC, start_time DESC;

-- Compter les reservations par jour de la semaine
SELECT date, COUNT(*) as nb_reservations
FROM reservations
WHERE date BETWEEN '2026-02-16' AND '2026-02-20'
GROUP BY date;
```

### 4.3 Explication de la detection de chevauchement

La requete cle pour empecher les double-reservations :

```sql
SELECT id FROM reservations
WHERE date = ?
  AND start_time < ?   -- le debut existant est avant la fin demandee
  AND end_time > ?      -- la fin existante est apres le debut demande
```

Avec `?` = (date demandee, end_time demandee, start_time demandee).

**Principe** : Deux creneaux [A-B] et [C-D] se chevauchent si et seulement si A < D **ET** B > C.

```
Existant :     |████████|         (09:00 - 10:00)
Demande 1 :        |████████|    (09:30 - 10:30)  -> CONFLIT (chevauchement)
Demande 2 :  |████|              (08:00 - 09:00)  -> OK (pas de chevauchement)
Demande 3 :              |████|  (10:00 - 11:00)  -> OK (pas de chevauchement)
Demande 4 :    |██████████████|  (08:30 - 11:00)  -> CONFLIT (englobe)
```

---

## 5. Checklist de validation

- [x] Le MCD identifie toutes les entites (UTILISATEUR, RESERVATION)
- [x] Les attributs sont complets et pertinents
- [x] Les cardinalites sont correctes (1,1 -- 0,n)
- [x] Le MLD a les cles primaires (PK) sur chaque table
- [x] Le MLD a la cle etrangere (FK) user_id dans reservations
- [x] Le script SQL est fonctionnel et executable
- [x] Les types de donnees sont appropries (DATE, TIME, VARCHAR, INT)
- [x] Les contraintes sont definies (NOT NULL, UNIQUE, FOREIGN KEY)
- [x] Les index sont places pour la performance (date, user_id, email)
- [x] ON DELETE CASCADE est configure (RGPD - droit a l'oubli)
