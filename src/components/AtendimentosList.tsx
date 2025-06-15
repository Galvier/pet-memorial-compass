import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, Eye, User, Phone, MapPin, Briefcase, Calendar, Heart, Bot, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Atendimento } from '@/types';

export const AtendimentosList: React.FC = () => {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAtendimentos = async () => {
      try {
        console.log('🔄 Carregando atendimentos do Supabase...');
        
        // Buscar atendimentos com relacionamentos
        const { data: atendimentosData, error: atendimentosError } = await supabase
          .from('atendimentos')
          .select('*')
          .order('data_inicio', { ascending: false });

        if (atendimentosError) throw atendimentosError;

        // Buscar tutores
        const { data: tutoresData, error: tutoresError } = await supabase
          .from('tutores')
          .select('*');

        if (tutoresError) throw tutoresError;

        // Buscar pets
        const { data: petsData, error: petsError } = await supabase
          .from('pets')
          .select('*');

        if (petsError) throw petsError;

        // Buscar atendentes
        const { data: atendentesData, error: atendentesError } = await supabase
          .from('atendentes')
          .select('*');

        if (atendentesError) throw atendentesError;

        // Combinar dados com type assertions
        const atendimentosCompletos: Atendimento[] = (atendimentosData || []).map(atendimento => ({
          ...atendimento,
          status: atendimento.status as 'Em andamento' | 'Sugestão enviada' | 'Finalizado',
          status_atendimento: atendimento.status_atendimento as 'BOT_ATIVO' | 'AGUARDANDO_NA_FILA' | 'ATRIBUIDO_HUMANO' | 'FINALIZADO',
          tipo_atendimento: atendimento.tipo_atendimento as 'Imediato' | 'Preventivo',
          tutor: tutoresData?.find(t => t.tutor_id === atendimento.tutor_id) ? {
            ...tutoresData.find(t => t.tutor_id === atendimento.tutor_id)!,
            perfil_calculado: tutoresData.find(t => t.tutor_id === atendimento.tutor_id)!.perfil_calculado as 'Padrão' | 'Intermediário' | 'Luxo'
          } : undefined,
          pet: petsData?.find(p => p.pet_id === atendimento.pet_id),
          atendente: atendimento.atendente_responsavel_id && atendentesData?.find(a => a.atendente_id === atendimento.atendente_responsavel_id) ? {
            ...atendentesData.find(a => a.atendente_id === atendimento.atendente_responsavel_id)!,
            status_disponibilidade: atendentesData.find(a => a.atendente_id === atendimento.atendente_responsavel_id)!.status_disponibilidade as 'Online' | 'Offline'
          } : undefined
        }));

        console.log('✅ Atendimentos carregados:', atendimentosCompletos.length);
        setAtendimentos(atendimentosCompletos);
      } catch (error) {
        console.error('❌ Erro ao carregar atendimentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAtendimentos();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors = {
      'Em andamento': 'bg-yellow-primary/10 text-yellow-primary border-yellow-primary/20',
      'Sugestão enviada': 'bg-purple-primary/10 text-purple-primary border-purple-primary/20',
      'Finalizado': 'bg-green-50 text-green-700 border-green-200'
    } as const;
    
    return (
      <Badge className={`${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200'} text-xs px-2 py-1`}>
        {status}
      </Badge>
    );
  };

  const getStatusAtendimentoIcon = (statusAtendimento: string) => {
    const config = {
      'BOT_ATIVO': { icon: Bot, color: 'text-blue-600', label: 'Bot Ativo' },
      'ATRIBUIDO_HUMANO': { icon: UserCheck, color: 'text-orange-600', label: 'Atendente' },
      'HUMANO_ASSUMIU': { icon: UserCheck, color: 'text-orange-600', label: 'Atendente' },
      'FINALIZADO': { icon: UserCheck, color: 'text-green-600', label: 'Finalizado' }
    } as const;

    const { icon: Icon, color, label } = config[statusAtendimento as keyof typeof config] || config.BOT_ATIVO;
    
    return (
      <div className={`flex items-center space-x-1 ${color}`} title={label}>
        <Icon className="w-3 h-3" />
        <span className="text-xs">{label}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="h-6 lg:h-8 bg-gray-200 rounded w-48 lg:w-64 animate-pulse"></div>
        <div className="space-y-3 lg:space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 lg:p-6">
                <div className="h-16 lg:h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl lg:text-3xl font-bold text-purple-primary mb-1 lg:mb-2">Atendimentos</h1>
        <p className="text-sm lg:text-base text-gray-600">Histórico completo de atendimentos realizados</p>
      </div>

      <div className="space-y-3 lg:space-y-4">
        {atendimentos.map((atendimento) => (
          <Card key={atendimento.atendimento_id} className="hover:shadow-md transition-shadow border-l-4 border-purple-primary/20 bg-white">
            <CardContent className="p-4 lg:p-6">
              <div className="space-y-3 lg:space-y-4">
                {/* Header with name and status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-purple-primary/60 flex-shrink-0" />
                    <span className="font-semibold text-purple-primary text-sm lg:text-base">
                      {atendimento.tutor?.nome_tutor || 'Nome não informado'}
                    </span>
                    {atendimento.pet?.nome_pet && (
                      <span className="text-gray-500 text-xs lg:text-sm">
                        (Pet: {atendimento.pet.nome_pet})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(atendimento.status || 'Em andamento')}
                  </div>
                </div>
                
                {/* Contact and basic info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3 text-xs lg:text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                    <span className="truncate">{atendimento.tutor?.id_whatsapp || 'WhatsApp não informado'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                    <span className="truncate">{atendimento.tutor?.profissao || 'Profissão não informada'}</span>
                  </div>
                </div>
                
                {/* Pet info if available */}
                {atendimento.pet && (
                  <div className="flex items-center space-x-2 text-xs lg:text-sm text-purple-primary/70">
                    <Heart className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                    <span>
                      {atendimento.pet.nome_pet} ({atendimento.pet.idade_pet} anos)
                    </span>
                  </div>
                )}
                
                {/* Date and status control */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs lg:text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                    <span>{formatDate(atendimento.data_inicio || new Date().toISOString())}</span>
                  </div>
                  <div className="flex items-center">
                    {getStatusAtendimentoIcon(atendimento.status_atendimento || 'BOT_ATIVO')}
                  </div>
                </div>
                
                {/* Address */}
                <div className="flex items-start space-x-2 text-xs lg:text-sm text-gray-600">
                  <MapPin className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{atendimento.tutor?.endereco || 'Endereço não informado'}</span>
                </div>
                
                {/* Action button */}
                <div className="pt-2 border-t border-gray-100">
                  <Link to={`/atendimentos/${atendimento.atendimento_id}`} className="block">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full sm:w-auto border-purple-primary/30 text-purple-primary hover:bg-purple-primary hover:text-white text-xs lg:text-sm"
                    >
                      <Eye className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {atendimentos.length === 0 && (
        <div className="text-center py-8 lg:py-12">
          <History className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 lg:mb-4" />
          <h3 className="text-base lg:text-lg font-medium text-gray-600 mb-2">
            Nenhum atendimento registrado
          </h3>
          <p className="text-sm lg:text-base text-gray-500">
            Os atendimentos aparecerão aqui conforme forem realizados via WhatsApp.
          </p>
        </div>
      )}
    </div>
  );
};
