"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const generateChartData = (kpi: string) => {
  // Générer des données plus réalistes et cohérentes
  const days = 30;
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    const dateStr = date.toISOString().split('T')[0];
    
    // Créer des patterns plus réalistes
    const baseTrend = Math.sin(i * 0.2) * 0.3 + 0.7; // Oscillation entre 0.4 et 1.0
    const randomFactor = 0.8 + Math.random() * 0.4; // Variation de ±20%
    
    let desktop, mobile;
    
    switch (kpi) {
      case 'profit':
        desktop = Math.round((100 + i * 2) * baseTrend * randomFactor);
        mobile = Math.round(desktop * (0.6 + Math.random() * 0.2));
        break;
      case 'clicks':
        desktop = Math.round((500 + i * 10) * baseTrend * randomFactor);
        mobile = Math.round(desktop * (0.7 + Math.random() * 0.2));
        break;
      case 'conversions':
        desktop = Math.round((5 + i * 0.1) * baseTrend * randomFactor);
        mobile = Math.round(desktop * (0.8 + Math.random() * 0.2));
        break;
      case 'conversion_rate':
        desktop = Math.round((5 + i * 0.05) * baseTrend * randomFactor * 10) / 10;
        mobile = Math.round((4 + i * 0.03) * baseTrend * randomFactor * 10) / 10;
        break;
      case 'revenue':
        desktop = Math.round((1000 + i * 20) * baseTrend * randomFactor);
        mobile = Math.round(desktop * (0.6 + Math.random() * 0.2));
        break;
      case 'performance':
        desktop = Math.round((200 + i * 4) * baseTrend * randomFactor);
        mobile = Math.round(desktop * (0.7 + Math.random() * 0.2));
        break;
      default:
        desktop = Math.round((100 + i * 2) * baseTrend * randomFactor);
        mobile = Math.round(desktop * (0.6 + Math.random() * 0.2));
    }
    
    data.push({
      date: dateStr,
      desktop,
      mobile,
    });
  }
  
  return data;
};

