import axios from 'axios';

// Configuration de base
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false, // Désactiver les credentials pour éviter CSRF temporairement
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); // Corrigé: access_token au lieu de auth_token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('access_token'); // Corrigé: access_token au lieu de auth_token
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types TypeScript
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Profit {
  id: string;
  offer: string;
  profit: number;
  date?: string;
  conversions: number;
  clicks: number;
  conversion_rate: number;
  revenue?: number;
}

export interface Affiliate {
  id: string;
  name: string;
  profit: number;
  conversions: number;
  clicks: number;
  conversion_rate: number;
  revenue?: number;
}

export interface ProfitsResponse {
  data: Profit[];
  total_profit: number;
  total_conversions: number;
  total_clicks: number;
  last_updated?: string;
  data_source?: string;
  count?: number;
}

export interface AffiliatesResponse {
  data: Affiliate[];
  total_profit: number;
  total_conversions: number;
  total_clicks: number;
  last_updated?: string;
  data_source?: string;
  count?: number;
}

export interface DateRange {
  start_date: string;
  end_date: string;
}

export interface DashboardStats {
  success: boolean;
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_profit: number;
    total_clicks: number;
    total_conversions: number;
    total_revenue: number;
    conversion_rate: number;
  };
  top_performers: {
    offers: Profit[];
    affiliates: Affiliate[];
    advertisers: Affiliate[];
  };
  data_sources: {
    offers: string;
    affiliates: string;
    advertisers: string;
  };
}

// Service d'authentification
export const authService = {
  // Connexion
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      // Utiliser la vraie route de login
      const response = await api.post('/login', credentials);
      const { access_token, user } = response.data;
      
      // Stocker le token et les infos utilisateur (uniformisé sur access_token)
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },

  // Inscription
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/register', userData);
      const { access_token, user } = response.data;
      
      // Stocker le token et les infos utilisateur (uniformisé sur access_token)
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  },

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Toujours supprimer les données locales (uniformisé sur access_token)
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },

  // Récupérer les infos utilisateur
  async getCurrentUserFromApi(): Promise<User> {
    try {
      const response = await api.get('/user');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  },

  // Vérifier si l'utilisateur est connecté (uniformisé sur access_token)
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  },

  // Récupérer l'utilisateur depuis le localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
        return null;
      }
    }
    return null;
  }
};

// Service de test de connexion
export const testService = {
  // Test simple de connexion backend
  async testConnection() {
    try {
      const response = await api.get('/test-connection');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      throw error;
    }
  }
};

// Service des profits
export const profitService = {
  // Récupérer tous les profits (utilise maintenant les vraies routes authentifiées)
  async getProfits(): Promise<ProfitsResponse> {
    try {
      console.log('Récupération des profits via API authentifiée...');
      // Utiliser la vraie route authentifiée
      const response = await api.get('/profits/offers');
      console.log('Profits récupérés:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des profits:', error);
      throw error;
    }
  },

  // Récupérer les statistiques par offre avec dates
  async getOfferStats(dateRange: DateRange): Promise<ProfitsResponse> {
    try {
      console.log('Récupération des stats par offre...', dateRange);
      const response = await api.get('/profits/offers', {
        params: dateRange
      });
      console.log('Stats offres récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats offres:', error);
      throw error;
    }
  },

  // Récupérer les statistiques par affilié avec dates
  async getAffiliateStats(dateRange: DateRange): Promise<AffiliatesResponse> {
    try {
      console.log('Récupération des stats par affilié...', dateRange);
      const response = await api.get('/profits/affiliates', {
        params: dateRange
      });
      console.log('Stats affiliés récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats affiliés:', error);
      throw error;
    }
  },

  // Récupérer les statistiques par advertiser avec dates - NOUVEAU
  async getAdvertiserStats(dateRange: DateRange): Promise<AffiliatesResponse> {
    try {
      console.log('Récupération des stats par advertiser...', dateRange);
      const response = await api.get('/profits/advertisers', {
        params: dateRange
      });
      console.log('Stats advertisers récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats advertisers:', error);
      throw error;
    }
  },

  // Récupérer les statistiques par offre avec authentification
  async getOfferStatsAuth(dateRange: DateRange): Promise<ProfitsResponse> {
    try {
      console.log('Récupération des stats par offre (auth)...', dateRange);
      const response = await api.get('/profits/offers', {
        params: dateRange
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats offres (auth):', error);
      throw error;
    }
  },

  // Récupérer les statistiques par affilié avec authentification
  async getAffiliateStatsAuth(dateRange: DateRange): Promise<AffiliatesResponse> {
    try {
      console.log('Récupération des stats par affilié (auth)...', dateRange);
      const response = await api.get('/profits/affiliates', {
        params: dateRange
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats affiliés (auth):', error);
      throw error;
    }
  },

  // Récupérer les statistiques du dashboard avec données réelles
  async getDashboardStats(dateRange: DateRange): Promise<DashboardStats> {
    try {
      console.log('Récupération des stats dashboard...', dateRange);
      const response = await api.get('/dashboard/stats', {
        params: dateRange
      });
      console.log('Stats dashboard récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats dashboard:', error);
      throw error;
    }
  }
};

export default api;
