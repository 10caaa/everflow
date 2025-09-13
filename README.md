# Everflow Dashboard

Dashboard for affiliate marketing data from Everflow API. Built with Laravel backend and React frontend.

## Setup

### Backend
```bash
cd backend
composer install
cp .env.example .env
# Add your Everflow API key to .env
php artisan migrate
php artisan serve
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Add to `backend/.env`:
```
EVERFLOW_API_KEY=your_api_key
EVERFLOW_API_URL=https://api.eflow.team
```

## Usage

1. Register/login to access dashboard
2. View offers, affiliates, and advertiser stats
3. Filter data by date ranges

## Stack

- Backend: Laravel 11, Sanctum auth, SQLite
- Frontend: React, TypeScript, Tailwind CSS

