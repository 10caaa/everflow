# Backend API

Laravel API for Everflow affiliate marketing data.

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Environment

Add to `.env`:
```
EVERFLOW_API_URL=https://api.eflow.team/v1
EVERFLOW_API_KEY=your_api_key
```

## Endpoints

**Auth:**
- POST `/api/register`
- POST `/api/login` 
- POST `/api/logout`

**Data:**
- GET `/api/profits/offers`
- GET `/api/profits/affiliates`
- GET `/api/profits/advertisers`
- `POST /api/register` - Inscription d'un utilisateur
- `POST /api/login` - Connexion d'un utilisateur

### Routes protégées (nécessitent un token Sanctum)
- `POST /api/logout` - Déconnexion
- `GET /api/user` - Informations de l'utilisateur connecté
- `GET /api/profits/offers?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Stats par offre
- `GET /api/profits/affiliates?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Stats par affilié
- `GET /api/profits/advertisers?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Stats par annonceur

Tous les endpoints de statistiques retournent des données en temps réel depuis l'API Everflow.

## Structure du projet

```
app/