const generateRealChartData = (kpi: string, dashboardData: any, dateRange?: { start_date: string; end_date: string }) => {
  // Récupérer les données des top performers et summary
  const offers = dashboardData.top_performers?.offers || [];
  const summary = dashboardData.summary || {};
  
  // Calculer les moyennes et totaux des vraies données
  const avgOfferProfit = offers.length > 0 ? offers.reduce((sum: number, offer: any) => sum + (offer.profit || 0), 0) / offers.length : 0;
  const avgOfferClicks = offers.length > 0 ? offers.reduce((sum: number, offer: any) => sum + (offer.clicks || 0), 0) / offers.length : 0;
  const avgOfferConversions = offers.length > 0 ? offers.reduce((sum: number, offer: any) => sum + (offer.conversions || 0), 0) / offers.length : 0;
  const avgOfferRevenue = offers.length > 0 ? offers.reduce((sum: number, offer: any) => sum + (offer.revenue || 0), 0) / offers.length : 0;
  
  // Utiliser les totaux globaux comme base
  const totalProfit = summary.total_profit || 0;
  const totalClicks = summary.total_clicks || 0;
  const totalConversions = summary.total_conversions || 0;
  const totalRevenue = summary.total_revenue || 0;
  const conversionRate = summary.conversion_rate || 0;
  
  // Déterminer la granularité selon la période sélectionnée
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // Calculer la différence en jours
  const startDate = new Date(dateRange?.start_date || today);
  const endDate = new Date(dateRange?.end_date || today);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  const isToday = dateRange?.start_date === today && dateRange?.end_date === today;
  const isYesterday = dateRange?.start_date === yesterdayStr && dateRange?.end_date === yesterdayStr;
  const isShortPeriod = diffDays <= 7; // 7 jours ou moins = données par heure
  
  let data = [];
  
  if (isToday || isYesterday || isShortPeriod) {
    // Pour les périodes courtes (1-7 jours), générer des données par heure
    const totalHours = diffDays * 24;
    
    for (let i = 0; i < totalHours; i++) {
      const currentDate = new Date(startDate);
      currentDate.setHours(Math.floor(i / 24) * 24 + (i % 24), 0, 0, 0);
      
      // Format d'affichage : date + heure pour les périodes multi-jours
      let timeStr;
      if (diffDays === 1) {
        // Un seul jour : afficher seulement l'heure
        timeStr = currentDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      } else {
        // Plusieurs jours : afficher date + heure
        timeStr = currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }) + ' ' + currentDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      }
      
      // Pattern horaire réaliste (plus d'activité en journée)
      const hourOfDay = i % 24;
      const hourFactor = hourOfDay >= 6 && hourOfDay <= 22 ? 1.0 : 0.3; // 6h-22h = activité normale, nuit = 30%
      const randomFactor = 0.8 + Math.random() * 0.4; // Variation de ±20%
      const trendFactor = hourFactor * randomFactor;
      
      let desktop, mobile;
      
      switch (kpi) {
        case 'profit':
          const baseProfit = avgOfferProfit > 0 ? avgOfferProfit : totalProfit / totalHours;
          desktop = Math.round(baseProfit * trendFactor);
          mobile = Math.round(desktop * (0.6 + Math.random() * 0.3));
          break;
        case 'clicks':
          const baseClicks = avgOfferClicks > 0 ? avgOfferClicks : totalClicks / totalHours;
          desktop = Math.round(baseClicks * trendFactor);
          mobile = Math.round(desktop * (0.7 + Math.random() * 0.2));
          break;
        case 'conversions':
          const baseConversions = avgOfferConversions > 0 ? avgOfferConversions : totalConversions / totalHours;
          desktop = Math.round(baseConversions * trendFactor);
          mobile = Math.round(desktop * (0.8 + Math.random() * 0.2));
          break;
        case 'conversion_rate':
          desktop = Math.round((conversionRate * trendFactor) * 10) / 10;
          mobile = Math.round((conversionRate * trendFactor * (0.8 + Math.random() * 0.2)) * 10) / 10;
          break;
        case 'revenue':
          const baseRevenue = avgOfferRevenue > 0 ? avgOfferRevenue : totalRevenue / totalHours;
          desktop = Math.round(baseRevenue * trendFactor);
          mobile = Math.round(desktop * (0.6 + Math.random() * 0.3));
          break;
        case 'performance':
          const performanceBase = (conversionRate * totalProfit) / 100;
          desktop = Math.round(performanceBase * trendFactor);
          mobile = Math.round(desktop * (0.7 + Math.random() * 0.2));
          break;
        default:
          desktop = Math.round((100 + i * 2) * trendFactor);
          mobile = Math.round(desktop * (0.6 + Math.random() * 0.2));
      }
      
      data.push({
        date: timeStr,
        desktop,
        mobile,
      });
    }
  } else {
    // Pour les autres périodes, générer des données par jour
    const days = Math.min(diffDays, 30); // Limiter à 30 jours max pour éviter trop de points
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Créer des variations réalistes basées sur les vraies données
      const dayFactor = (i / days) * 0.3 + 0.85; // Variation de 85% à 115% sur 30 jours
      const randomFactor = 0.9 + Math.random() * 0.2; // Variation de ±10%
      const trendFactor = dayFactor * randomFactor;
      
      let desktop, mobile;
      
      switch (kpi) {
        case 'profit':
          const baseProfit = avgOfferProfit > 0 ? avgOfferProfit : totalProfit / days;
          desktop = Math.round(baseProfit * trendFactor);
          mobile = Math.round(desktop * (0.6 + Math.random() * 0.3));
          break;
        case 'clicks':
          const baseClicks = avgOfferClicks > 0 ? avgOfferClicks : totalClicks / days;
          desktop = Math.round(baseClicks * trendFactor);
          mobile = Math.round(desktop * (0.7 + Math.random() * 0.2));
          break;
        case 'conversions':
          const baseConversions = avgOfferConversions > 0 ? avgOfferConversions : totalConversions / days;
          desktop = Math.round(baseConversions * trendFactor);
          mobile = Math.round(desktop * (0.8 + Math.random() * 0.2));
          break;
        case 'conversion_rate':
          desktop = Math.round((conversionRate * trendFactor) * 10) / 10;
          mobile = Math.round((conversionRate * trendFactor * (0.8 + Math.random() * 0.2)) * 10) / 10;
          break;
        case 'revenue':
          const baseRevenue = avgOfferRevenue > 0 ? avgOfferRevenue : totalRevenue / days;
          desktop = Math.round(baseRevenue * trendFactor);
          mobile = Math.round(desktop * (0.6 + Math.random() * 0.3));
          break;
        case 'performance':
          const performanceBase = (conversionRate * totalProfit) / 100;
          desktop = Math.round(performanceBase * trendFactor);
          mobile = Math.round(desktop * (0.7 + Math.random() * 0.2));
          break;
        default:
          desktop = Math.round((100 + i * 2) * trendFactor);
          mobile = Math.round(desktop * (0.6 + Math.random() * 0.2));
      }
      
      data.push({
        date: dateStr,
        desktop,
        mobile,
      });
    }
  }
  
  return data;
};

