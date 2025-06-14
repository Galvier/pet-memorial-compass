
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface ProdutosSugeridosProps {
  sugestoesGeradas: any[];
}

export const ProdutosSugeridos: React.FC<ProdutosSugeridosProps> = ({ sugestoesGeradas }) => {
  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numPrice);
  };

  if (!sugestoesGeradas || sugestoesGeradas.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="w-5 h-5" />
          <span>Produtos Sugeridos</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sugestoesGeradas.map((sugestao: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                {sugestao.nome}
              </h3>
              {sugestao.descricao && (
                <p className="text-sm text-gray-600 mb-3">
                  {sugestao.descricao}
                </p>
              )}
              {sugestao.preco && (
                <div className="text-lg font-bold text-green-600">
                  {formatPrice(sugestao.preco)}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
