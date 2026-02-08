# EventFlow - Frontend (Angular 18)

Cette partie contient l'interface utilisateur d'EventFlow, construite avec une approche "mobile-first" et esthétique premium.

## 🛠 Technologies
- **Angular 18** : Framework robuste pour SPA.
- **Tailwind CSS** : Stylisation utilitaire pour un design ultra-réactif.
- **Lucide Angular** : Pack d'icônes premium.
- **Chart.js** : Visualisation de données pour le tableau de bord organisateur.

## 🚀 Démarrage Rapide

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Lancez le serveur de développement :
   ```bash
   npm start
   ```

3. Build pour la production (Hébergement cPanel) :
   ```bash
   npm run build
   ```

## 📂 Structure du Projet
- `src/app/pages` : Composants principaux (Home, Login, Dashboard, ManageEvents).
- `src/app/services` : Logique de communication avec l'API.
- `src/app/guards` : Protection des routes par rôles (AuthGuard).
- `public/` : Assets statiques et configuration `.htaccess` pour le routage SPA.
