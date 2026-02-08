# EventFlow - Backend (Node.js & SQLite)

API RESTful solide alimentant la plateforme EventFlow.

## 🛠 Technologies
- **Node.js & Express** : Serveur d'application léger.
- **SQLite3** : Gestionnaire de base de données relationnelle.
- **JWT** : Authentification sécurisée par jeton.
- **BcryptJS** : Hachage sécurisé des mots de passe.

## 🚀 Configuration

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Initialisez la base de données :
   ```bash
   npm run init-db
   ```

3. Lancez le serveur :
   ```bash
   npm start
   ```

## 📡 Endpoints Principaux
- `POST /api/auth/login` : Authentification.
- `GET /api/events` : Liste des événements publics.
- `POST /api/events` : Création (Organisateur uniquement).
- `GET /api/analytics` : Statistiques (Organisateur uniquement).

## 🗃 Base de données
La base de données est stockée localement dans un fichier `.sqlite`. Pour réinitialiser les données de test (comptes fournis dans le README racine), utilisez `npm run seed`.
