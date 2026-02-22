# Nonvi Voyage Plus 🚍

**Nonvi Voyage Plus** est une solution complète de gestion de transport de voyageurs au Bénin. Elle comprend une application mobile pour les utilisateurs (réservations, tarifs, horaires) et un backend robuste pour la gestion administrative.

## 🌟 Architecture du Projet

Le projet est divisé en deux parties principales :

1.  **Backend (`/backend`)** : Développé avec **Laravel 11**, il sert d'API et d'interface d'administration.
2.  **Mobile App (`/expo-mobile`)** : Développée avec **React Native (Expo)**, disponible sur Android et iOS.

---

## 🚀 Installation Rapide

### 1. Cloner le projet
```bash
git clone https://github.com/votre-repo/nonvi.git
cd nonvi
```

### 2. Configuration du Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configurez votre base de données dans le .env
php artisan migrate --seed
php artisan serve --host=0.0.0.0
```

### 3. Configuration du Mobile
```bash
cd ../expo-mobile
npm install
npx expo start
```

---

## 🛠 Technologies Utilisées

- **Backend** : Laravel 11, PHP 8.2, MySQL, Twilio (WhatsApp/SMS).
- **Mobile** : React Native, Expo, React Navigation, Axios.
- **Design** : Tailwind CSS (Web), Custom Theme (Mobile).

---

## 📧 Contact & Support
Pour toute question, contactez l'équipe technique à [contact@nonviplus.com](mailto:contact@nonviplus.com) ou via nos réseaux sociaux.

---
🚀 Développé avec passion pour le transport Béninois.
