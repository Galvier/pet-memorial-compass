
import { supabase } from '@/integrations/supabase/client';

export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  created_at: string;
  updated_at: string;
}

/**
 * Serviço para gerenciar configurações globais do sistema
 */
export class SettingsService {
  /**
   * Busca uma configuração específica por chave
   */
  static async getSetting(key: string): Promise<Setting | null> {
    try {
      console.log(`🔧 Buscando configuração: ${key}`);
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', key)
        .maybeSingle();

      if (error) {
        console.error(`❌ Erro ao buscar configuração ${key}:`, error);
        return null;
      }

      if (data) {
        console.log(`✅ Configuração encontrada: ${key} = ${data.value}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ Erro na consulta da configuração ${key}:`, error);
      return null;
    }
  }

  /**
   * Busca o valor de uma configuração, com fallback
   */
  static async getSettingValue(key: string, defaultValue?: string): Promise<string> {
    const setting = await this.getSetting(key);
    return setting?.value || defaultValue || '';
  }

  /**
   * Atualiza ou cria uma configuração
   */
  static async setSetting(key: string, value: string, description?: string, category: string = 'general'): Promise<boolean> {
    try {
      console.log(`🔧 Atualizando configuração: ${key} = ${value}`);

      const { error } = await supabase
        .from('settings')
        .upsert({
          key,
          value,
          description,
          category
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error(`❌ Erro ao atualizar configuração ${key}:`, error);
        return false;
      }

      console.log(`✅ Configuração ${key} atualizada com sucesso`);
      return true;
    } catch (error) {
      console.error(`❌ Erro na atualização da configuração ${key}:`, error);
      return false;
    }
  }

  /**
   * Lista todas as configurações por categoria
   */
  static async getSettingsByCategory(category: string): Promise<Setting[]> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('category', category)
        .order('key');

      if (error) {
        console.error(`❌ Erro ao listar configurações da categoria ${category}:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error(`❌ Erro na consulta de configurações:`, error);
      return [];
    }
  }

  /**
   * Remove uma configuração
   */
  static async deleteSetting(key: string): Promise<boolean> {
    try {
      console.log(`🗑️ Removendo configuração: ${key}`);

      const { error } = await supabase
        .from('settings')
        .delete()
        .eq('key', key);

      if (error) {
        console.error(`❌ Erro ao remover configuração ${key}:`, error);
        return false;
      }

      console.log(`✅ Configuração ${key} removida com sucesso`);
      return true;
    } catch (error) {
      console.error(`❌ Erro na remoção da configuração ${key}:`, error);
      return false;
    }
  }

  /**
   * Métodos específicos para configurações de mercado imobiliário
   */
  static async getBasePriceMOC(): Promise<number> {
    const value = await this.getSettingValue('BASE_M2_PRICE_MOC', '3500');
    return parseFloat(value);
  }

  static async setBasePriceMOC(price: number): Promise<boolean> {
    return this.setSetting(
      'BASE_M2_PRICE_MOC',
      price.toString(),
      'Preço base do metro quadrado em Montes Claros (R$)',
      'real_estate'
    );
  }
}
