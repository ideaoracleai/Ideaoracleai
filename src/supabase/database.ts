// Supabase Database Service for IdeaOracle.ai
// Drop-in replacement for Firebase Firestore service
import { supabase } from './config';
import type {
    UserDocument,
    IdeaRecord,
    CreditHistoryRecord,
    CouponDocument,
} from './types';

// ─── Helpers: Row ↔ App type converters ─────────────────────────────────────

function rowToUserDoc(row: Record<string, unknown>): UserDocument {
    return {
        name: row.name as string,
        email: row.email as string,
        plan: row.plan as string,
        credits: row.credits as number,
        maxCredits: row.max_credits as number,
        createdAt: row.created_at as string,
        isEmailVerified: row.is_email_verified as boolean,
        couponUsed: (row.coupon_used as string) ?? null,
        stripeCustomerId: (row.stripe_customer_id as string) ?? undefined,
        selectedCurrency: (row.selected_currency as string) ?? undefined,
        language: (row.language as string) ?? undefined,
        lastCreditReset: (row.last_credit_reset as string) ?? undefined,
        avatarUrl: (row.avatar_url as string) ?? null,
    };
}

function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ─── User Document ────────────────────────────────────────────────────────────

/** Create a new user row in public.users */
export async function createUserDocument(
    uid: string,
    data: Omit<UserDocument, 'lastCreditReset'>
): Promise<void> {
    const { error } = await supabase.from('users').upsert({
        id: uid,
        name: data.name,
        email: data.email,
        plan: data.plan,
        credits: data.credits,
        max_credits: data.maxCredits,
        is_email_verified: data.isEmailVerified,
        coupon_used: data.couponUsed,
        last_credit_reset: getCurrentMonth(),
    }, { onConflict: 'id' });

    if (error) throw error;
}

/** Get user document from public.users */
export async function getUserDocument(uid: string): Promise<UserDocument | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // not found
        throw error;
    }
    return data ? rowToUserDoc(data as Record<string, unknown>) : null;
}

/** Update user document fields */
export async function updateUserDocument(
    uid: string,
    data: Partial<UserDocument>
): Promise<void> {
    const updatePayload: Record<string, unknown> = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.plan !== undefined) updatePayload.plan = data.plan;
    if (data.credits !== undefined) updatePayload.credits = data.credits;
    if (data.maxCredits !== undefined) updatePayload.max_credits = data.maxCredits;
    if (data.isEmailVerified !== undefined) updatePayload.is_email_verified = data.isEmailVerified;
    if (data.couponUsed !== undefined) updatePayload.coupon_used = data.couponUsed;
    if (data.stripeCustomerId !== undefined) updatePayload.stripe_customer_id = data.stripeCustomerId;
    if (data.selectedCurrency !== undefined) updatePayload.selected_currency = data.selectedCurrency;
    if (data.language !== undefined) updatePayload.language = data.language;
    if (data.lastCreditReset !== undefined) updatePayload.last_credit_reset = data.lastCreditReset;
    if (data.avatarUrl !== undefined) updatePayload.avatar_url = data.avatarUrl;

    const { error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', uid);

    if (error) throw error;
}

