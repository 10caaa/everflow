import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Building, Search, Filter, Download, Star, Zap } from 'lucide-react';
import { profitService } from '../../services/api';

interface AdvertiserStat {
  id: string;
  advertiser: string;
  offer?: string;
  clicks: number;
  conversions: number;
  revenue: number;
  payout: number;
  profit: number;
  conversion_rate: number;
}

export function AdvertisersPage() {
  const [advertisers, setAdvertisers] = useState<AdvertiserStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchAdvertisers();
  }, [startDate, endDate]);

  const fetchAdvertisers = async () => {
    setIsLoading(true);
    try {
      const data = await profitService.getAdvertiserStats({ 
        start_date: startDate, 
        end_date: endDate 
      });
      
      // Transformer les données
      const transformedData = (data.data || []).map((item: any) => ({
        id: item.id || '',
        advertiser: item.name || item.advertiser || 'Inconnu',
        offer: item.offer || '',
        clicks: item.clicks || 0,
        conversions: item.conversions || 0,
        revenue: item.revenue || 0,
        payout: item.payout || 0,
        profit: item.profit || 0,
        conversion_rate: item.conversion_rate || 0,
      }));
      
      setAdvertisers(transformedData);
    } catch (error) {
      console.error('Erreur lors du chargement des annonceurs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAdvertisers = advertisers.filter(advertiser =>
    advertiser.advertiser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (advertiser.offer && advertiser.offer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalStats = filteredAdvertisers.reduce(
    (acc, advertiser) => ({
      clicks: acc.clicks + advertiser.clicks,
      conversions: acc.conversions + advertiser.conversions,
      revenue: acc.revenue + advertiser.revenue,
      profit: acc.profit + advertiser.profit,
    }),
    { clicks: 0, conversions: 0, revenue: 0, profit: 0 }
  );

  // Classify advertisers by performance
  const premiumAdvertisers = filteredAdvertisers.filter(a => a.profit > 1000);
  const standardAdvertisers = filteredAdvertisers.filter(a => a.profit >= 100 && a.profit <= 1000);
  const needsAttentionAdvertisers = filteredAdvertisers.filter(a => a.profit < 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Building className="mr-3 h-8 w-8 text-blue-600" />
            Annonceurs
          </h2>
          <p className="text-gray-600 mt-2">Gestion de vos partenaires publicitaires et leurs performances</p>
        </div>
        <Button className="flex items-center">
          <Download className="mr-2 h-4 w-4" />
          Rapport
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un annonceur..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Date de début</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Date de fin</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchAdvertisers} className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Premium</p>
                <p className="text-2xl font-bold text-yellow-600">{premiumAdvertisers.length}</p>
                <p className="text-xs text-gray-500">&gt;$1000 profit</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Standard</p>
                <p className="text-2xl font-bold text-blue-600">{standardAdvertisers.length}</p>
                <p className="text-xs text-gray-500">$100-1000 profit</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Volume Total</p>
              <p className="text-2xl font-bold text-purple-600">${totalStats.revenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Marge Globale</p>
              <p className="text-2xl font-bold text-green-600">${totalStats.profit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <Star className="mr-2 h-5 w-5" />
              Annonceurs Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {premiumAdvertisers.slice(0, 3).map((advertiser) => (
                <div key={advertiser.id} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-yellow-900">{advertiser.advertiser}</span>
                  <span className="text-sm font-bold text-green-600">${advertiser.profit.toFixed(0)}</span>
                </div>
              ))}
              {premiumAdvertisers.length === 0 && (
                <p className="text-sm text-yellow-700">Aucun annonceur premium cette période</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Zap className="mr-2 h-5 w-5" />
              Croissance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {standardAdvertisers.slice(0, 3).map((advertiser) => (
                <div key={advertiser.id} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">{advertiser.advertiser}</span>
                  <span className="text-sm font-bold text-blue-600">{advertiser.conversion_rate.toFixed(1)}%</span>
                </div>
              ))}
              {standardAdvertisers.length === 0 && (
                <p className="text-sm text-blue-700">Aucun annonceur en croissance</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Optimisation Requise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {needsAttentionAdvertisers.slice(0, 3).map((advertiser) => (
                <div key={advertiser.id} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-orange-900">{advertiser.advertiser}</span>
                  <span className="text-sm text-orange-600">${advertiser.profit.toFixed(0)}</span>
                </div>
              ))}
              {needsAttentionAdvertisers.length === 0 && (
                <p className="text-sm text-orange-700">Tous les annonceurs performent bien</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Complet ({filteredAdvertisers.length} annonceurs)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Annonceur</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Offre Principal</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Volume</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Conversions</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Performance</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Dépenses</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Revenus</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Marge</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdvertisers
                    .sort((a, b) => b.profit - a.profit)
                    .map((advertiser) => {
                      const tier = advertiser.profit > 1000 ? 'premium' : advertiser.profit >= 100 ? 'standard' : 'basic';
                      return (
                        <tr key={advertiser.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{advertiser.advertiser || 'Annonceur Inconnu'}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{advertiser.offer || '-'}</td>
                          <td className="py-3 px-4 text-right">{advertiser.clicks.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{advertiser.conversions.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              advertiser.conversion_rate >= 2 
                                ? 'bg-green-100 text-green-800' 
                                : advertiser.conversion_rate >= 1 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {advertiser.conversion_rate.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">${advertiser.payout.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">${advertiser.revenue.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-medium ${advertiser.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${advertiser.profit.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {tier === 'premium' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                Premium
                              </span>
                            )}
                            {tier === 'standard' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Standard
                              </span>
                            )}
                            {tier === 'basic' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Basic
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              
              {filteredAdvertisers.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  Aucun annonceur trouvé pour cette période
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}