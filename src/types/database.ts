export type PurchaseType = "personal" | "couples" | "cofounders" | "teams" | "coaching";
export type PurchaseStatus = "pending" | "completed" | "refunded";
export type ReportStatus = "generating" | "completed" | "failed";
export type InviteStatus = "pending" | "accepted" | "expired" | "declined";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          stripe_customer_id?: string | null;
        };
        Update: {
          full_name?: string | null;
          stripe_customer_id?: string | null;
        };
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          type: PurchaseType;
          status: PurchaseStatus;
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          amount_cents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: PurchaseType;
          status?: PurchaseStatus;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          amount_cents: number;
        };
        Update: {
          status?: PurchaseStatus;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
        };
      };
      quiz_responses: {
        Row: {
          id: string;
          user_id: string;
          question_index: number;
          answer: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_index: number;
          answer: number;
        };
        Update: {
          answer?: number;
        };
      };
      user_scores: {
        Row: {
          id: string;
          user_id: string;
          scores: number[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scores: number[];
        };
        Update: {
          scores?: number[];
        };
      };
      population_averages: {
        Row: {
          id: string;
          averages: number[];
          sample_size: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          averages: number[];
          sample_size: number;
        };
        Update: {
          averages?: number[];
          sample_size?: number;
        };
      };
      reports: {
        Row: {
          id: string;
          user_id: string;
          type: "personal" | "comparison";
          content: string | null;
          pdf_url: string | null;
          scores_snapshot: number[] | null;
          comparison_user_id: string | null;
          comparison_scores_snapshot: number[] | null;
          status: ReportStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: "personal" | "comparison";
          content?: string | null;
          pdf_url?: string | null;
          scores_snapshot?: number[] | null;
          comparison_user_id?: string | null;
          comparison_scores_snapshot?: number[] | null;
          status?: ReportStatus;
        };
        Update: {
          content?: string | null;
          pdf_url?: string | null;
          scores_snapshot?: number[] | null;
          comparison_user_id?: string | null;
          comparison_scores_snapshot?: number[] | null;
          status?: ReportStatus;
        };
      };
      invites: {
        Row: {
          id: string;
          from_user_id: string;
          to_email: string;
          to_user_id: string | null;
          token: string;
          type: PurchaseType;
          status: InviteStatus;
          purchase_id: string;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          to_email: string;
          to_user_id?: string | null;
          token: string;
          type: PurchaseType;
          status?: InviteStatus;
          purchase_id: string;
          expires_at: string;
        };
        Update: {
          to_user_id?: string | null;
          status?: InviteStatus;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
