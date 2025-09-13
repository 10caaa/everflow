import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, MousePointer, Target } from 'lucide-react';
import { profitService } from '../services/api';
import DateRangePicker from '../components/DateRangePicker';
import type { ProfitsResponse, AffiliatesResponse, DateRange } from '../services/api';

// Couleurs pour les graphiques
const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

const EverflowDashboard: React.FC = () => {
  // États pour les données
  const [offerStats, setOfferStats] = useState<ProfitsResponse | null>(null);
  const [affiliateStats, setAffiliateStats] = useState<AffiliatesResponse | null>(null);
  
  // États pour l'interface
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'offers' | 'affiliates'>('offers');
  
  // États pour les dates
  const [dateRange, setDateRange] = useState<DateRange>({
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  // Charger les données initiales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Chargement des données avec dates:', dateRange);
      
      // Charger les deux types de données en parallèle
      const [offersData, affiliatesData] = await Promise.all([
        profitService.getOfferStats(dateRange),
        profitService.getAffiliateStats(dateRange)
      ]);
      
      setOfferStats(offersData);
      setAffiliateStats(affiliatesData);
      
      console.log('Données chargées:', { offers: offersData, affiliates: affiliatesData });
      
    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
      let errorMessage = 'Erreur lors du chargement des données Everflow';
      
      if (error.response?.status === 401) {
        errorMessage = 'Session expirée, veuillez vous reconnecter';
      } else if (error.response?.status === 404) {
        errorMessage = 'API non trouvée, vérifiez que le backend est démarré';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaires d'événements
  const handleApplyDateRange = () => {
    loadData();
  };

  const handleStartDateChange = (date: string) => {
    setDateRange(prev => ({ ...prev, start_date: date }));
  };

  const handleEndDateChange = (date: string) => {
    setDateRange(prev => ({ ...prev, end_date: date }));
  };

  // Préparer les données pour les graphiques avec protection renforcée
  const offerChartData = (offerStats?.data && Array.isArray(offerStats.data)) 
    ? offerStats.data.map((profit) => ({
        name: profit.offer?.length > 20 ? profit.offer.substring(0, 20) + '...' : (profit.offer || 'Offre inconnue'),
        profit: profit.profit || 0,
        conversions: profit.conversions || 0,
        clicks: profit.clicks || 0,
        fullName: profit.offer || 'Offre inconnue'
      }))
    : [];

  const affiliateChartData = (affiliateStats?.data && Array.isArray(affiliateStats.data))
    ? affiliateStats.data.map((affiliate) => ({
        name: affiliate.name?.length > 15 ? affiliate.name.substring(0, 15) + '...' : (affiliate.name || 'Affilié inconnu'),
        profit: affiliate.profit || 0,
        conversions: affiliate.conversions || 0,
        clicks: affiliate.clicks || 0,
        fullName: affiliate.name || 'Affilié inconnu'
      }))
    : [];

  const pieChartData = (activeTab === 'offers' ? offerChartData : affiliateChartData).map((item, index) => ({
    name: item.name,
    value: item.profit,
    color: COLORS[index % COLORS.length]
  }));

  // Calculer les statistiques globales
  const currentStats = activeTab === 'offers' ? offerStats : affiliateStats;
  const stats = [
    {
      name: 'Total Profits',
      value: `$${currentStats?.total_profit.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Conversions',
      value: currentStats?.total_conversions.toLocaleString() || '0',
      icon: Target,
      color: 'bg-blue-500',
    },
    {
      name: 'Clics',
      value: currentStats?.total_clicks.toLocaleString() || '0',
      icon: MousePointer,
      color: 'bg-purple-500',
    },
    {
      name: 'Taux Conversion',
      value: currentStats && currentStats.total_clicks > 0
        ? `${((currentStats.total_conversions / currentStats.total_clicks) * 100).toFixed(1)}%`
        : '0%',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  if (loading && !offerStats && !affiliateStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Chargement des données Everflow...</div>
      </div>
    );
  }

  if (error && !offerStats && !affiliateStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <div className="space-x-4">
            <button
              onClick={loadData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              🔄 Recharger
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Everflow</h1>
        <p className="text-gray-600">
          Statistiques en temps réel • Source: {currentStats?.data_source || 'Non disponible'}
        </p>
      </div>

      {/* Sélecteur de dates */}
      <DateRangePicker
        startDate={dateRange.start_date}
        endDate={dateRange.end_date}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onApply={handleApplyDateRange}
        loading={loading}
      />

      {/* Onglets */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('offers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'offers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Par Offres ({offerStats?.count || 0})
            </button>
            <button
              onClick={() => setActiveTab('affiliates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'affiliates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Par Affiliés ({affiliateStats?.count || 0})
            </button>
          </nav>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Graphique en barres */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Profits par {activeTab === 'offers' ? 'Offre' : 'Affilié'}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activeTab === 'offers' ? offerChartData : affiliateChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'profit' ? `$${value}` : value,
                  name === 'profit' ? 'Profit' : 'Conversions'
                ]}
                labelFormatter={(label) => {
                  const item = (activeTab === 'offers' ? offerChartData : affiliateChartData)
                    .find(d => d.name === label);
                  return item?.fullName || label;
                }}
              />
              <Bar dataKey="profit" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique en secteurs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Répartition des Profits
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, 'Profit']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Liste détaillée */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Détails {activeTab === 'offers' ? 'des Offres' : 'des Affiliés'}
        </h2>
        <div className="space-y-4">
          {activeTab === 'offers' 
            ? (offerStats?.data && Array.isArray(offerStats.data) ? offerStats.data.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.offer || 'Offre inconnue'}</h3>
                    <p className="text-sm text-gray-600">
                      {item.conversions || 0} conversions • {item.clicks || 0} clics • {(item.conversion_rate || 0).toFixed(2)}% taux
                    </p>
                    <p className="text-xs text-gray-500">ID: {item.id || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${(item.profit || 0).toLocaleString()}</p>
                    {item.revenue && (
                      <p className="text-sm text-gray-500">Rev: ${item.revenue.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )) : <p className="text-gray-500 text-center py-4">Aucune donnée d'offres disponible</p>)
            : (affiliateStats?.data && Array.isArray(affiliateStats.data) ? affiliateStats.data.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name || 'Affilié inconnu'}</h3>
                    <p className="text-sm text-gray-600">
                      {item.conversions || 0} conversions • {item.clicks || 0} clics • {(item.conversion_rate || 0).toFixed(2)}% taux
                    </p>
                    <p className="text-xs text-gray-500">ID: {item.id || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${(item.profit || 0).toLocaleString()}</p>
                    {item.revenue && (
                      <p className="text-sm text-gray-500">Rev: ${item.revenue.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )) : <p className="text-gray-500 text-center py-4">Aucune donnée d'affiliés disponible</p>)
          }
        </div>
      </div>
    </div>
  );
};

export default EverflowDashboard;
