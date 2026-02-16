# User Stories - Application de Reservation de Salles

**Projet** : TechSpace Solutions - Reservation de Salle
**Date** : 16/02/2026
**Version** : 1.0

---

## Roles identifies

| Role | Description | Peut faire... |
|------|-------------|---------------|
| **Visiteur** | Personne non connectee | S'inscrire, se connecter |
| **Utilisateur connecte** | Personne authentifiee | Voir planning, reserver, gerer ses reservations, voir son profil |
| **Systeme** | L'application elle-meme | Valider les regles metier, empecher les conflits |

---

## Epic 1 : Authentification

### US-01 | MUST | 5 pts | Inscription

**En tant que** visiteur,
**je veux** creer un compte avec mon email et un mot de passe,
**afin de** pouvoir acceder a l'application et reserver des creneaux.

**Criteres d'acceptation :**
- [ ] Le formulaire contient : email, mot de passe, confirmation du mot de passe
- [ ] L'email doit etre au format valide (ex: user@example.com)
- [ ] Le mot de passe fait minimum 6 caracteres
- [ ] Les deux mots de passe doivent correspondre, sinon message d'erreur
- [ ] Si l'email existe deja en base -> message d'erreur "Cet email est deja utilise"
- [ ] Apres inscription reussie -> redirection vers la page de connexion
- [ ] Le mot de passe est hashe (bcrypt) en base de donnees
- [ ] Tous les champs sont obligatoires

---

### US-02 | MUST | 5 pts | Connexion

**En tant que** visiteur,
**je veux** me connecter avec mon email et mon mot de passe,
**afin de** acceder au planning et a mes reservations.

**Criteres d'acceptation :**
- [ ] Le formulaire contient : email et mot de passe
- [ ] Si les identifiants sont incorrects -> message d'erreur "Email ou mot de passe incorrect"
- [ ] Apres connexion reussie -> redirection vers le planning (dashboard)
- [ ] Un token JWT est genere et stocke cote client (localStorage)
- [ ] La session expire apres 24h (expiration du token)
- [ ] Les champs sont obligatoires

---

### US-03 | MUST | 1 pt | Deconnexion

**En tant que** utilisateur connecte,
**je veux** me deconnecter,
**afin de** securiser mon compte quand je quitte l'application.

**Criteres d'acceptation :**
- [ ] Un bouton "Deconnexion" est visible dans la barre de navigation
- [ ] Au clic -> le token est supprime du localStorage
- [ ] L'utilisateur est redirige vers la page de connexion
- [ ] Les pages protegees ne sont plus accessibles apres deconnexion

---

### US-04 | SHOULD | 3 pts | Consultation du profil

**En tant que** utilisateur connecte,
**je veux** consulter mon profil,
**afin de** verifier mes informations personnelles.

**Criteres d'acceptation :**
- [ ] La page profil affiche : email, date d'inscription
- [ ] Les informations sont recuperees via l'API (GET /api/auth/me)
- [ ] La page est accessible uniquement si connecte
- [ ] Si non connecte -> redirection vers la page de connexion

---

## Epic 2 : Visualisation du Planning

### US-05 | MUST | 8 pts | Affichage du planning hebdomadaire

**En tant que** utilisateur connecte,
**je veux** voir le planning de la semaine en cours (lundi au vendredi),
**afin de** visualiser les creneaux disponibles et occupes.

**Criteres d'acceptation :**
- [ ] Le planning affiche les 5 jours ouvrables (lundi a vendredi)
- [ ] Les creneaux horaires vont de 8h00 a 19h00
- [ ] Les creneaux libres sont clairement distingues des creneaux occupes (couleur differente)
- [ ] Les creneaux occupes affichent le titre de la reunion et le nom du reservant
- [ ] Le planning est charge automatiquement a l'ouverture de la page
- [ ] Les dates de la semaine sont affichees pour chaque jour

---

### US-06 | SHOULD | 5 pts | Navigation entre semaines

**En tant que** utilisateur connecte,
**je veux** naviguer entre les semaines (precedente/suivante),
**afin de** consulter les reservations passees et futures.

**Criteres d'acceptation :**
- [ ] Des boutons "Semaine precedente" et "Semaine suivante" sont presents
- [ ] Un bouton "Aujourd'hui" permet de revenir a la semaine en cours
- [ ] Le planning se met a jour dynamiquement lors du changement de semaine
- [ ] Les dates affichees correspondent bien a la semaine selectionnee

---

## Epic 3 : Gestion des Reservations

### US-07 | MUST | 5 pts | Creer une reservation

**En tant que** utilisateur connecte,
**je veux** reserver un creneau disponible,
**afin de** bloquer la salle pour ma reunion.

