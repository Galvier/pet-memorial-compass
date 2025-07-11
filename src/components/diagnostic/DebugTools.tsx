
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlayCircle, Database, TestTube, Code } from 'lucide-react';
import { DiagnosticService } from '@/services/DiagnosticService';

export const DebugTools: React.FC = () => {
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testScenario, setTestScenario] = useState('');
  const [inspectionTable, setInspectionTable] = useState('atendimentos');

  const executeQuery = async () => {
    if (!sqlQuery.trim()) return;
    
    setLoading(true);
    try {
      const result = await DiagnosticService.executeDebugQuery(sqlQuery);
      setQueryResult(result);
    } catch (error) {
      setQueryResult({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
    } finally {
      setLoading(false);
    }
  };

  const runTestScenario = async () => {
    if (!testScenario.trim()) return;
    
    setLoading(true);
    try {
      const result = await DiagnosticService.runTestScenario(testScenario);
      setQueryResult(result);
    } catch (error) {
      setQueryResult({ error: error instanceof Error ? error.message : 'Erro no teste' });
    } finally {
      setLoading(false);
    }
  };

  const inspectTable = async () => {
    setLoading(true);
    try {
      const result = await DiagnosticService.inspectTable(inspectionTable);
      setQueryResult(result);
    } catch (error) {
      setQueryResult({ error: error instanceof Error ? error.message : 'Erro na inspeção' });
    } finally {
      setLoading(false);
    }
  };

  const commonQueries = [
    {
      name: 'Atendimentos Recentes',
      query: 'SELECT * FROM atendimentos ORDER BY created_at DESC LIMIT 10'
    },
    {
      name: 'Atendentes Online',
      query: 'SELECT * FROM atendentes WHERE status_disponibilidade = \'Online\''
    },
    {
      name: 'Estatísticas de Hoje',
      query: 'SELECT COUNT(*) as total, status FROM atendimentos WHERE DATE(created_at) = CURRENT_DATE GROUP BY status'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Ferramentas de Debug</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Console SQL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sql-query">Query SQL</Label>
              <Textarea
                id="sql-query"
                placeholder="SELECT * FROM atendimentos WHERE..."
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {commonQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setSqlQuery(query.query)}
                >
                  {query.name}
                </Button>
              ))}
            </div>

            <Button onClick={executeQuery} disabled={loading} className="w-full">
              <PlayCircle className="h-4 w-4 mr-2" />
              Executar Query
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Simulador de Cenários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-scenario">Cenário de Teste</Label>
              <Input
                id="test-scenario"
                placeholder="novo_atendimento, webhook_test, geocoding_test..."
                value={testScenario}
                onChange={(e) => setTestScenario(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Cenários Disponíveis:</Label>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => setTestScenario('novo_atendimento')}
                >
                  novo_atendimento
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => setTestScenario('webhook_test')}
                >
                  webhook_test
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => setTestScenario('geocoding_test')}
                >
                  geocoding_test
                </Badge>
              </div>
            </div>

            <Button onClick={runTestScenario} disabled={loading} className="w-full">
              <TestTube className="h-4 w-4 mr-2" />
              Executar Cenário
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Inspetor de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="table-select">Tabela:</Label>
            <Select value={inspectionTable} onValueChange={setInspectionTable}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione uma tabela" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="atendimentos">atendimentos</SelectItem>
                <SelectItem value="atendentes">atendentes</SelectItem>
                <SelectItem value="tutores">tutores</SelectItem>
                <SelectItem value="pets">pets</SelectItem>
                <SelectItem value="payments">payments</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={inspectTable} disabled={loading} size="sm">
              <Database className="h-4 w-4 mr-2" />
              Inspecionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {queryResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            {queryResult.error ? (
              <div className="text-red-600 bg-red-50 p-4 rounded border">
                <strong>Erro:</strong> {queryResult.error}
              </div>
            ) : queryResult.data ? (
              <div className="space-y-4">
                {queryResult.table && (
                  <div className="text-sm text-muted-foreground">
                    Tabela: <strong>{queryResult.table}</strong> | 
                    Registros: <strong>{queryResult.count}</strong>
                  </div>
                )}
                <div className="overflow-x-auto border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {(queryResult.schema || Object.keys(queryResult.data[0] || {})).map((key: string) => (
                          <TableHead key={key} className="font-semibold">{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queryResult.data.map((row: any, index: number) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value: any, cellIndex) => (
                            <TableCell key={cellIndex} className="max-w-xs">
                              <div className="truncate" title={typeof value === 'object' ? JSON.stringify(value) : String(value)}>
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(queryResult, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
