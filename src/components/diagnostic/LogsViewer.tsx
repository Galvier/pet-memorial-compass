
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Download, Filter } from 'lucide-react';
import { DiagnosticService } from '@/services/DiagnosticService';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: 'frontend' | 'postgres' | 'edge-function' | 'auth';
  message: string;
  metadata?: any;
}

export const LogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const logData = await DiagnosticService.getLogs(filter, levelFilter);
      setLogs(logData);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filter, levelFilter]);

  const exportLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()} [${log.source}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pet-memorial-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelBadge = (level: string) => {
    const variants = {
      error: 'destructive',
      warn: 'secondary',
      info: 'default',
      debug: 'outline'
    } as const;
    
    return <Badge variant={variants[level as keyof typeof variants]}>{level}</Badge>;
  };

  const getSourceColor = (source: string) => {
    const colors = {
      frontend: 'text-blue-600',
      postgres: 'text-green-600',
      'edge-function': 'text-purple-600',
      auth: 'text-orange-600'
    };
    return colors[source as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Logs do Sistema</h2>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por fonte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as fontes</SelectItem>
              <SelectItem value="frontend">Frontend</SelectItem>
              <SelectItem value="postgres">Postgres</SelectItem>
              <SelectItem value="edge-function">Edge Functions</SelectItem>
              <SelectItem value="auth">Autenticação</SelectItem>
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              <SelectItem value="error">Errors</SelectItem>
              <SelectItem value="warn">Warnings</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={loadLogs} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Logs Recentes ({logs.length} entradas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum log encontrado com os filtros selecionados
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-mono text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    {getLevelBadge(log.level)}
                    <span className={`font-medium ${getSourceColor(log.source)}`}>
                      {log.source}
                    </span>
                  </div>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                    {log.message}
                  </p>
                  {log.metadata && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground">
                        Metadados
                      </summary>
                      <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