/** Subscribe to real-time user document changes */
export function onUserDocumentChange(
    uid: string,
    callback: (data: UserDocument | null) => void
): () => void {
    const channel = supabase
        .channel(`users:${uid}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'users',
                filter: `id=eq.${uid}`,
            },
            (payload) => {
                if (payload.eventType === 'DELETE') {
                    callback(null);
                } else {
                    callback(rowToUserDoc(payload.new as Record<string, unknown>));
                }
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

// ─── Avatar Upload ────────────────────────────────────────────────────────────

/**
 * Upload a profile image to Supabase Storage and save the public URL
 * to the user's profile. Returns the public URL.
 */
export async function uploadAvatar(uid: string, file: File): Promise<string> {
    // Validate file type
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
        throw new Error('Invalid file type. Only JPG, PNG, GIF and WebP are allowed.');
    }
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 2MB.');
    }

    const ext = file.name.split('.').pop() ?? 'jpg';
    const filePath = `${uid}/avatar.${ext}`;

    // Upload (upsert overwrites existing avatar)
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    // Cache busting: append timestamp so the browser instantly loads the new image instead of caching the old one
    const publicUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;

    // Save to user profile
    await updateUserDocument(uid, { avatarUrl: publicUrl });

    return publicUrl;
}

// ─── Credits ──────────────────────────────────────────────────────────────────

/** Deduct credits from user (returns false if not enough) */
export async function deductCredits(
    uid: string,
    amount: number,
    currentCredits: number,
    isUnlimited: boolean
): Promise<boolean> {
    if (isUnlimited) return true;
    if (currentCredits < amount) return false;

    const newCredits = currentCredits - amount;
    await updateUserDocument(uid, { credits: newCredits });

    await addCreditHistory(uid, {
        action: 'Analyse durchgeführt',
        change: -amount,
        balance: newCredits,
    });

    return true;
}

/** Add credits to user */
export async function addCredits(
    uid: string,
    amount: number,
    currentCredits: number,
    reason: string = 'Credit-Aufladung'
): Promise<void> {
    const newCredits = currentCredits + amount;
    await updateUserDocument(uid, { credits: newCredits });
    await addCreditHistory(uid, {
        action: reason,
        change: amount,
        balance: newCredits,
    });
}

/** Monthly credit reset check and execution */
export async function checkAndResetCredits(
    uid: string,
    plan: string,
    lastCreditReset: string
): Promise<boolean> {
    const currentMonth = getCurrentMonth();
    if (lastCreditReset === currentMonth) return false;

    const planCredits: Record<string, number> = {
        Starter: 2500,
        Pro: 5000,
        Builder: -1,
    };

    const credits = planCredits[plan] ?? 2500;
    await updateUserDocument(uid, { credits, lastCreditReset: currentMonth });

    await addCreditHistory(uid, {
        action: 'Monatliche Erneuerung',
        change: credits,
        balance: credits,
    });

    return true;
}

// ─── Credit History ───────────────────────────────────────────────────────────

async function addCreditHistory(
    uid: string,
    data: { action: string; change: number; balance: number }
): Promise<void> {
    const { error } = await supabase.from('credit_history').insert({
        user_id: uid,
        action: data.action,
        change: data.change,
        balance: data.balance,
        date: new Date().toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }),
    });
    if (error) throw error;
}

/** Get credit history for user */
export async function getCreditHistory(
    uid: string,
    limitCount: number = 50
): Promise<CreditHistoryRecord[]> {
    const { data, error } = await supabase
        .from('credit_history')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(limitCount);

    if (error) throw error;
    return (data ?? []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        action: row.action,
        change: row.change,
        balance: row.balance,
        date: row.date,
        createdAt: row.created_at,
    }));
}

// ─── Ideas ────────────────────────────────────────────────────────────────────

/** Save a new idea analysis */
export async function saveIdeaRecord(
    uid: string,
    data: Omit<IdeaRecord, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
    const { data: row, error } = await supabase.from('ideas').insert({
        user_id: uid,
        title: data.title,
        content: data.content,
        rating: data.rating,
        credits_used: data.creditsUsed,
        tags: data.tags ?? [],
        conversation_history: data.conversationHistory ?? [],
    }).select('id').single();

    if (error) throw error;
    return row.id;
}

/** Get all saved ideas for user */
export async function getIdeaHistory(
    uid: string,
    limitCount: number = 100
): Promise<IdeaRecord[]> {
    const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(limitCount);

    if (error) throw error;
    return (data ?? []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        content: row.content,
        rating: row.rating as 'good' | 'medium' | 'bad',
        creditsUsed: row.credits_used,
        createdAt: row.created_at,
        tags: row.tags ?? [],
        conversationHistory: (row.conversation_history as IdeaRecord['conversationHistory']) ?? [],
    }));
}

/** Delete an idea record */
export async function deleteIdeaRecord(uid: string, ideaId: string): Promise<void> {
    const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', ideaId)
        .eq('user_id', uid);
    if (error) throw error;
}

// ─── Admin: All Users ─────────────────────────────────────────────────────────

export interface AdminUser {
    uid: string;
    name: string;
    email: string;
    plan: string;
    credits: number;
    maxCredits: number;
    joinDate: string;
    totalSpent: number;
    isBlocked: boolean;
    subscriptionStatus: 'active' | 'cancelled' | 'overdue';
    cancelledAt: string | null;
    cancelledEffectiveDate: string | null;
    cancellationReason: string | null;
}

function rowToAdminUser(row: Record<string, unknown>): AdminUser {
    return {
        uid: row.id as string,
        name: (row.name as string) ?? '',
        email: (row.email as string) ?? '',
        plan: (row.plan as string) ?? 'Starter',
        credits: (row.credits as number) ?? 0,
        maxCredits: (row.max_credits as number) ?? 0,
        joinDate: (row.created_at as string) ?? new Date().toISOString(),
        totalSpent: (row.total_spent as number) ?? 0,
        isBlocked: (row.is_blocked as boolean) ?? false,
        subscriptionStatus: ((row.subscription_status as string) ?? 'active') as AdminUser['subscriptionStatus'],
        cancelledAt: (row.cancelled_at as string) ?? null,
        cancelledEffectiveDate: (row.cancelled_effective_date as string) ?? null,
        cancellationReason: (row.cancellation_reason as string) ?? null,
    };
}

/** Get all users for admin panel */
export async function getAllUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase.rpc('get_all_users_admin');
    if (error) throw error;
    return (data ?? []).map((row: Record<string, unknown>) => rowToAdminUser(row));
}

/** Block or unblock a user */
export async function adminSetUserBlocked(uid: string, blocked: boolean): Promise<void> {
    const { error } = await supabase.rpc('update_user_admin', {
        p_user_id: uid, p_updates: { is_blocked: blocked },
    });
    if (error) throw error;
}

/** Cancel user subscription */
export async function adminCancelSubscription(
    uid: string,
    reason: string,
    effectiveDate: string
): Promise<void> {
    const { error } = await supabase.rpc('update_user_admin', {
        p_user_id: uid,
        p_updates: {
            subscription_status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancelled_effective_date: effectiveDate,
            cancellation_reason: reason,
        },
    });
    if (error) throw error;
}

/** Reactivate user subscription */
export async function adminReactivateSubscription(uid: string): Promise<void> {
    const { error } = await supabase.rpc('update_user_admin', {
        p_user_id: uid,
        p_updates: {
            subscription_status: 'active',
            cancelled_at: null,
            cancelled_effective_date: null,
            cancellation_reason: null,
        },
    });
    if (error) throw error;
}

/** Update user plan (Admin only) */
export async function adminUpdateUserPlan(uid: string, plan: string, credits: number): Promise<void> {
    const planCredits: Record<string, number> = { Starter: 0, Pro: 5000, Builder: 999999 };
    const maxCred = planCredits[plan] ?? credits;
    const { error } = await supabase.rpc('update_user_admin', {
        p_user_id: uid,
        p_updates: { plan, credits, max_credits: maxCred },
    });
    if (error) throw error;
}

/** Add free credits to user */
export async function adminAddCredits(uid: string, credits: number): Promise<void> {
    const users = await getAllUsers();
    const current = users.find(u => u.uid === uid)?.credits ?? 0;
    const { error } = await supabase.rpc('update_user_admin', {
        p_user_id: uid,
        p_updates: { credits: current + credits },
    });
    if (error) throw error;
}

/** Get admin statistics from real Supabase data */
export async function getAdminStats(): Promise<{
    totalUsers: number;
    activeSubscriptions: number;
    planDistribution: Record<string, number>;
    totalRevenue: number;
    blockedUsers: number;
    cancelledUsers: number;
}> {
    const { data, error } = await supabase.rpc('get_admin_stats_rpc');
    if (error) throw error;
    const s = data as Record<string, unknown>;
    return {
        totalUsers: (s.total_users as number) ?? 0,
        activeSubscriptions: (s.active_subscriptions as number) ?? 0,
        planDistribution: (s.plan_distribution as Record<string, number>) ?? {},
        totalRevenue: (s.total_revenue as number) ?? 0,
        blockedUsers: 0,
        cancelledUsers: (s.cancelled_users as number) ?? 0,
    };
}

// ─── Admin: Coupons CRUD ───────────────────────────────────────────────────────

/** Get all coupons for admin */
export async function adminGetAllCoupons(): Promise<CouponDocument[]> {
    const { data, error } = await supabase.rpc('get_all_coupons_admin');
    if (error) throw error;
    return ((data ?? []) as Record<string, unknown>[]).map(row => ({
        id: row.id as string,
        code: row.code as string,
        plan: row.plan as string,
        duration: row.duration as number,
        durationUnit: row.duration_unit as 'days' | 'months',
        credits: row.credits as number,
        isActive: row.is_active as boolean,
        usedCount: (row.used_count as number) ?? 0,
        maxUses: (row.max_uses as number) ?? 0,
        category: row.category as 'registration' | 'trial',
        expiresAt: row.expires_at as string | null,
        createdAt: row.created_at as string,
    }));
}

/** Create a new coupon */
export async function adminCreateCoupon(coupon: Omit<CouponDocument, 'id' | 'createdAt' | 'usedCount'>): Promise<void> {
    const { error } = await supabase.rpc('create_coupon_admin', {
        p_code: coupon.code.toUpperCase(),
        p_plan: coupon.plan,
        p_duration: coupon.duration,
        p_duration_unit: coupon.durationUnit,
        p_credits: coupon.credits,
        p_is_active: coupon.isActive,
        p_max_uses: coupon.maxUses,
        p_category: coupon.category,
        p_expires_at: coupon.expiresAt ?? '',
    });
    if (error) throw error;
}

/** Update coupon active status */
export async function adminToggleCoupon(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase.rpc('toggle_coupon_admin', {
        p_coupon_id: id,
        p_active: isActive,
    });
    if (error) throw error;
}

/** Delete a coupon */
export async function adminDeleteCoupon(id: string): Promise<void> {
    const { error } = await supabase.rpc('delete_coupon_admin', { p_coupon_id: id });
    if (error) throw error;
}

// ─── Admin: Tips of the Day ────────────────────────────────────────────────────

/** Get all tips */
export async function adminGetTips(): Promise<unknown[]> {
    const data = await getWebsiteSettings('admin_tips_of_day');
    return Array.isArray(data) ? data : [];
}

/** Save all tips */
export async function adminSaveTips(tips: unknown[]): Promise<void> {
    await saveWebsiteSettings('admin_tips_of_day', tips);
    localStorage.setItem('admin_tips_of_day', JSON.stringify(tips));
}

// ─── Admin: Credit History ─────────────────────────────────────────────────────

/** Get recent credit history across all users (for Transaction Log) */
export async function adminGetCreditHistory(limit = 100): Promise<{
    id: string;
    userId: string;
    userEmail: string;
    action: string;
    change: number;
    balance: number;
    date: string;
}[]> {
    const { data, error } = await supabase.rpc('get_all_credit_history_admin', { p_limit: limit });
    if (error) throw error;
    return ((data ?? []) as Record<string, unknown>[]).map(row => ({
        id: row.id as string,
        userId: row.user_id as string,
        userEmail: '',
        action: row.action as string,
        change: row.change as number,
        balance: row.balance as number,
        date: row.date as string,
    }));
}

// ─── Coupons ──────────────────────────────────────────────────────────────────

/** Get coupon by code */
export async function getCoupon(code: string): Promise<CouponDocument | null> {
    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    if (!data) return null;

    return {
        id: data.id,
        code: data.code,
        plan: data.plan,
        duration: data.duration,
        durationUnit: data.duration_unit as 'days' | 'months',
        credits: data.credits,
        isActive: data.is_active,
        usedCount: data.used_count,
        maxUses: data.max_uses,
        category: data.category as 'registration' | 'trial',
        expiresAt: data.expires_at,
        createdAt: data.created_at,
    };
}

/** Mark coupon as used */
export async function useCoupon(couponId: string, usedCount: number): Promise<void> {
    const newUsedCount = usedCount + 1;

    // Get current max_uses to check if should deactivate
    const { data: coupon } = await supabase
        .from('coupons')
        .select('max_uses')
        .eq('id', couponId)
        .single();

    const updateData: Record<string, unknown> = { used_count: newUsedCount };
    if (coupon && newUsedCount >= coupon.max_uses) {
        updateData.is_active = false;
    }

    const { error } = await supabase
        .from('coupons')
        .update(updateData)
        .eq('id', couponId);

    if (error) throw error;
}

// ─── Website Settings (CMS) ───────────────────────────────────────────────────

/** Fetch a single website setting by key */
export async function getWebsiteSettings(key: string): Promise<unknown | null> {
    const { data, error } = await supabase
        .from('website_settings')
        .select('value')
        .eq('key', key)
        .single();
    if (error || !data) return null;
    return data.value;
}

/** Fetch all website settings as a key→value map */
export async function getAllWebsiteSettings(): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
        .from('website_settings')
        .select('key, value');
    if (error || !data) return {};
    return Object.fromEntries(data.map((row) => [row.key, row.value]));
}

/** Upsert a single website setting */
export async function saveWebsiteSettings(key: string, value: unknown): Promise<void> {
    const { error } = await supabase
        .from('website_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
}

export type { UserDocument, IdeaRecord, CreditHistoryRecord, CouponDocument };
