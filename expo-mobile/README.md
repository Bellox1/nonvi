# 📱 Nonvi Mobile - L'Expérience Voyageur (Expo / React Native)

L'application mobile **Nonvi Voyage Plus** est le compagnon de voyage ultime au Bénin. Conçue pour offrir une fluidité maximale, elle permet aux passagers de gérer leurs déplacements, de la recherche de trajets jusqu'à la validation embarquée par QR Code.

---

## ✨ Fonctionnalités Utilisateur

*   **🔍 Recherche de Trajets** : Filtres intelligents par date, ville de départ et destination.
*   **🎫 Ticket Digital (QR Code)** : Plus besoin de papier. Vos billets sont stockés en sécurité et prêts à être scannés.
*   **💳 Réservation Instantanée** : Choix des places favorites sur le plan du bus et paiement immédiat.
*   **📜 Historique Complet** : Accès simplifié à tous vos anciens tickets et reçus de paiement.
*   **🔔 Alertes en Temps Réel** : Notifications Push pour vous informer d'un départ imminent ou d'un changement d'horaire.

---

## 🛠️ Stack Technique

*   **Core** : React Native (Expo SDK)
*   **State Management** : React Context API / Redux Toolkit
*   **Navigation** : React Navigation (Stack & Tabs)
*   **Networking** : Axios pour la communication avec le Backend Laravel.
*   **Utility** : Expo BarCodeScanner pour la validation des agents.

---

## 🚀 Installation & Développement

### 1. Prérequis
Vous devez avoir **Node.js LTS** et **npm** installés sur votre machine.

### 2. Installation
```bash
# Accéder au dossier mobile
cd expo-mobile

# Installer les packages
npm install
```

### 3. Lancement
```bash
# Lancer le serveur de développement Expo
npx expo start
```
*Scannez le QR Code affiché dans votre terminal avec l'application **Expo Go** (Android/iOS).*

---

## 🏗️ Build & Déploiement

Pour générer des fichiers installables (APK/IPA) :
```bash
# Créer un build de preview (Android)
eas build --platform android --profile preview
```

---

## 📄 Licence
Ce projet est sous licence MIT. Développé par **BELLOX**.
