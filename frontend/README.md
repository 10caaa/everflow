# Frontend Dashboard

React TypeScript dashboard for Everflow affiliate data.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Features

- User authentication
- Dashboard with data tables
- Responsive design
- Date filtering

## Stack

- React + TypeScript
- Tailwind CSS
- React Router
- Axios

## 🔐 Authentification

### Flow complet :
1. **Accès à `/`** → Redirection vers `/login` ou `/dashboard`
2. **Connexion** → POST `/api/login` → Stockage token + redirection
3. **Routes protégées** → Vérification token automatique
4. **Déconnexion** → POST `/api/logout` + suppression token

### Protection automatique :
- **ProtectedRoute** : Vérifie l'authentification
- **Intercepteurs axios** : Gestion automatique des tokens
- **Redirection** : En cas d'erreur 401

## 📊 Dashboard

### Données affichées :
- **Total des profits** : Somme de tous les profits
- **Conversions** : Nombre total de conversions
- **Clics** : Nombre total de clics
- **Taux de conversion** : Moyenne calculée

### Sources de données :

