# Nonvi Voyage Plus - Application Mobile (Expo) 📱

L'application mobile **Nonvi Voyage Plus** permet aux passagers de réserver leurs tickets, de consulter les horaires et de gérer leurs voyages en toute simplicité.

## 🚀 Fonctionnalités
- **Recherche de Trajets** : Filtrage par ville de départ et d'arrivée.
- **Réservation en ligne** : Choix des places et validation rapide.
- **Historique** : Accès à tous les anciens tickets et reçus QR Code.
- **Profil Utilisateur** : Gestion des informations personnelles et sécurité.
- **Design Moderne** : Interface fluide et intuitive.

## 🛠 Installation & Développement

1. Accéder au dossier :
   ```bash
   cd expo-mobile
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Lancer l'application :
   ```bash
   npx expo start
   ```

## ⚙️ Configuration
Dans `src/theme/Colors.js`, vous pouvez ajuster l'identité visuelle de l'application (Orange, Marron, Bleu nuit).
Dans `src/api/config.js` (ou équivalent), assurez-vous que l'URL de l'API pointe vers l'adresse IP de votre serveur backend.

## 📦 Build
Pour générer l'APK ou le fichier iOS :
```bash
eas build --platform android --profile preview
```

---
Développé avec **React Native & Expo**.
