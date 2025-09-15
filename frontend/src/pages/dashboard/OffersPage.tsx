import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Gift, Search, Filter } from 'lucide-react';
import { profitService } from '../../services/api';
import { Pagination } from '../../components/ui/pagination';
import { SortableTable, SortableColumn, SortDirection } from '../../components/ui/sortable-table';

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

  // Pagination and sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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

  // Define table columns
  const columns: SortableColumn[] = [
    { key: 'offer', label: 'Offer', sortable: true },
    { key: 'affiliate', label: 'Affiliate', sortable: true },
    { key: 'clicks', label: 'Clicks', sortable: true, className: 'text-right' },
    { key: 'conversions', label: 'Conversions', sortable: true, className: 'text-right' },
    { key: 'conversion_rate', label: 'Conv. Rate', sortable: true, className: 'text-right' },
    { key: 'revenue', label: 'Revenue', sortable: true, className: 'text-right' },
    { key: 'payout', label: 'Costs', sortable: true, className: 'text-right' },
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
  const filteredAndSortedOffers = useMemo(() => {
    let filtered = offers.filter(offer =>
      offer.offer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (offer.affiliate && offer.affiliate.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortKey && sortDirection) {
      filtered.sort((a, b) => {
        const aValue = a[sortKey as keyof OfferStat];
        const bValue = b[sortKey as keyof OfferStat];
        
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
  }, [offers, searchTerm, sortKey, sortDirection]);

  // Paginate data
  const paginatedOffers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedOffers.slice(startIndex, endIndex);
  }, [filteredAndSortedOffers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedOffers.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);

  const totalStats = filteredAndSortedOffers.reduce(
    (acc, offer) => ({
      clicks: acc.clicks + offer.clicks,
      conversions: acc.conversions + offer.conversions,
      revenue: acc.revenue + offer.revenue,
      profit: acc.profit + offer.profit,
    }),
    { clicks: 0, conversions: 0, revenue: 0, profit: 0 }
  );

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
                  placeholder="Search offers..."
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
              <Button onClick={fetchOffers} className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filter
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
              <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
              <p className="text-2xl font-bold text-chart-1">{totalStats.clicks.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Conversions</p>
              <p className="text-2xl font-bold text-chart-2">{totalStats.conversions.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold text-chart-3">${totalStats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
              <p className="text-2xl font-bold text-chart-4">${totalStats.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Offer Performance ({filteredAndSortedOffers.length} results)</CardTitle>
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
                data={paginatedOffers}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
              >
                {(offer) => (
                  <>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{offer.offer}</div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{offer.affiliate || '-'}</td>
                    <td className="py-3 px-4 text-right">{offer.clicks.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{offer.conversions.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        offer.conversion_rate >= 2 
                          ? 'bg-chart-1/20 text-chart-1' 
                          : offer.conversion_rate >= 1 
                          ? 'bg-chart-3/20 text-chart-3' 
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {offer.conversion_rate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">${offer.revenue.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">${offer.payout.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${offer.profit >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
                        ${offer.profit.toFixed(2)}
                      </span>
                    </td>
                  </>
                )}
              </SortableTable>
              
              {filteredAndSortedOffers.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No offers found for this period
                </div>
              )}

              {filteredAndSortedOffers.length > 0 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredAndSortedOffers.length}
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