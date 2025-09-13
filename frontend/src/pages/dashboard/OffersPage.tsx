import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Gift, Search, Filter, Download } from 'lucide-react';
import { profitService } from '../../services/api';

interface OfferStat {
  id: string;
  offer: string;
  affiliate?: string;
  clicks: number;
  conversions: number;
  revenue: number;
  payout: number;
  profit: number;
  conversion_rate: number;
}

export function OffersPage() {
  const [offers, setOffers] = useState<OfferStat[]>([]);
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
    fetchOffers();
  }, [startDate, endDate]);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const data = await profitService.getOfferStats({ 
        start_date: startDate, 
        end_date: endDate 
      });
      
      // Transformer les données pour correspondre à OfferStat
      const transformedData: OfferStat[] = (data.data || []).map((item: any) => ({
        id: item.id || '',
        offer: item.offer || 'Offre inconnue',
        affiliate: item.affiliate || '',
        clicks: item.clicks || 0,
        conversions: item.conversions || 0,
        revenue: item.revenue || 0,
        payout: item.payout || 0,
        profit: item.profit || 0,
        conversion_rate: item.conversion_rate || 0,
      }));
      
      setOffers(transformedData);
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOffers = offers.filter(offer =>
    offer.offer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (offer.affiliate && offer.affiliate.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalStats = filteredOffers.reduce(
    (acc, offer) => ({
      clicks: acc.clicks + offer.clicks,
      conversions: acc.conversions + offer.conversions,
      revenue: acc.revenue + offer.revenue,
      profit: acc.profit + offer.profit,
    }),
    { clicks: 0, conversions: 0, revenue: 0, profit: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Gift className="mr-3 h-8 w-8 text-blue-600" />
            Offres
          </h2>
          <p className="text-gray-600 mt-2">Gestion et analyse des performances de vos offres</p>
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
                placeholder="Rechercher une offre..."
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
              <Button onClick={fetchOffers} className="w-full">
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
              <p className="text-sm font-medium text-gray-600">Total Clics</p>
              <p className="text-2xl font-bold text-blue-600">{totalStats.clicks.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-2xl font-bold text-green-600">{totalStats.conversions.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-purple-600">${totalStats.revenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Profit Total</p>
              <p className="text-2xl font-bold text-orange-600">${totalStats.profit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performances par Offre ({filteredOffers.length} résultats)</CardTitle>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Offre</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Affilié</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Clics</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Conversions</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Taux Conv.</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Revenus</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Coûts</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOffers.map((offer) => (
                    <tr key={offer.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{offer.offer}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{offer.affiliate || '-'}</td>
                      <td className="py-3 px-4 text-right">{offer.clicks.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{offer.conversions.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          offer.conversion_rate >= 2 
                            ? 'bg-green-100 text-green-800' 
                            : offer.conversion_rate >= 1 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {offer.conversion_rate.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">${offer.revenue.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">${offer.payout.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${offer.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${offer.profit.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredOffers.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  Aucune offre trouvée pour cette période
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}