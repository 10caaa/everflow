import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './button';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
}

interface SortableTableProps {
  columns: SortableColumn[];
  data: any[];
  sortKey?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string) => void;
  children: (item: any, index: number) => React.ReactNode;
}

export function SortableTable({
  columns,
  data,
  sortKey,
  sortDirection,
  onSort,
  children
}: SortableTableProps) {
  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <ChevronUp className="h-4 w-4 opacity-50" />;
    }
    
    if (sortDirection === 'asc') {
      return <ChevronUp className="h-4 w-4" />;
    } else if (sortDirection === 'desc') {
      return <ChevronDown className="h-4 w-4" />;
    }
    
    return <ChevronUp className="h-4 w-4 opacity-50" />;
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-sm font-medium text-muted-foreground ${
                    column.className || ''
                  }`}
                >
                  {column.sortable !== false ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort(column.key)}
                      className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                      <span className="mr-1">{column.label}</span>
                      {getSortIcon(column.key)}
                    </Button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                {children(item, index)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
