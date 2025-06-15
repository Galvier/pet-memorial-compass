
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, Table } from 'lucide-react';
import type { AnalyticsData } from './AnalyticsDashboard';

interface DataExportProps {
  data: AnalyticsData;
}

export const DataExport: React.FC<DataExportProps> = ({ data }) => {
  const exportToCsv = (filename: string, csvData: string) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportLocationScores = () => {
    const headers = 'Endereço,Score,Bairro,Data\n';
    const csvData = data.locationScores.map(item => 
      `"${item.address}",${item.score},"${item.bairro || 'N/A'}","${item.date}"`
    ).join('\n');
    
    exportToCsv('location-scores.csv', headers + csvData);
  };

  const exportBusinessProfiles = () => {
    const headers = 'Categoria,Quantidade,Percentual\n';
    const csvData = data.businessProfiles.map(item => 
      `"${item.category}",${item.count},${item.percentage}`
    ).join('\n');
    
    exportToCsv('business-profiles.csv', headers + csvData);
  };

  const exportRealEstateFactors = () => {
    const headers = 'Bairro,Fator,Categoria\n';
    const csvData = data.realEstateFactors.map(item => 
      `"${item.bairro}",${item.factor},"${item.category}"`
    ).join('\n');
    
    exportToCsv('real-estate-factors.csv', headers + csvData);
  };

  const exportFullReport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const report = `
RELATÓRIO DE ANALYTICS - ${timestamp}

MÉTRICAS GERAIS:
- Total de Análises: ${data.totalAnalyses}
- Score Médio: ${data.averageScore}
- Taxa de Sucesso: ${data.performanceMetrics.successRate}%
- Cache Hit Rate: ${data.performanceMetrics.cacheHitRate}%
- Tempo Médio de Resposta: ${data.performanceMetrics.averageResponseTime}ms

TOP ÁREAS POR PERFORMANCE:
${data.topPerformingAreas.map((area, index) => 
  `${index + 1}. ${area.name}: ${area.score} pontos`
).join('\n')}

DISTRIBUIÇÃO DE PERFIS COMERCIAIS:
${data.businessProfiles.map(profile => 
  `${profile.category}: ${profile.count} análises (${profile.percentage}%)`
).join('\n')}

FATORES IMOBILIÁRIOS:
${data.realEstateFactors.map(factor => 
  `${factor.bairro}: ${factor.factor}x (${factor.category})`
).join('\n')}
    `.trim();
    
    exportToCsv(`analytics-report-${timestamp}.txt`, report);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar Dados
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportLocationScores}>
          <Table className="w-4 h-4 mr-2" />
          Scores por Localização (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportBusinessProfiles}>
          <Table className="w-4 h-4 mr-2" />
          Perfis Comerciais (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportRealEstateFactors}>
          <Table className="w-4 h-4 mr-2" />
          Fatores Imobiliários (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportFullReport}>
          <FileText className="w-4 h-4 mr-2" />
          Relatório Completo (TXT)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
