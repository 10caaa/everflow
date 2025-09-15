import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
  isLoading?: boolean;
}

export function DateRangePicker({ startDate, endDate, onDateChange, isLoading = false }: DateRangePickerProps) {
  const handlePresetClick = (preset: string) => {
    const today = new Date();
    let start: Date;
    let end: Date = new Date(today);

    switch (preset) {
      case 'today':
        start = new Date(today);
        break;
      case 'yesterday':
        start = new Date(today);
        start.setDate(start.getDate() - 1);
        end = new Date(start);
        break;
      case 'last7days':
        start = new Date(today);
        start.setDate(start.getDate() - 7);
        break;
      case 'last30days':
        start = new Date(today);
        start.setDate(start.getDate() - 30);
        break;
      case 'last90days':
        start = new Date(today);
        start.setDate(start.getDate() - 90);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    onDateChange(formatDate(start), formatDate(end));
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Period Filter</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Custom Date Inputs */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onDateChange(e.target.value, endDate)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onDateChange(startDate, e.target.value)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
              />
            </div>

            {/* Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { key: 'today', label: 'Today' },
                { key: 'yesterday', label: 'Yesterday' },
                { key: 'last7days', label: '7 days' },
                { key: 'last30days', label: '30 days' },
                { key: 'last90days', label: '90 days' },
                { key: 'thisMonth', label: 'This month' },
                { key: 'lastMonth', label: 'Last month' }
              ].map((preset) => (
                <Button
                  key={preset.key}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetClick(preset.key)}
                  disabled={isLoading}
                  className="h-7 px-2 text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Period Display */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Selected period:</span>
            <span className="font-medium">
              {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
