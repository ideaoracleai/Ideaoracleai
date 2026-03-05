import { useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  credits: number;
  joinDate: string;
  lastActive: string;
  totalSpent: number;
}

interface DowngradeModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (updatedUser: User) => void;
}

const PLANS = [
  { name: 'Starter', credits: 2500, price: 0 },
  { name: 'Pro', credits: 10000, price: 29 },
  { name: 'Builder', credits: 50000, price: 99 }
];

export default function DowngradeModal({ user, onClose, onSuccess }: DowngradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const currentPlanIndex = PLANS.findIndex(p => p.name === user.plan);
  const availablePlans = PLANS.slice(0, currentPlanIndex);

  const calculateRefund = (newPlan: string) => {
    const currentPlan = PLANS.find(p => p.name === user.plan);
    const targetPlan = PLANS.find(p => p.name === newPlan);
    
    if (!currentPlan || !targetPlan) return 0;

    // Pro-rata Rückerstattung berechnen (vereinfacht: 30 Tage Zyklus)
    const daysInMonth = 30;
    const daysSinceUpgrade = 15; // Demo: 15 Tage seit letztem Upgrade
    const remainingDays = daysInMonth - daysSinceUpgrade;
    
    const priceDifference = currentPlan.price - targetPlan.price;
    const proRataRefund = (priceDifference / daysInMonth) * remainingDays;
    
    return Math.max(0, proRataRefund);
  };

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName);
    const refund = calculateRefund(planName);
    setRefundAmount(refund);
  };

  const handleDowngrade = () => {
    setLoading(true);

    setTimeout(() => {
      const newPlan = PLANS.find(p => p.name === selectedPlan);
      if (!newPlan) return;

      const updatedUser: User = {
        ...user,
        plan: newPlan.name,
        credits: newPlan.credits,
        totalSpent: user.totalSpent - refundAmount
      };

      // Transaktion speichern
      const transactions = JSON.parse(localStorage.getItem('adminTransactions') || '[]');
      transactions.push({
        id: `TXN-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        type: 'downgrade',
        fromPlan: user.plan,
        toPlan: newPlan.name,
        refundAmount: refundAmount,
        date: new Date().toISOString(),
        status: 'completed'
      });
      localStorage.setItem('adminTransactions', JSON.stringify(transactions));

      setLoading(false);
      setShowConfirmation(true);

      setTimeout(() => {
        onSuccess(updatedUser);
      }, 2000);
    }, 1500);
  };

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-green-400 text-3xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Downgrade erfolgreich!</h3>
          <p className="text-slate-400 mb-4">
            Der Benutzer wurde erfolgreich herabgestuft und die Rückerstattung wurde verarbeitet.
          </p>
          <div className="flex items-center justify-center gap-2 text-green-400">
            <i className="ri-loader-4-line animate-spin"></i>
            <span className="text-sm">Wird geschlossen...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Benutzer herabstufen</h2>
            <p className="text-slate-400 text-sm mt-1">
              {user.name} ({user.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-slate-700 rounded-lg transition-colors"
          >
            <i className="ri-close-line text-slate-400 text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Plan Info */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
            <p className="text-sm text-slate-400 mb-2">Aktuelles Paket</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-white">{user.plan}</p>
                <p className="text-sm text-slate-400">{user.credits.toLocaleString('de-CH')} Credits</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Ausgaben</p>
                <p className="text-lg font-bold text-white">CHF {user.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Available Plans */}
          <div>
            <p className="text-sm font-medium text-slate-300 mb-3">Verfügbare Pakete für Downgrade</p>
            <div className="space-y-3">
              {availablePlans.map((plan) => (
                <button
                  key={plan.name}
                  onClick={() => handlePlanSelect(plan.name)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPlan === plan.name
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{plan.name}</p>
                      <p className="text-sm text-slate-400">{plan.credits.toLocaleString('de-CH')} Credits</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">CHF {plan.price}</p>
                      <p className="text-xs text-slate-400">pro Monat</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Refund Calculation */}
          {selectedPlan && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <i className="ri-information-line text-blue-400 text-xl mt-0.5"></i>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-400 mb-2">Rückerstattungsberechnung</p>
                  <div className="space-y-1 text-sm text-slate-300">
                    <div className="flex justify-between">
                      <span>Aktuelles Paket:</span>
                      <span className="font-medium">{user.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Neues Paket:</span>
                      <span className="font-medium">{selectedPlan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verbleibende Tage:</span>
                      <span className="font-medium">15 von 30 Tagen</span>
                    </div>
                    <div className="border-t border-blue-500/20 pt-2 mt-2 flex justify-between">
                      <span className="font-medium">Pro-rata Rückerstattung:</span>
                      <span className="font-bold text-blue-400">CHF {refundAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <i className="ri-error-warning-line text-red-400 text-xl mt-0.5"></i>
              <div>
                <p className="text-sm font-medium text-red-400 mb-1">Wichtiger Hinweis</p>
                <p className="text-sm text-slate-300">
                  Der Downgrade wird sofort durchgeführt. Der Benutzer verliert Zugriff auf Premium-Features und überschüssige Credits werden entfernt.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all whitespace-nowrap"
          >
            Abbrechen
          </button>
          <button
            onClick={handleDowngrade}
            disabled={!selectedPlan || loading}
            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                <span>Wird verarbeitet...</span>
              </>
            ) : (
              <>
                <i className="ri-arrow-down-line"></i>
                <span>Downgrade durchführen</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
