import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, MousePointer, Target, RefreshCw } from 'lucide-react';
import { profitService } from '../services/api';
import type { ProfitsResponse, Profit } from '../services/api';

const Dashboard: React.FC = () => {
  const [profitsData, setProfitsData] = useState<ProfitsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchProfits = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError('');
      const data = await profitService.getProfits();
      setProfitsData(data);
      setLastRefresh(new Date());
    } catch (error: any) {
      console.error('Erreur lors du chargement des profits:', error);
      let errorMessage = 'Erreur lors du chargement des données';
      
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfits();
  }, []);

  const handleRefresh = () => {
    fetchProfits(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Chargement des données...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <div className="space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Rechargement...' : 'Recharger'}
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              🚪 Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chartData = profitsData?.data.map((profit) => ({
    name: profit.offer.replace(/^Offre [A-Z] - /, ''),
    profit: profit.profit,
    conversions: profit.conversions,
  })) || [];

  const stats = [
    {
      name: 'Total Profits',
      value: `$${profitsData?.total_profit.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Conversions',
      value: profitsData?.total_conversions.toLocaleString() || '0',
      icon: Target,
      color: 'bg-blue-500',
    },
    {
      name: 'Clics',
      value: profitsData?.total_clicks.toLocaleString() || '0',
      icon: MousePointer,
      color: 'bg-purple-500',
    },
    {
      name: 'Taux Conversion',
      value: profitsData 
        ? `${((profitsData.total_conversions / profitsData.total_clicks) * 100).toFixed(1)}%`
        : '0%',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Vue d'ensemble de vos performances Everflow</p>
          {lastRefresh && (
            <p className="text-sm text-gray-500 mt-1">
              Dernière mise à jour: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Rechargement...' : 'Recharger les données'}
        </button>
      </div>

      {/* Stats Cards */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Profits par Offre
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'profit' ? `$${value}` : value,
                  name === 'profit' ? 'Profit' : 'Conversions'
                ]}
              />
              <Bar dataKey="profit" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Profits List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Détails des Offres
          </h2>
          <div className="space-y-4">
            {profitsData?.data.map((profit: Profit) => (
              <div key={profit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{profit.offer}</h3>
                  <p className="text-sm text-gray-600">
                    {profit.conversions} conversions • {profit.clicks} clics
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${profit.profit}</p>
                  <p className="text-sm text-gray-500">{profit.conversion_rate}% taux</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
