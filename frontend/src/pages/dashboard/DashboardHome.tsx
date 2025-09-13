import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { TrendingUp, DollarSign, MousePointer, Target, Users } from 'lucide-react';
import { profitService } from '../../services/api';

interface DashboardStats {
  totalProfit: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  offersCount: number;
  affiliatesCount: number;
}

export function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Fetch data from multiple endpoints
        const [offersData, affiliatesData] = await Promise.all([
          profitService.getOfferStats({ start_date: startDate, end_date: endDate }),
          profitService.getAffiliateStats({ start_date: startDate, end_date: endDate }),
        ]);

        const totalProfit = (offersData.total_profit || 0) + (affiliatesData.total_profit || 0);
        const totalClicks = (offersData.total_clicks || 0) + (affiliatesData.total_clicks || 0);
        const totalConversions = (offersData.total_conversions || 0) + (affiliatesData.total_conversions || 0);
        
        setStats({
          totalProfit,
          totalClicks,
          totalConversions,
          conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
          offersCount: offersData.count || 0,
          affiliatesCount: affiliatesData.count || 0,
        });
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-lg shadow animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Profit Total',
      value: `$${stats?.totalProfit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) || '0.00'}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Clics Total',
      value: stats?.totalClicks.toLocaleString('fr-FR') || '0',
      icon: MousePointer,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Conversions',
      value: stats?.totalConversions.toLocaleString('fr-FR') || '0',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Taux de Conversion',
      value: `${stats?.conversionRate.toFixed(2) || '0.00'}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Offres Actives',
      value: stats?.offersCount.toString() || '0',
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Affiliés Actifs',
      value: stats?.affiliatesCount.toString() || '0',
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Vue d'ensemble</h2>
        <p className="text-gray-600 mt-2">Performance des 7 derniers jours</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="font-medium">Voir les Offres</div>
                <div className="text-sm text-gray-600">Gérer vos offres actives</div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="font-medium">Affiliés</div>
                <div className="text-sm text-gray-600">Suivre les performances</div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="font-medium">Rapports</div>
                <div className="text-sm text-gray-600">Analyser les données</div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="font-medium">Paramètres</div>
                <div className="text-sm text-gray-600">Configuration</div>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statut Système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Everflow</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Connecté
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base de données</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Opérationnel
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Synchronisation</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  En cours
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}