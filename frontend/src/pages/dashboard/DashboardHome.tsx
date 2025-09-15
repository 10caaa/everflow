import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ChartLineInteractive } from '../../components/charts/ChartLineInteractive';
import { DateRangePicker } from '../../components/ui/date-range-picker';
import { DollarSign, MousePointer, Target, TrendingUp, BarChart3, PieChart, Users, Settings, FileText, Download, Activity, Zap } from 'lucide-react';
import { profitService, type DashboardStats, type DateRange } from '../../services/api';

export function DashboardHome() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKPI, setSelectedKPI] = useState<string>('profit');
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    // Période par défaut (7 derniers jours)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
  });



  const fetchDashboardData = async (range: DateRange) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await profitService.getDashboardStats(range);
      setDashboardData(data);
    } catch (err) {
      console.error('Erreur lors du chargement des données dashboard:', err);
      setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboardData(dateRange);
  }, [dateRange]);

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ start_date: startDate, end_date: endDate });
  };


  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">⚠️</div>
          <p className="text-destructive mb-2">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    );
  }

  const { summary, top_performers, data_sources } = dashboardData;


  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Date Range Filter */}
      <div className="flex-shrink-0">
        <DateRangePicker
          startDate={dateRange.start_date}
          endDate={dateRange.end_date}
          onDateChange={handleDateRangeChange}
          isLoading={isLoading}
        />
      </div>

      {/* Dashboard Grid */}
      <div className="flex-1 min-h-0">
        <div className="parent h-full">
        {/* KPI Cards 1-6 */}
        <div className="div1">
          <Card 
            className={`h-full cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedKPI === 'profit' ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => setSelectedKPI('profit')}
          >
            <CardContent className="p-3 h-full flex flex-col justify-center">
              <div className="flex items-center justify-between">
      <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Profit</p>
                  <p className="text-lg font-bold text-foreground">${summary.total_profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-1.5 rounded-lg bg-chart-1/10">
                  <DollarSign className="h-4 w-4 text-chart-1" />
                </div>
              </div>
            </CardContent>
          </Card>
      </div>

        <div className="div2">
          <Card 
            className={`h-full cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedKPI === 'clicks' ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => setSelectedKPI('clicks')}
          >
            <CardContent className="p-3 h-full flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Clicks</p>
                  <p className="text-lg font-bold text-foreground">{summary.total_clicks.toLocaleString()}</p>
                </div>
                <div className="p-1.5 rounded-lg bg-chart-2/10">
                  <MousePointer className="h-4 w-4 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>
      </div>

        <div className="div3">
          <Card 
            className={`h-full cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedKPI === 'conversions' ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => setSelectedKPI('conversions')}
          >
            <CardContent className="p-3 h-full flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Conversions</p>
                  <p className="text-lg font-bold text-foreground">{summary.total_conversions.toLocaleString()}</p>
                </div>
                <div className="p-1.5 rounded-lg bg-chart-3/10">
                  <Target className="h-4 w-4 text-chart-3" />
                </div>
            </div>
          </CardContent>
        </Card>
        </div>
        
        <div className="div4">
          <Card 
            className={`h-full cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedKPI === 'conversion_rate' ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => setSelectedKPI('conversion_rate')}
          >
            <CardContent className="p-3 h-full flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-lg font-bold text-foreground">{summary.conversion_rate.toFixed(2)}%</p>
                </div>
                <div className="p-1.5 rounded-lg bg-chart-4/10">
                  <TrendingUp className="h-4 w-4 text-chart-4" />
                </div>
              </div>
            </CardContent>
          </Card>
              </div>

        {/* New KPI Cards 5-6 */}
        <div className="div5">
          <Card 
            className={`h-full cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedKPI === 'revenue' ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => setSelectedKPI('revenue')}
          >
            <CardContent className="p-3 h-full flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-lg font-bold text-foreground">${summary.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-1.5 rounded-lg bg-chart-5/10">
                  <Activity className="h-4 w-4 text-chart-5" />
                </div>
              </div>
            </CardContent>
          </Card>
              </div>

        <div className="div6">
          <Card 
            className={`h-full cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedKPI === 'performance' ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => setSelectedKPI('performance')}
          >
            <CardContent className="p-3 h-full flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Performance Score</p>
                  <p className="text-lg font-bold text-foreground">{Math.round((summary.conversion_rate * summary.total_profit) / 100)}</p>
                </div>
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Chart 7 - Main Chart */}
        <div className="div7">
          <ChartLineInteractive 
            selectedKPI={selectedKPI} 
            dashboardData={dashboardData} 
            dateRange={dateRange}
          />
        </div>

        {/* Chart 8 - Top Offers */}
        <div className="div8">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-900">Top Offers</CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col p-3 pb-8">
              <div className="flex-1 space-y-2">
                {top_performers.offers.slice(0, 3).map((offer, index) => (
                  <div key={offer.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {offer.offer}
                        </span>
                        <span className="text-xs text-gray-500">
                          {offer.clicks?.toLocaleString() || 0} clicks
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        ${offer.profit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart 9 - Top Affiliates */}
        <div className="div9">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-900">Top Affiliates</CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col p-3 pb-8">
              <div className="flex-1 space-y-2">
                {top_performers.affiliates.slice(0, 3).map((affiliate, index) => (
                  <div key={affiliate.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {affiliate.name || affiliate.affiliate}
                        </span>
                        <span className="text-xs text-gray-500">
                          {affiliate.clicks?.toLocaleString() || 0} clicks
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        ${affiliate.profit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>


        </div>
      </div>
    </div>
  );
}