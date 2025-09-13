import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Users, Search, Filter, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { profitService, type DateRange } from '../../services/api';

interface AffiliateStat {
  id: string;
  name: string; // Aligné avec le backend qui retourne 'name'
  affiliate?: string; // Pour rétrocompatibilité 
  offer?: string;
  clicks: number;
  conversions: number;
  revenue: number;
  payout: number; // Non optionnel car on garantit 0 par défaut
  profit: number;
  conversion_rate: number;
}

export function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<AffiliateStat[]>([]);
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
    fetchAffiliates();
  }, [startDate, endDate]);

  const fetchAffiliates = async () => {
    setIsLoading(true);
    try {
      const data = await profitService.getAffiliateStats({ 
        start_date: startDate, 
        end_date: endDate 
      });
      
      // Transformer les données pour correspondre à AffiliateStat
      const transformedData: AffiliateStat[] = (data.data || []).map((item: any) => ({
        id: item.id || '',
        name: item.name || item.affiliate || 'Inconnu',
        affiliate: item.name || item.affiliate || 'Inconnu',
        offer: item.offer || '',
        clicks: item.clicks || 0,
        conversions: item.conversions || 0,
        revenue: item.revenue || 0,
        payout: item.payout || 0,
        profit: item.profit || 0,
        conversion_rate: item.conversion_rate || 0,
      }));
      
      setAffiliates(transformedData);
    } catch (error) {
      console.error('Erreur lors du chargement des affiliés:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAffiliates = affiliates.filter(affiliate =>
    affiliate.affiliate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (affiliate.offer && affiliate.offer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalStats = filteredAffiliates.reduce(
    (acc, affiliate) => ({
      clicks: acc.clicks + affiliate.clicks,
      conversions: acc.conversions + affiliate.conversions,
      revenue: acc.revenue + affiliate.revenue,
      profit: acc.profit + affiliate.profit,
    }),
    { clicks: 0, conversions: 0, revenue: 0, profit: 0 }
  );

  // Group affiliates by performance tier
  const topPerformers = filteredAffiliates
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="mr-3 h-8 w-8 text-blue-600" />
            Affiliés
          </h2>
          <p className="text-gray-600 mt-2">Suivi des performances de votre réseau d'affiliés</p>
        </div>
        <Button className="flex items-center">
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un affilié..."
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
              <Button onClick={fetchAffiliates} className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Affiliés Actifs</p>
              <p className="text-2xl font-bold text-blue-600">{filteredAffiliates.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Conversions</p>
              <p className="text-2xl font-bold text-green-600">{totalStats.conversions.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Revenus Générés</p>
              <p className="text-2xl font-bold text-purple-600">${totalStats.revenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Profit Net</p>
              <p className="text-2xl font-bold text-orange-600">${totalStats.profit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((affiliate, index) => (
                <div key={affiliate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{affiliate.affiliate}</div>
                      <div className="text-sm text-gray-600">{affiliate.conversions} conversions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${affiliate.profit.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">{affiliate.conversion_rate.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des Performances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Excellent (&gt;3% conv.)</span>
                <span className="font-medium">
                  {filteredAffiliates.filter(a => a.conversion_rate > 3).length} affiliés
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bon (1-3% conv.)</span>
                <span className="font-medium">
                  {filteredAffiliates.filter(a => a.conversion_rate >= 1 && a.conversion_rate <= 3).length} affiliés
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">À améliorer (&lt;1% conv.)</span>
                <span className="font-medium text-orange-600">
                  {filteredAffiliates.filter(a => a.conversion_rate < 1).length} affiliés
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performances Détaillées ({filteredAffiliates.length} affiliés)</CardTitle>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Affilié</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Offre</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Clics</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Conversions</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Taux Conv.</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Revenus</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Commissions</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Profit</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAffiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{affiliate.affiliate || 'Affilié Inconnu'}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{affiliate.offer || '-'}</td>
                      <td className="py-3 px-4 text-right">{affiliate.clicks.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{affiliate.conversions.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          affiliate.conversion_rate >= 3 
                            ? 'bg-green-100 text-green-800' 
                            : affiliate.conversion_rate >= 1 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {affiliate.conversion_rate.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">${affiliate.revenue.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">${affiliate.payout.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${affiliate.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${affiliate.profit.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {affiliate.conversion_rate >= 3 ? (
                          <TrendingUp className="h-4 w-4 text-green-600 mx-auto" />
                        ) : affiliate.conversion_rate < 1 ? (
                          <TrendingDown className="h-4 w-4 text-red-600 mx-auto" />
                        ) : (
                          <span className="w-4 h-4 bg-yellow-400 rounded-full mx-auto block"></span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredAffiliates.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  Aucun affilié trouvé pour cette période
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}