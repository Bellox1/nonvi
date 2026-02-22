# Nonvi Voyage Plus - Backend (Laravel API) 🐘

Le backend de **Nonvi Voyage Plus** gère toute la logique métier, les réservations, les paiements, et la communication avec les utilisateurs.

## 📋 Fonctionnalités Principal
- **API REST** : Communication sécurisée avec l'application mobile.
- **Gestion des Réservations** : Horaires, places disponibles, tarifs.
- **Vérification Mobile** : Système OTP via Twilio.
- **Interface d'Admin** : Gestion des bus, des chauffeurs et des stations.
- **Page d'Accueil** : Présentation web de l'entreprise.

## 🛠 Installation

1. Accéder au dossier :
   ```bash
   cd backend
   ```
2. Installer les dépendances :
   ```bash
   composer install
   ```
3. Configurer l'environnement :
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
4. Migrer la base de données :
   ```bash
   php artisan migrate --seed
   ```
5. Lancer le serveur :
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```

## 🔐 Variables d'Environnement (.env)
Assurez-vous de configurer :
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SID`
- `APP_URL` (nécessaire pour les liens d'images)

## 📡 Endpoints API Majeurs
- `POST /api/v1/login` : Authentification.
- `GET /api/v1/trajets` : Liste des trajets disponibles.
- `POST /api/v1/reservations` : Créer une réservation.

---
Développé avec **Laravel 11**.