import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../supabase';
import { deductUserCredits, updateUserDocument } from '../supabase/database';

export interface SubscriptionData {
  plan: string;
  credits: number;
  maxCredits: number;
  nextReset: string;
  isUnlimited: boolean;
  basePriceCHF: number;
}

const PLAN_CONFIG: Record<string, { credits: number; price: number }> = {
  'Starter': { credits: 2500, price: 39.90 },
  'Pro': { credits: 5000, price: 59.90 },
  'Builder': { credits: -1, price: 199 }
};

function getNextResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
}

function buildSubscription(plan: string, credits: number): SubscriptionData {
  const cfg = PLAN_CONFIG[plan] ?? PLAN_CONFIG['Starter'];
  return {
    plan,
    credits: cfg.credits === -1 ? 999999 : credits,
    maxCredits: cfg.credits,
    nextReset: getNextResetDate(),
    isUnlimited: cfg.credits === -1,
    basePriceCHF: cfg.price,
  };
}

export function useSubscription() {
  const { firebaseUser, userDoc } = useAuth();

  const [subscription, setSubscription] = useState<SubscriptionData>(() =>
    buildSubscription('Starter', 1250)
  );

  // Sync from Supabase userDoc whenever it changes
  useEffect(() => {
    if (userDoc) {
      setSubscription(buildSubscription(userDoc.plan, userDoc.credits));
    }
  }, [userDoc]);

  // Dispatch event so other components can react
  const broadcastChange = (data: Partial<SubscriptionData>) => {
    window.dispatchEvent(new CustomEvent('subscriptionChanged', { detail: data }));
  };

  // Deduct credits: update local state immediately, sync to Supabase in background
  const deductCredits = useCallback((amount: number): boolean => {
    if (subscription.isUnlimited) return true;
    if (subscription.credits < amount) return false;

    const newCredits = subscription.credits - amount;
    setSubscription(prev => ({ ...prev, credits: newCredits }));
    broadcastChange({ credits: newCredits });

    // Sync to Supabase (fire-and-forget)
    if (firebaseUser?.id) {
      deductUserCredits(firebaseUser.id, amount).catch(() => {});
    }

    return true;
  }, [subscription.credits, subscription.isUnlimited, firebaseUser?.id]);

  // Add credits: update local state immediately, sync to Supabase in background
  const addCredits = useCallback((amount: number) => {
    if (subscription.isUnlimited) return;

    const newCredits = subscription.credits + amount;
    setSubscription(prev => ({ ...prev, credits: newCredits }));
    broadcastChange({ credits: newCredits });

    if (firebaseUser?.id) {
      updateUserDocument(firebaseUser.id, { credits: newCredits }).catch(() => {});
    }
  }, [subscription.credits, subscription.isUnlimited, firebaseUser?.id]);

  // Change plan: update local state, sync to Supabase in background
  const changePlan = useCallback((newPlan: string) => {
    const cfg = PLAN_CONFIG[newPlan];
    if (!cfg) return;

    const newCredits = cfg.credits > 0 ? cfg.credits : 999999;
    setSubscription(buildSubscription(newPlan, newCredits));
    broadcastChange({ plan: newPlan, credits: newCredits });

    if (firebaseUser?.id) {
      updateUserDocument(firebaseUser.id, {
        plan: newPlan,
        credits: cfg.credits > 0 ? cfg.credits : 999999,
        maxCredits: cfg.credits > 0 ? cfg.credits : 999999,
      }).catch(() => {});
    }
  }, [firebaseUser?.id]);

  // Renew credits (monthly reset)
  const renewCredits = useCallback(() => {
    const cfg = PLAN_CONFIG[subscription.plan];
    if (!cfg) return;

    const newCredits = cfg.credits > 0 ? cfg.credits : 999999;
    setSubscription(prev => ({ ...prev, credits: newCredits }));
    broadcastChange({ credits: newCredits });

    if (firebaseUser?.id) {
      updateUserDocument(firebaseUser.id, {
        credits: cfg.credits > 0 ? cfg.credits : 999999,
      }).catch(() => {});
    }
  }, [subscription.plan, firebaseUser?.id]);

  const usagePercentage = subscription.maxCredits > 0
    ? ((subscription.maxCredits - subscription.credits) / subscription.maxCredits) * 100
    : 0;

  return {
    subscription,
    deductCredits,
    addCredits,
    changePlan,
    renewCredits,
    usagePercentage,
    hasEnoughCredits: (amount: number) => subscription.isUnlimited || subscription.credits >= amount,
  };
}
