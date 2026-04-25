# 🐘 Nonvi Backend - Le Cœur du Système (Laravel API)

Le backend de **Nonvi Voyage Plus** est le moteur central de la plateforme. Conçu avec **Laravel 11**, il fournit une API RESTful robuste, gère la persistance des données, la sécurité des transactions et l'interface d'administration globale du réseau de transport.

---

## 🏗️ Architecture & Fonctionnalités

*   **🛰️ API RESTful Haute Performance** : Point d'entrée unique pour l'application mobile et les services tiers.
*   **🔐 Sécurité Avancée** : Authentification par OTP (One-Time Password) via Twilio pour une vérification mobile sans faille.
*   **🛒 Moteur de Réservation** : Gestion dynamique des stocks de places, des horaires et des files d'attente.
*   **👨‍💼 Administration Centralisée** : Gestion fine des ressources (Bus, Chauffeurs, Stations, Tarifs).
*   **📊 Reporting & Analytics** : Extraction des données de vente et de fréquentation.

---

## 🛠️ Stack Technique

*   **Framework** : Laravel 11 (PHP 8.2+)
*   **Base de données** : MySQL / PostgreSQL
*   **Communications** : Twilio SMS/WhatsApp API
*   **Cache & Queue** : Redis pour une réactivité optimale.

---

## 🚀 Installation & Configuration

### 1. Prérequis
Assurez-vous d'avoir PHP 8.2+, Composer et un serveur MySQL opérationnel.

### 2. Initialisation
```bash
# Installation des dépendances
composer install

# Configuration de l'environnement
cp .env.example .env
php artisan key:generate
```

### 3. Base de données & Lancement
```bash
# Création des tables et chargement des données de test
php artisan migrate --seed

# Lancement du serveur API
php artisan serve --host=0.0.0.0 --port=8000
```

---

## 📡 Points d'Entrée API (Endpoints)

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/otp` | Envoi d'un code de vérification. |
| `POST` | `/api/v1/auth/login` | Connexion utilisateur (Bearer Token). |
| `GET` | `/api/v1/trajets` | Liste des bus et trajets disponibles. |
| `POST` | `/api/v1/reservations` | Création d'un nouveau ticket. |
| `GET` | `/api/v1/user/tickets` | Historique des tickets d'un utilisateur. |

---

## 📄 Licence
Ce projet est sous licence MIT. Développé par **BELLOX**.