**Criteres d'acceptation :**
- [ ] Un formulaire permet de saisir : date, heure de debut, heure de fin, titre de la reunion
- [ ] La duree minimum est de 1 heure
- [ ] Le creneau doit etre dans les horaires autorises (8h00-19h00)
- [ ] Le creneau doit etre un jour ouvre (lundi-vendredi)
- [ ] Impossible de reserver un creneau deja passe
- [ ] Impossible de reserver un creneau deja occupe -> message d'erreur "Ce creneau est deja reserve"
- [ ] Apres reservation reussie -> le planning se met a jour
- [ ] Un message de confirmation s'affiche

---

### US-08 | MUST | 3 pts | Voir mes reservations

**En tant que** utilisateur connecte,
**je veux** voir la liste de mes reservations,
**afin de** garder un suivi de mes reunions planifiees.

**Criteres d'acceptation :**
- [ ] La page affiche toutes mes reservations (passees et futures)
- [ ] Chaque reservation affiche : titre, date, heure debut, heure fin
- [ ] Les reservations sont triees par date (les plus proches en premier)
- [ ] Les reservations passees sont visuellement differentes des futures

---

### US-09 | SHOULD | 5 pts | Modifier une reservation

**En tant que** utilisateur connecte,
**je veux** modifier une reservation que j'ai creee,
**afin de** changer l'horaire ou le titre de ma reunion.

**Criteres d'acceptation :**
- [ ] Un bouton "Modifier" est visible sur mes reservations (uniquement les miennes)
- [ ] Le formulaire de modification est pre-rempli avec les donnees actuelles
- [ ] Les memes regles de validation s'appliquent (pas de chevauchement, horaires, etc.)
- [ ] Impossible de modifier une reservation passee
- [ ] Apres modification -> le planning se met a jour
- [ ] Seul le proprietaire de la reservation peut la modifier

---

### US-10 | MUST | 3 pts | Annuler une reservation

**En tant que** utilisateur connecte,
**je veux** annuler une reservation que j'ai creee,
**afin de** liberer le creneau pour les autres collaborateurs.

**Criteres d'acceptation :**
- [ ] Un bouton "Annuler" est visible sur mes reservations (uniquement les miennes)
- [ ] Une confirmation est demandee avant l'annulation ("Etes-vous sur ?")
- [ ] Impossible d'annuler une reservation passee
- [ ] Apres annulation -> le planning se met a jour et le creneau redevient libre
- [ ] Seul le proprietaire de la reservation peut l'annuler

---

### US-11 | MUST | 2 pts | Validation des regles metier (Systeme)

**En tant que** systeme,
**je veux** valider les regles metier lors de chaque reservation,
**afin de** garantir la coherence du planning et eviter les conflits.

**Criteres d'acceptation :**
- [ ] Rejet si chevauchement avec une reservation existante
- [ ] Rejet si creneau en dehors des horaires (avant 8h ou apres 19h)
- [ ] Rejet si jour non ouvre (samedi, dimanche)
- [ ] Rejet si duree inferieure a 1 heure
- [ ] Rejet si date/heure dans le passe
- [ ] Message d'erreur clair pour chaque cas de rejet

---

## Recapitulatif

### Priorites MoSCoW

| Priorite | User Stories | Total Points |
|----------|-------------|-------------|
| **MUST** | US-01, US-02, US-03, US-05, US-07, US-08, US-10, US-11 | 32 pts |
| **SHOULD** | US-04, US-06, US-09 | 13 pts |
| **COULD** | (Hors perimetre V1) | - |
| **WON'T** | Admin, multi-salles, notifications email, recurrence | - |

### MVP (Minimum Viable Product) = Tous les MUST = 32 points

| ID | User Story | Priorite | Points |
|----|-----------|----------|--------|
| US-01 | Inscription | MUST | 5 |
| US-02 | Connexion | MUST | 5 |
| US-03 | Deconnexion | MUST | 1 |
| US-04 | Profil | SHOULD | 3 |
| US-05 | Planning hebdomadaire | MUST | 8 |
| US-06 | Navigation entre semaines | SHOULD | 5 |
| US-07 | Creer une reservation | MUST | 5 |
| US-08 | Voir mes reservations | MUST | 3 |
| US-09 | Modifier une reservation | SHOULD | 5 |
| US-10 | Annuler une reservation | MUST | 3 |
| US-11 | Regles metier (systeme) | MUST | 2 |
| **TOTAL** | | | **45 pts** |

---

## Hors perimetre (WON'T - V2)

- Role administrateur
- Gestion multi-salles
- Notifications par email
- Recurrence de reservation
- Application mobile
- Paiement en ligne
