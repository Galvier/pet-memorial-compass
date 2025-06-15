export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      atendentes: {
        Row: {
          atendente_id: number
          created_at: string | null
          email: string
          nome_atendente: string
          status_disponibilidade: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp_atendente: string | null
        }
        Insert: {
          atendente_id?: number
          created_at?: string | null
          email: string
          nome_atendente: string
          status_disponibilidade?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_atendente?: string | null
        }
        Update: {
          atendente_id?: number
          created_at?: string | null
          email?: string
          nome_atendente?: string
          status_disponibilidade?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_atendente?: string | null
        }
        Relationships: []
      }
      atendimentos: {
        Row: {
          atendente_responsavel_id: number | null
          atendimento_id: number
          created_at: string | null
          dados_coletados: Json | null
          data_inicio: string | null
          payment_id: string | null
          pet_id: number | null
          status: string | null
          status_atendimento: string | null
          sugestoes_geradas: Json | null
          tipo_atendimento: string | null
          tutor_id: number | null
          updated_at: string | null
        }
        Insert: {
          atendente_responsavel_id?: number | null
          atendimento_id?: number
          created_at?: string | null
          dados_coletados?: Json | null
          data_inicio?: string | null
          payment_id?: string | null
          pet_id?: number | null
          status?: string | null
          status_atendimento?: string | null
          sugestoes_geradas?: Json | null
          tipo_atendimento?: string | null
          tutor_id?: number | null
          updated_at?: string | null
        }
        Update: {
          atendente_responsavel_id?: number | null
          atendimento_id?: number
          created_at?: string | null
          dados_coletados?: Json | null
          data_inicio?: string | null
          payment_id?: string | null
          pet_id?: number | null
          status?: string | null
          status_atendimento?: string | null
          sugestoes_geradas?: Json | null
          tipo_atendimento?: string | null
          tutor_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atendimentos_atendente_responsavel_id_fkey"
            columns: ["atendente_responsavel_id"]
            isOneToOne: false
            referencedRelation: "atendentes"
            referencedColumns: ["atendente_id"]
          },
          {
            foreignKeyName: "atendimentos_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimentos_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "atendimentos_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutores"
            referencedColumns: ["tutor_id"]
          },
        ]
      }
      city_estimates: {
        Row: {
          city_name: string
          created_at: string
          estimated_income: number
          id: string
          population_range: string | null
          region: string | null
          score: number
          state_code: string
          updated_at: string
        }
        Insert: {
          city_name: string
          created_at?: string
          estimated_income: number
          id?: string
          population_range?: string | null
          region?: string | null
          score: number
          state_code: string
          updated_at?: string
        }
        Update: {
          city_name?: string
          created_at?: string
          estimated_income?: number
          id?: string
          population_range?: string | null
          region?: string | null
          score?: number
          state_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      geocache: {
        Row: {
          created_at: string
          id: string
          last_checked: string
          location_key: string
          municipio_id: string | null
          municipio_nome: string | null
          renda_media: number | null
          score: number
          source: string
          uf: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_checked?: string
          location_key: string
          municipio_id?: string | null
          municipio_nome?: string | null
          renda_media?: number | null
          score: number
          source: string
          uf?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_checked?: string
          location_key?: string
          municipio_id?: string | null
          municipio_nome?: string | null
          renda_media?: number | null
          score?: number
          source?: string
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          atendimento_id: number | null
          created_at: string
          currency: string
          customer_info: Json | null
          gateway_payment_id: string | null
          gateway_type: string
          id: string
          items: Json | null
          payment_link: string | null
          status: string
          updated_at: string
          webhook_data: Json | null
        }
        Insert: {
          amount: number
          atendimento_id?: number | null
          created_at?: string
          currency?: string
          customer_info?: Json | null
          gateway_payment_id?: string | null
          gateway_type?: string
          id?: string
          items?: Json | null
          payment_link?: string | null
          status?: string
          updated_at?: string
          webhook_data?: Json | null
        }
        Update: {
          amount?: number
          atendimento_id?: number | null
          created_at?: string
          currency?: string
          customer_info?: Json | null
          gateway_payment_id?: string | null
          gateway_type?: string
          id?: string
          items?: Json | null
          payment_link?: string | null
          status?: string
          updated_at?: string
          webhook_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_atendimento_id_fkey"
            columns: ["atendimento_id"]
            isOneToOne: false
            referencedRelation: "atendimentos"
            referencedColumns: ["atendimento_id"]
          },
        ]
      }
      pets: {
        Row: {
          created_at: string | null
          idade_pet: number | null
          nome_pet: string
          pet_id: number
          tutor_id: number | null
        }
        Insert: {
          created_at?: string | null
          idade_pet?: number | null
          nome_pet: string
          pet_id?: number
          tutor_id?: number | null
        }
        Update: {
          created_at?: string | null
          idade_pet?: number | null
          nome_pet?: string
          pet_id?: number
          tutor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutores"
            referencedColumns: ["tutor_id"]
          },
        ]
      }
      tutores: {
        Row: {
          created_at: string | null
          endereco: string | null
          id_whatsapp: string
          nome_tutor: string
          perfil_calculado: string | null
          profissao: string | null
          tutor_id: number
        }
        Insert: {
          created_at?: string | null
          endereco?: string | null
          id_whatsapp: string
          nome_tutor: string
          perfil_calculado?: string | null
          profissao?: string | null
          tutor_id?: number
        }
        Update: {
          created_at?: string | null
          endereco?: string | null
          id_whatsapp?: string
          nome_tutor?: string
          perfil_calculado?: string | null
          profissao?: string | null
          tutor_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      status_atendimento_enum:
        | "BOT_ATIVO"
        | "AGUARDANDO_NA_FILA"
        | "ATRIBUIDO_HUMANO"
        | "FINALIZADO"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      status_atendimento_enum: [
        "BOT_ATIVO",
        "AGUARDANDO_NA_FILA",
        "ATRIBUIDO_HUMANO",
        "FINALIZADO",
      ],
    },
  },
} as const
