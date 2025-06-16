
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface AnalyticsFiltersProps {
  selectedPeriod: string;
  selectedRegion: string;
  onPeriodChange: (period: string) => void;
  onRegionChange: (region: string) => void;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  selectedPeriod,
  selectedRegion,
  onPeriodChange,
  onRegionChange
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Últimas 24 horas</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Região</label>
            <Select value={selectedRegion} onValueChange={onRegionChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecionar região" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as regiões</SelectItem>
                <SelectItem value="montes-claros">Montes Claros</SelectItem>
                <SelectItem value="ibituruna">Ibituruna</SelectItem>
                <SelectItem value="centro">Centro</SelectItem>
                <SelectItem value="morada-sol">Morada do Sol</SelectItem>
                <SelectItem value="todos-santos">Todos os Santos</SelectItem>
                <SelectItem value="major-prates">Major Prates</SelectItem>
                <SelectItem value="augusta-mota">Augusta Mota</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
