// Auto-generated types for Supabase — matches public schema tables

export interface Database {
    public: {
        Tables: {
            users: {
                Row: UserRow;
                Insert: UserInsert;
                Update: UserUpdate;
            };
            credit_history: {
                Row: CreditHistoryRow;
                Insert: CreditHistoryInsert;
                Update: Partial<CreditHistoryInsert>;
            };
            ideas: {
                Row: IdeaRow;
                Insert: IdeaInsert;
                Update: Partial<IdeaInsert>;
            };
            coupons: {
                Row: CouponRow;
                Insert: CouponInsert;
                Update: Partial<CouponInsert>;
            };
            website_settings: {
                Row: { key: string; value: unknown; updated_at: string };
                Insert: { key: string; value: unknown; updated_at?: string };
                Update: { key?: string; value?: unknown; updated_at?: string };
            };
        };
        Functions: {
            get_all_users_admin: {
                Args: Record<string, never>;
                Returns: Record<string, unknown>[];
            };
            update_user_admin: {
                Args: { p_user_id: string; p_updates: Record<string, unknown> };
                Returns: void;
            };
            get_all_coupons_admin: {
                Args: Record<string, never>;
                Returns: Record<string, unknown>[];
            };
            create_coupon_admin: {
                Args: {
                    p_code: string; p_plan: string; p_duration: number;
                    p_duration_unit: string; p_credits: number; p_is_active: boolean;
                    p_max_uses: number; p_category: string; p_expires_at: string;
                };
                Returns: void;
            };
            toggle_coupon_admin: {
                Args: { p_coupon_id: string; p_active: boolean };
                Returns: void;
            };
            delete_coupon_admin: {
                Args: { p_coupon_id: string };
                Returns: void;
            };
            get_all_credit_history_admin: {
                Args: { p_limit: number };
                Returns: Record<string, unknown>[];
            };
            get_admin_stats_rpc: {
                Args: Record<string, never>;
                Returns: Record<string, unknown>;
            };
        };
    };
}

// ─── Users ───────────────────────────────────────────────────────────────────
export interface UserRow {
    id: string;
    name: string;
    email: string;
    plan: 'Starter' | 'Pro' | 'Builder';
    credits: number;
    max_credits: number;
    is_email_verified: boolean;
    coupon_used: string | null;
    stripe_customer_id: string | null;
    selected_currency: string | null;
    language: string | null;
    last_credit_reset: string;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}
export type UserInsert = Omit<UserRow, 'created_at' | 'updated_at'> & {
    created_at?: string;
    updated_at?: string;
};
export type UserUpdate = Partial<Omit<UserRow, 'id' | 'created_at'>>;

// ─── Credit History ───────────────────────────────────────────────────────────
export interface CreditHistoryRow {
    id: string;
    user_id: string;
    action: string;
    change: number;
    balance: number;
    date: string;
    created_at: string;
}
export type CreditHistoryInsert = Omit<CreditHistoryRow, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

// ─── Ideas ────────────────────────────────────────────────────────────────────
export interface IdeaRow {
    id: string;
    user_id: string;
    title: string;
    content: string;
    rating: 'good' | 'medium' | 'bad';
    credits_used: number;
    tags: string[] | null;
    conversation_history: Array<{ role: 'user' | 'assistant'; content: string }> | null;
    created_at: string;
}
export type IdeaInsert = Omit<IdeaRow, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

// ─── Coupons ─────────────────────────────────────────────────────────────────
export interface CouponRow {
    id: string;
    code: string;
    plan: string;
    duration: number;
    duration_unit: 'days' | 'months';
    credits: number;
    is_active: boolean;
    used_count: number;
    max_uses: number;
    category: 'registration' | 'trial';
    expires_at: string | null;
    created_at: string;
}
export type CouponInsert = Omit<CouponRow, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

// ─── App-level types (mirrors old Firebase types) ────────────────────────────
export interface UserDocument {
    name: string;
    email: string;
    plan: string;
    credits: number;
    maxCredits: number;
    createdAt: string;
    isEmailVerified: boolean;
    couponUsed: string | null;
    stripeCustomerId?: string;
    selectedCurrency?: string;
    language?: string;
    lastCreditReset?: string;
    avatarUrl?: string | null;
}

export interface IdeaRecord {
    id?: string;
    userId: string;
    title: string;
    content: string;
    rating: 'good' | 'medium' | 'bad';
    creditsUsed: number;
    createdAt: string;
    tags?: string[];
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface CreditHistoryRecord {
    id?: string;
    userId: string;
    action: string;
    change: number;
    balance: number;
    date: string;
    createdAt: string;
}

export interface CouponDocument {
    id?: string;
    code: string;
    plan: string;
    duration: number;
    durationUnit: 'days' | 'months';
    credits: number;
    isActive: boolean;
    usedCount: number;
    maxUses: number;
    category: 'registration' | 'trial';
    expiresAt: string | null;
    createdAt: string;
}
