# 🚀 Everflow Dashboard Pro

> **A modern, responsive dashboard for affiliate marketing analytics powered by Everflow API**

[![Laravel](https://img.shields.io/badge/Laravel-12.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black.svg)](https://vercel.com)

## ✨ Features

### 📊 **Dashboard Analytics**
- **Real-time KPI Cards**: Total Profit, Clicks, Conversions, Revenue, Performance Score
- **Interactive Charts**: Dynamic line charts with desktop/mobile breakdown
- **Top Performers**: Best offers and affiliates with detailed metrics
- **Date Range Filtering**: Flexible period selection (today, yesterday, last 7 days, custom)

### 🎯 **Data Management**
- **Offers Management**: Complete offer statistics with search and filtering
- **Affiliates Tracking**: Performance monitoring and ranking system
- **Advertisers Overview**: Portfolio analysis and conversion tracking
- **Pagination & Sorting**: Advanced table controls for large datasets

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Theme**: Professional color scheme with smooth transitions
- **Collapsible Sidebar**: Space-efficient navigation
- **Real-time Updates**: Live data synchronization
- **Interactive Elements**: Hover effects, loading states, and smooth animations

### 🔐 **Security & Authentication**
- **Laravel Sanctum**: Secure API authentication
- **Protected Routes**: Role-based access control
- **CORS Configuration**: Cross-origin request handling
- **Input Validation**: Comprehensive data sanitization

## 🛠️ Tech Stack

### **Backend**
- **Laravel 12** - PHP framework
- **Laravel Sanctum** - API authentication
- **SQLite** - Database (configurable)
- **PHP 8.2+** - Runtime environment

### **Frontend**
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Router** - Navigation

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Hot Module Replacement** - Fast development

## 🚀 Quick Start

### **Prerequisites**
- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/yourusername/everflow-dashboard-pro.git
cd everflow
```

### **2. Backend Setup**
```bash
cd backend

# Install dependencies
composer install

# Environment configuration
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database (SQLite by default)
touch database/database.sqlite

# Run migrations
php artisan migrate

# Start development server
php artisan serve --host=127.0.0.1 --port=8000
```

### **3. Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### **4. Environment Variables**

Create `backend/.env` with your Everflow API credentials:

```env
# Everflow API Configuration
EVERFLOW_API_KEY=your_everflow_api_key_here
EVERFLOW_API_URL=https://api.eflow.team

# Database Configuration
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite

# Application Configuration
APP_NAME="Everflow Dashboard Pro"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# CORS Configuration
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:5174,localhost:5175
```

## 📱 Usage

### **Dashboard Overview**
1. **Login/Register** - Create your account or sign in
2. **KPI Monitoring** - View real-time performance metrics
3. **Interactive Charts** - Click KPI cards to update chart data
4. **Date Filtering** - Select custom date ranges for analysis
5. **Top Performers** - Monitor best offers and affiliates

### **Data Pages**
- **Offers** - Search, filter, and analyze offer performance
- **Affiliates** - Track affiliate statistics and rankings
- **Advertisers** - Monitor advertiser portfolio metrics

### **Navigation**
- **Sidebar Toggle** - Collapse/expand navigation panel
- **Responsive Design** - Optimized for all screen sizes
- **Quick Access** - Direct links to all major features

## 🚀 Deployment

### **Frontend (Vercel)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Configure environment variables in Vercel dashboard
VITE_API_BASE_URL=https://your-backend-url.com/api
```

### **Backend (Railway/Heroku)**
```bash
# Railway (Recommended)
npm install -g @railway/cli
railway login
railway init
railway up

# Heroku
heroku create your-app-name
git push heroku main
```

### **Environment Variables for Production**
```env
# Production Backend
EVERFLOW_API_KEY=your_production_api_key
EVERFLOW_API_URL=https://api.eflow.team
APP_ENV=production
APP_DEBUG=false

# Production Frontend
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

## 📊 API Endpoints

### **Authentication**
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get user info

### **Dashboard Data**
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/offers/stats` - Offer statistics
- `GET /api/affiliates/stats` - Affiliate statistics
- `GET /api/advertisers/stats` - Advertiser statistics

### **Data Management**
- `GET /api/offers` - List offers with pagination
- `GET /api/affiliates` - List affiliates with pagination
- `GET /api/advertisers` - List advertisers with pagination

## 🎨 Customization

### **Theming**
- Modify `frontend/src/index.css` for global styles
- Update `frontend/tailwind.config.ts` for theme configuration
- Customize colors in CSS variables

### **Components**
- Add new charts in `frontend/src/components/charts/`
- Create new pages in `frontend/src/pages/`
- Extend UI components in `frontend/src/components/ui/`

### **Backend Extensions**
- Add new controllers in `backend/app/Http/Controllers/`
- Create new services in `backend/app/Services/`
- Add API routes in `backend/routes/api.php`

## 🧪 Development

### **Code Quality**
```bash
# Frontend linting
cd frontend
npm run lint

# Backend code style
cd backend
./vendor/bin/pint
```

### **Testing**
```bash
# Backend tests
cd backend
php artisan test

# Frontend tests (if configured)
cd frontend
npm test
```

### **Build for Production**
```bash
# Frontend build
cd frontend
npm run build

# Backend optimization
cd backend
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 📈 Performance

### **Optimizations**
- **Code Splitting** - Dynamic imports for better loading
- **Image Optimization** - Compressed assets
- **Caching** - Laravel route and config caching
- **Database Indexing** - Optimized queries
- **CDN Ready** - Static asset delivery

### **Monitoring**
- **Error Tracking** - Laravel logging
- **Performance Metrics** - Built-in analytics
- **API Rate Limiting** - Request throttling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License

## 🆘 Support

### **Documentation**
- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

## 🙏 Acknowledgments

- **Everflow** - For providing the powerful affiliate marketing API
- **Laravel Team** - For the amazing PHP framework
- **React Team** - For the incredible UI library
- **Tailwind CSS** - For the utility-first CSS framework
- **Vercel** - For the seamless deployment platform

**Made with ❤️ by [SIDALI HALLAOUA](https://github.com/10caaa)**
