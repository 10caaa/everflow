import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Users, Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { profitService, type DateRange } from '../../services/api';
import { Pagination } from '../../components/ui/pagination';
import { SortableTable, SortableColumn, SortDirection } from '../../components/ui/sortable-table';

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

  // Pagination and sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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

  // Define table columns
  const columns: SortableColumn[] = [
    { key: 'name', label: 'Affiliate', sortable: true },
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
  const filteredAndSortedAffiliates = useMemo(() => {
    let filtered = affiliates.filter(affiliate =>
      affiliate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (affiliate.affiliate && affiliate.affiliate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (affiliate.offer && affiliate.offer.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortKey && sortDirection) {
      filtered.sort((a, b) => {
        const aValue = a[sortKey as keyof AffiliateStat];
        const bValue = b[sortKey as keyof AffiliateStat];
        
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
  }, [affiliates, searchTerm, sortKey, sortDirection]);

  // Paginate data
  const paginatedAffiliates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedAffiliates.slice(startIndex, endIndex);
  }, [filteredAndSortedAffiliates, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedAffiliates.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);

  const totalStats = filteredAndSortedAffiliates.reduce(
    (acc, affiliate) => ({
      clicks: acc.clicks + affiliate.clicks,
      conversions: acc.conversions + affiliate.conversions,
      revenue: acc.revenue + affiliate.revenue,
      profit: acc.profit + affiliate.profit,
    }),
    { clicks: 0, conversions: 0, revenue: 0, profit: 0 }
  );

  // Group affiliates by performance tier
  const topPerformers = filteredAndSortedAffiliates
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

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
                  placeholder="Search affiliates..."
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
              <Button onClick={fetchAffiliates} className="w-full">
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
              <p className="text-sm font-medium text-muted-foreground">Active Affiliates</p>
              <p className="text-2xl font-bold text-chart-1">{filteredAndSortedAffiliates.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Conversions</p>
              <p className="text-2xl font-bold text-chart-2">{totalStats.conversions.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Revenue Generated</p>
              <p className="text-2xl font-bold text-chart-3">${totalStats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
              <p className="text-2xl font-bold text-chart-4">${totalStats.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
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
                      <div className="font-medium text-gray-900">{affiliate.name || affiliate.affiliate}</div>
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
            <CardTitle>Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Excellent (&gt;3% conv.)</span>
                <span className="font-medium">
                  {filteredAndSortedAffiliates.filter(a => a.conversion_rate > 3).length} affiliates
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Good (1-3% conv.)</span>
                <span className="font-medium">
                  {filteredAndSortedAffiliates.filter(a => a.conversion_rate >= 1 && a.conversion_rate <= 3).length} affiliates
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Needs improvement (&lt;1% conv.)</span>
                <span className="font-medium text-destructive">
                  {filteredAndSortedAffiliates.filter(a => a.conversion_rate < 1).length} affiliates
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance ({filteredAndSortedAffiliates.length} affiliates)</CardTitle>
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
                data={paginatedAffiliates}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
              >
                {(affiliate) => (
                  <>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{affiliate.name || affiliate.affiliate || 'Unknown Affiliate'}</div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{affiliate.offer || '-'}</td>
                    <td className="py-3 px-4 text-right">{affiliate.clicks.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{affiliate.conversions.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        affiliate.conversion_rate >= 3 
                          ? 'bg-chart-1/20 text-chart-1' 
                          : affiliate.conversion_rate >= 1 
                          ? 'bg-chart-3/20 text-chart-3' 
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {affiliate.conversion_rate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">${affiliate.revenue.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">${affiliate.payout.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${affiliate.profit >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
                        ${affiliate.profit.toFixed(2)}
                      </span>
                    </td>
                  </>
                )}
              </SortableTable>
              
              {filteredAndSortedAffiliates.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No affiliates found for this period
                </div>
              )}

              {filteredAndSortedAffiliates.length > 0 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredAndSortedAffiliates.length}
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