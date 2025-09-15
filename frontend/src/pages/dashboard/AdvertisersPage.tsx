import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Building, Search, Filter, Star, Zap } from 'lucide-react';
import { profitService } from '../../services/api';
import { Pagination } from '../../components/ui/pagination';
import { SortableTable, SortableColumn, SortDirection } from '../../components/ui/sortable-table';

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

  // Pagination and sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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

  // Define table columns
  const columns: SortableColumn[] = [
    { key: 'advertiser', label: 'Advertiser', sortable: true },
    { key: 'offer', label: 'Top Offer', sortable: true },
    { key: 'clicks', label: 'Clicks', sortable: true, className: 'text-right' },
    { key: 'conversions', label: 'Conversions', sortable: true, className: 'text-right' },
    { key: 'conversion_rate', label: 'Conv. Rate', sortable: true, className: 'text-right' },
    { key: 'revenue', label: 'Revenue', sortable: true, className: 'text-right' },
    { key: 'payout', label: 'Payout', sortable: true, className: 'text-right' },
    { key: 'profit', label: 'Profit', sortable: true, className: 'text-right' }
  ];

  // Handle sorting
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Filter and sort data
  const filteredAndSortedAdvertisers = useMemo(() => {
    let filtered = advertisers.filter(advertiser =>
      advertiser.advertiser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (advertiser.offer && advertiser.offer.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortKey && sortDirection) {
      filtered.sort((a, b) => {
        const aValue = a[sortKey as keyof AdvertiserStat];
        const bValue = b[sortKey as keyof AdvertiserStat];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }
        
        return 0;
      });
    }

    return filtered;
  }, [advertisers, searchTerm, sortKey, sortDirection]);

  // Paginate data
  const paginatedAdvertisers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedAdvertisers.slice(startIndex, endIndex);
  }, [filteredAndSortedAdvertisers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedAdvertisers.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);

  const totalStats = filteredAndSortedAdvertisers.reduce(
    (acc, advertiser) => ({
      clicks: acc.clicks + advertiser.clicks,
      conversions: acc.conversions + advertiser.conversions,
      revenue: acc.revenue + advertiser.revenue,
      profit: acc.profit + advertiser.profit,
    }),
    { clicks: 0, conversions: 0, revenue: 0, profit: 0 }
  );

  // Classify advertisers by performance
  const premiumAdvertisers = filteredAndSortedAdvertisers.filter(a => a.profit > 1000);
  const standardAdvertisers = filteredAndSortedAdvertisers.filter(a => a.profit >= 100 && a.profit <= 1000);
  const needsAttentionAdvertisers = filteredAndSortedAdvertisers.filter(a => a.profit < 100);

  return (
    <div className="space-y-6 min-h-[800px]">

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search advertisers..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1 block">Actions</label>
              <Button onClick={fetchAdvertisers} className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Refresh
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
          <CardTitle>Complete Portfolio ({filteredAndSortedAdvertisers.length} advertisers)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <SortableTable
                columns={columns}
                data={paginatedAdvertisers}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
              >
                {(advertiser) => {
                  const tier = advertiser.profit > 1000 ? 'premium' : advertiser.profit >= 100 ? 'standard' : 'basic';
                  return (
                    <>
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">{advertiser.advertiser || 'Unknown Advertiser'}</div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{advertiser.offer || '-'}</td>
                      <td className="py-3 px-4 text-right">{advertiser.clicks.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{advertiser.conversions.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          advertiser.conversion_rate >= 2 
                            ? 'bg-chart-1/20 text-chart-1' 
                            : advertiser.conversion_rate >= 1 
                            ? 'bg-chart-3/20 text-chart-3' 
                            : 'bg-destructive/20 text-destructive'
                        }`}>
                          {advertiser.conversion_rate.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">${advertiser.revenue.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">${advertiser.payout.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${advertiser.profit >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
                          ${advertiser.profit.toFixed(2)}
                        </span>
                      </td>
                    </>
                  );
                }}
              </SortableTable>
              
              {filteredAndSortedAdvertisers.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No advertisers found for this period
                </div>
              )}

              {filteredAndSortedAdvertisers.length > 0 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredAndSortedAdvertisers.length}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}