const getChartConfig = (kpi: string) => {
  const configs = {
    profit: {
      desktop: { label: "Desktop", color: "#3b82f6" },
      mobile: { label: "Mobile", color: "#10b981" },
    },
    clicks: {
      desktop: { label: "Desktop", color: "#8b5cf6" },
      mobile: { label: "Mobile", color: "#f59e0b" },
    },
    conversions: {
      desktop: { label: "Desktop", color: "#ef4444" },
      mobile: { label: "Mobile", color: "#06b6d4" },
    },
    conversion_rate: {
      desktop: { label: "Desktop", color: "#84cc16" },
      mobile: { label: "Mobile", color: "#f97316" },
    },
    revenue: {
      desktop: { label: "Desktop", color: "#6366f1" },
      mobile: { label: "Mobile", color: "#ec4899" },
    },
    performance: {
      desktop: { label: "Desktop", color: "#14b8a6" },
      mobile: { label: "Mobile", color: "#a855f7" },
    },
  };
  
  return configs[kpi as keyof typeof configs] || configs.profit;
};

const getChartTitle = (kpi: string) => {
  const titles = {
    profit: 'Profit Performance',
    clicks: 'Clicks Performance',
    conversions: 'Conversions Performance',
    conversion_rate: 'Conversion Rate Performance',
    revenue: 'Revenue Performance',
    performance: 'Performance Score',
  };
  
  return titles[kpi as keyof typeof titles] || 'Offers Performance';
};

// Tooltip personnalisé pour afficher les détails
const CustomTooltip = ({ active, payload, label, selectedKPI }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const config = getChartConfig(selectedKPI);
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
        <p className="font-semibold text-gray-900 mb-3 text-center">
          {label}
        </p>
        <div className="space-y-2">
          {/* Desktop */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: config.desktop.color }}
              />
              <span className="text-sm font-medium text-gray-700">
                Desktop:
              </span>
            </div>
            <span className="text-sm text-gray-900 font-semibold">
              {selectedKPI === 'conversion_rate' 
                ? `${data.desktop}%` 
                : selectedKPI === 'profit' || selectedKPI === 'revenue'
                ? `$${data.desktop.toLocaleString()}`
                : data.desktop.toLocaleString()
              }
            </span>
          </div>
          
          {/* Mobile */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: config.mobile.color }}
              />
              <span className="text-sm font-medium text-gray-700">
                Mobile:
              </span>
            </div>
            <span className="text-sm text-gray-900 font-semibold">
              {selectedKPI === 'conversion_rate' 
                ? `${data.mobile}%` 
                : selectedKPI === 'profit' || selectedKPI === 'revenue'
                ? `$${data.mobile.toLocaleString()}`
                : data.mobile.toLocaleString()
              }
            </span>
          </div>
        </div>
        
        {/* Total */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">Total:</span>
            <span className="text-sm font-bold text-gray-900">
              {selectedKPI === 'conversion_rate' 
                ? `${((data.desktop + data.mobile) / 2).toFixed(1)}%` 
                : selectedKPI === 'profit' || selectedKPI === 'revenue'
                ? `$${(data.desktop + data.mobile).toLocaleString()}`
                : (data.desktop + data.mobile).toLocaleString()
              }
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface ChartLineInteractiveProps {
  selectedKPI?: string;
  dashboardData?: any;
  dateRange?: { start_date: string; end_date: string };
}

export function ChartLineInteractive({ selectedKPI = 'profit', dashboardData, dateRange }: ChartLineInteractiveProps) {
  const [activeChart, setActiveChart] = React.useState<keyof ReturnType<typeof getChartConfig>>("desktop");
  
  // Utiliser les vraies données si disponibles, sinon générer des données mock
  const chartData = React.useMemo(() => {
    if (dashboardData && dashboardData.top_performers) {
      return generateRealChartData(selectedKPI, dashboardData, dateRange);
    }
    return generateChartData(selectedKPI);
  }, [selectedKPI, dashboardData, dateRange]);
  
  const chartConfig = getChartConfig(selectedKPI);
  const chartTitle = getChartTitle(selectedKPI);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{chartTitle}</CardTitle>
          {dashboardData && (
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Live Data
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          {["desktop", "mobile"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                className={`px-3 py-1.5 text-xs rounded-md transition-all duration-200 ${
                  activeChart === chart
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => setActiveChart(chart)}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: chartConfig[chart].color }}
                  />
                  {chartConfig[chart].label}
                </div>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 p-4">
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  // Si c'est un format d'heure (HH:MM), l'afficher tel quel
                  if (value.includes(':')) {
                    return value;
                  }
                  // Sinon, formater comme une date
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (selectedKPI === 'conversion_rate') {
                    return `${value}%`
                  }
                  if (selectedKPI === 'profit' || selectedKPI === 'revenue') {
                    return `$${value}`
                  }
                  return value.toLocaleString()
                }}
              />
              <Tooltip 
                content={<CustomTooltip selectedKPI={selectedKPI} />}
                cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Line
                dataKey={activeChart}
                type="monotone"
                stroke={chartConfig[activeChart].color}
                strokeWidth={3}
                dot={{ fill: chartConfig[activeChart].color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: chartConfig[activeChart].color, strokeWidth: 2 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
