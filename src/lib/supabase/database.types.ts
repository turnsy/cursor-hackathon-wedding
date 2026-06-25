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
      conversations: {
        Row: {
          created_at: string;
          id: string;
          metadata: Json;
          session_id: string | null;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          metadata?: Json;
          session_id?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          metadata?: Json;
          session_id?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
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
      messages: {
        Row: {
          conversation_id: string;
          created_at: string;
          id: string;
          parts: Json;
          role: string;
          sequence: number;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          id: string;
          parts?: Json;
          role: string;
          sequence: number;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          id?: string;
          parts?: Json;
          role?: string;
          sequence?: number;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
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

export type Conversation =
  Database["public"]["Tables"]["conversations"]["Row"];

export type Message = Database["public"]["Tables"]["messages"]["Row"];

export type MessageRole = "user" | "assistant" | "system";
