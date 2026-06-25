export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      invoices: {
        Row: {
          created_at: string;
          date: string;
          email: string;
          id: string;
          line_items: Json;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          date?: string;
          email: string;
          id?: string;
          line_items?: Json;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          email?: string;
          id?: string;
          line_items?: Json;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type LineItem = {
  description: string;
  amount: number;
};

export type Invoice = Database["public"]["Tables"]["invoices"]["Row"] & {
  line_items: LineItem[];
};
