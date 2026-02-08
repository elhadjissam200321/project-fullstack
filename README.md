# EventFlow - Gestion d'Événements Académiques

![Status](https://img.shields.io/badge/Status-Complete-green)
![Tech Stack](https://img.shields.io/badge/Stack-Angular%20%7C%20Node.js%20%7C%20SQLite-blue)

**EventFlow** (anciennement AcadeMeet Manager) est une plateforme Full Stack moderne conçue pour simplifier la création, la gestion et la participation aux événements académiques et professionnels.

## 🚀 Fonctionnalités Clés

- **Tableau de Bord Premium** : Visualisation des statistiques en temps réel (inscriptions, tendances).
- **Gestion Fine des Rôles** : Accès segmenté pour les Organisateurs et les Participants.
- **Cycle de Vie Complet** : De la création de l'événement au suivi des participants.
- **Design Moderne** : Interface réactive avec mode sombre, animations fluides et icônes vectorielles.

## 🛠 Stack Technique

- **Frontend** : Angular 18, Tailwind CSS, Lucide-Angular, Chart.js.
- **Backend** : Node.js, Express.js, JWT (Authentication), BcryptJS.
- **Base de données** : SQLite3 (Base SQL légère et performante).

---

## 🔑 Comptes de Test

Utilisez les identifiants suivants pour tester les différentes fonctionnalités de la plateforme. Tous les comptes partagent le même mot de passe : `Demo2026!`

### 👤 Participants (Rôle Étudiant/Auditeur)
| Nom Complet | Email |
| :--- | :--- |
| Rachid Chraibi | chraibi.rachid0@gmail.com |
| Fatima Zahra | zahra.fatima1@gmail.com |
| Omar Tazi | tazi.omar2@gmail.com |
| Sanaa Idrisi | idrisi.sanaa3@gmail.com |
| Mehdi Filali | filali.mehdi4@gmail.com |

### 🏢 Organisateurs (Rôle Administration)
| Nom Complet | Email |
| :--- | :--- |
| Youssef Bennani | youssef.bennani0@academeet.ma |
| Samira Alami | samira.alami1@academeet.ma |
| Karim Drissi | karim.drissi2@academeet.ma |
| Layla Mansouri | layla.mansouri3@academeet.ma |
| Ahmed Zaki | ahmed.zaki4@academeet.ma |

---

## 📦 Installation

### Prérequis
- Node.js (v18+)
- npm

### 1. Backend
```bash
cd backend
npm install
npm run init-db  # Initialise la base SQLite
npm run seed     # Optionnel : Remplit avec des données de test
npm start
```

### 2. Frontend
```bash
cd frontend
npm install
npm start
```
Accédez à l'application sur `http://localhost:4200`.

## 📜 Licence
Ce projet est sous licence MIT.
