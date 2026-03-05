import { useState, useEffect, useCallback } from 'react';

export interface SubscriptionData {
  plan: string;
  credits: number;
  maxCredits: number;
  nextReset: string;
  isUnlimited: boolean;
  basePriceCHF: number;
}

// Plan-Konfiguration
const PLAN_CONFIG: Record<string, { credits: number; price: number }> = {
  'Starter': { credits: 2500, price: 39.90 },
  'Pro': { credits: 5000, price: 59.90 },
  'Builder': { credits: -1, price: 199 }
};

// Nächstes Erneuerungsdatum berechnen
function getNextResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
}

// Zentrale Subscription-Daten laden
function loadSubscriptionData(): SubscriptionData {
  const storedUser = localStorage.getItem('nichecheck_user');
  
  if (storedUser) {
    const parsed = JSON.parse(storedUser);
    const plan = parsed.plan || 'Starter';
    const planConfig = PLAN_CONFIG[plan] || PLAN_CONFIG['Starter'];
    
    return {
      plan,
      credits: parsed.credits ?? (planConfig.credits > 0 ? Math.floor(planConfig.credits / 2) : 999999),
      maxCredits: planConfig.credits,
      nextReset: getNextResetDate(),
      isUnlimited: planConfig.credits === -1,
      basePriceCHF: planConfig.price
    };
  }
  
  // Fallback: Starter Plan
  return {
    plan: 'Starter',
    credits: 1250,
    maxCredits: 2500,
    nextReset: getNextResetDate(),
    isUnlimited: false,
    basePriceCHF: 39.90
  };
}

// Zentrale Subscription-Daten speichern
function saveSubscriptionData(data: Partial<SubscriptionData>) {
  const storedUser = localStorage.getItem('nichecheck_user');
  const userData = storedUser ? JSON.parse(storedUser) : {};
  
  if (data.plan !== undefined) userData.plan = data.plan;
  if (data.credits !== undefined) userData.credits = data.credits;
  
  localStorage.setItem('nichecheck_user', JSON.stringify(userData));
  
  // Event für andere Komponenten
  window.dispatchEvent(new CustomEvent('subscriptionChanged', { detail: data }));
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData>(loadSubscriptionData);

  // Auf Änderungen von anderen Komponenten reagieren
  useEffect(() => {
    const handleStorageChange = () => {
      setSubscription(loadSubscriptionData());
    };

    const handleSubscriptionChange = () => {
      setSubscription(loadSubscriptionData());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('subscriptionChanged', handleSubscriptionChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('subscriptionChanged', handleSubscriptionChange);
    };
  }, []);

  // Credits abziehen
  const deductCredits = useCallback((amount: number): boolean => {
    if (subscription.isUnlimited) return true;
    
    if (subscription.credits < amount) {
      return false;
    }
    
    const newCredits = subscription.credits - amount;
    saveSubscriptionData({ credits: newCredits });
    setSubscription(prev => ({ ...prev, credits: newCredits }));
    
    // Credit-History aktualisieren
    const creditHistory = JSON.parse(localStorage.getItem('credit_history') || '[]');
    creditHistory.unshift({
      action: 'Credit-Verbrauch',
      change: -amount,
      date: new Date().toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      balance: newCredits
    });
    localStorage.setItem('credit_history', JSON.stringify(creditHistory.slice(0, 100)));
    
    return true;
  }, [subscription.credits, subscription.isUnlimited]);

  // Credits hinzufügen
  const addCredits = useCallback((amount: number, reason: string = 'Credit-Aufladung') => {
    if (subscription.isUnlimited) return;
    
    const newCredits = subscription.credits + amount;
    saveSubscriptionData({ credits: newCredits });
    setSubscription(prev => ({ ...prev, credits: newCredits }));
    
    // Credit-History aktualisieren
    const creditHistory = JSON.parse(localStorage.getItem('credit_history') || '[]');
    creditHistory.unshift({
      action: reason,
      change: amount,
      date: new Date().toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      balance: newCredits
    });
    localStorage.setItem('credit_history', JSON.stringify(creditHistory.slice(0, 100)));
  }, [subscription.credits, subscription.isUnlimited]);

  // Plan ändern
  const changePlan = useCallback((newPlan: string) => {
    const planConfig = PLAN_CONFIG[newPlan];
    if (!planConfig) return;
    
    const newCredits = planConfig.credits > 0 ? planConfig.credits : 999999;
    
    saveSubscriptionData({ 
      plan: newPlan, 
      credits: newCredits 
    });
    
    setSubscription({
      plan: newPlan,
      credits: newCredits,
      maxCredits: planConfig.credits,
      nextReset: getNextResetDate(),
      isUnlimited: planConfig.credits === -1,
      basePriceCHF: planConfig.price
    });
  }, []);

  // Credits erneuern (monatlich)
  const renewCredits = useCallback(() => {
    const planConfig = PLAN_CONFIG[subscription.plan];
    if (!planConfig) return;
    
    const newCredits = planConfig.credits > 0 ? planConfig.credits : 999999;
    
    saveSubscriptionData({ credits: newCredits });
    setSubscription(prev => ({ ...prev, credits: newCredits }));
    
    // Erneuerungs-Log
    const renewalLog = JSON.parse(localStorage.getItem('credit_renewal_log') || '[]');
    renewalLog.unshift({
      date: new Date().toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      plan: subscription.plan,
      credits: newCredits,
      type: 'monthly_renewal'
    });
    localStorage.setItem('credit_renewal_log', JSON.stringify(renewalLog.slice(0, 50)));
  }, [subscription.plan]);

  // Verbrauch in Prozent
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
    hasEnoughCredits: (amount: number) => subscription.isUnlimited || subscription.credits >= amount
  };
}
