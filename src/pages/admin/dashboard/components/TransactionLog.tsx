import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'upgrade' | 'downgrade';
  fromPlan?: string;
  toPlan: string;
  amount?: number;
  refundAmount?: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod?: {
    type: 'visa' | 'mastercard' | 'amex';
    last4: string;
  };
  stripeId?: string;
}

export default function TransactionLog() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'upgrade' | 'downgrade'>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | 'visa' | 'mastercard' | 'amex'>('all');

  useEffect(() => {
    // Transaktionen aus localStorage laden
    const storedTransactions = JSON.parse(localStorage.getItem('adminTransactions') || '[]');
    
    // Demo-Transaktionen mit Zahlungsmethoden hinzufügen
    if (storedTransactions.length === 0) {
      const demoTransactions: Transaction[] = [
        {
          id: 'TXN-1705847123',
          userId: '2',
          userName: 'Anna Schmidt',
          userEmail: 'pro.user@example.com',
          type: 'upgrade',
          fromPlan: 'Starter',
          toPlan: 'Pro',
          amount: 29,
          date: '2024-01-15T10:30:00Z',
          status: 'completed',
          paymentMethod: { type: 'mastercard', last4: '8888' },
          stripeId: 'pi_3OaBC1234567891'
        },
        {
          id: 'TXN-1705847456',
          userId: '3',
          userName: 'Thomas Weber',
          userEmail: 'builder@example.com',
          type: 'upgrade',
          fromPlan: 'Pro',
          toPlan: 'Builder',
          amount: 70,
          date: '2024-01-16T14:20:00Z',
          status: 'completed',
          paymentMethod: { type: 'amex', last4: '1005' },
          stripeId: 'pi_3OaBC1234567893'
        },
        {
          id: 'TXN-1705847789',
          userId: '4',
          userName: 'Lisa Müller',
          userEmail: 'startup@example.com',
          type: 'upgrade',
          fromPlan: 'Starter',
          toPlan: 'Pro',
          amount: 29,
          date: '2024-01-17T09:15:00Z',
          status: 'completed',
          paymentMethod: { type: 'visa', last4: '5555' },
          stripeId: 'pi_3OaBC1234567895'
        },
        {
          id: 'TXN-1705848001',
          userId: '5',
          userName: 'Marco Rossi',
          userEmail: 'marco.rossi@example.com',
          type: 'downgrade',
          fromPlan: 'Builder',
          toPlan: 'Pro',
          refundAmount: 35.00,
          date: '2024-01-18T11:45:00Z',
          status: 'completed',
          paymentMethod: { type: 'mastercard', last4: '7777' },
          stripeId: 'pi_3OaBC1234567899'
        },
        {
          id: 'TXN-1705848234',
          userId: '6',
          userName: 'Sophie Meier',
          userEmail: 'sophie.meier@example.com',
          type: 'downgrade',
          fromPlan: 'Pro',
          toPlan: 'Starter',
          refundAmount: 14.50,
          date: '2024-01-19T16:30:00Z',
          status: 'completed',
          paymentMethod: { type: 'visa', last4: '4242' },
          stripeId: 'pi_3OaBC1234567900'
        },
        {
          id: 'TXN-1705848567',
          userId: '7',
          userName: 'Felix Brunner',
          userEmail: 'felix.brunner@example.com',
          type: 'downgrade',
          fromPlan: 'Builder',
          toPlan: 'Starter',
          refundAmount: 49.50,
          date: '2024-01-20T08:20:00Z',
          status: 'completed',
          paymentMethod: { type: 'amex', last4: '1005' },
          stripeId: 'pi_3OaBC1234567901'
        },
        {
          id: 'TXN-1705848890',
          userId: '8',
          userName: 'Julia Keller',
          userEmail: 'julia.keller@example.com',
          type: 'upgrade',
          fromPlan: 'Starter',
          toPlan: 'Builder',
          amount: 99,
          date: '2024-01-21T13:10:00Z',
          status: 'completed',
          paymentMethod: { type: 'visa', last4: '4242' },
          stripeId: 'pi_3OaBC1234567897'
        },
        {
          id: 'TXN-1705849123',
          userId: '9',
          userName: 'David Huber',
          userEmail: 'david.huber@example.com',
          type: 'downgrade',
          fromPlan: 'Pro',
          toPlan: 'Starter',
          refundAmount: 19.33,
          date: '2024-01-22T10:00:00Z',
          status: 'completed',
          paymentMethod: { type: 'mastercard', last4: '8888' },
          stripeId: 'pi_3OaBC1234567902'
        }
      ];
      setTransactions(demoTransactions);
    } else {
      setTransactions(storedTransactions);
    }
  }, []);

  const filteredTransactions = transactions.filter(t => {
    const typeMatch = filter === 'all' || t.type === filter;
    const paymentMatch = paymentMethodFilter === 'all' || t.paymentMethod?.type === paymentMethodFilter;
    return typeMatch && paymentMatch;
  });

  const getTypeColor = (type: string) => {
    return type === 'upgrade'
      ? 'bg-green-500/10 text-green-400 border-green-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  const getTypeIcon = (type: string) => {
    return type === 'upgrade' ? 'ri-arrow-up-line' : 'ri-arrow-down-line';
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return 'ri-bank-card-line';
      case 'mastercard':
        return 'ri-mastercard-line';
      case 'amex':
        return 'ri-bank-card-2-line';
      default:
        return 'ri-bank-card-line';
    }
  };

  const getCardColor = (type: string) => {
    switch (type) {
      case 'visa':
        return 'text-blue-400';
      case 'mastercard':
        return 'text-orange-400';
      case 'amex':
        return 'text-emerald-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div>
      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'bg-red-500 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
          }`}
        >
          Alle Transaktionen
        </button>
        <button
          onClick={() => setFilter('upgrade')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            filter === 'upgrade'
              ? 'bg-red-500 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
          }`}
        >
          <i className="ri-arrow-up-line mr-2"></i>
          Upgrades
        </button>
        <button
          onClick={() => setFilter('downgrade')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            filter === 'downgrade'
              ? 'bg-red-500 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
          }`}
        >
          <i className="ri-arrow-down-line mr-2"></i>
          Downgrades
        </button>

        <div className="w-px bg-slate-700 mx-2"></div>

        <button
          onClick={() => setPaymentMethodFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            paymentMethodFilter === 'all'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
          }`}
        >
          Alle Karten
        </button>
        <button
          onClick={() => setPaymentMethodFilter('visa')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            paymentMethodFilter === 'visa'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
          }`}
        >
          <i className="ri-bank-card-line mr-2 text-blue-400"></i>
          Visa
        </button>
        <button
          onClick={() => setPaymentMethodFilter('mastercard')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            paymentMethodFilter === 'mastercard'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
          }`}
        >
          <i className="ri-mastercard-line mr-2 text-orange-400"></i>
          Mastercard
        </button>
        <button
          onClick={() => setPaymentMethodFilter('amex')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            paymentMethodFilter === 'amex'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
          }`}
        >
          <i className="ri-bank-card-2-line mr-2 text-emerald-400"></i>
          Amex
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <i className="ri-file-list-line text-slate-600 text-5xl mb-4"></i>
            <p className="text-slate-400">Keine Transaktionen gefunden</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Type Badge */}
                  <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${getTypeColor(transaction.type)}`}>
                    <i className={`${getTypeIcon(transaction.type)} text-xl`}></i>
                  </div>

                  {/* Transaction Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white">{transaction.userName}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(transaction.type)}`}>
                        {transaction.type === 'upgrade' ? 'Upgrade' : 'Downgrade'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{transaction.userEmail}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                      <span>
                        {transaction.fromPlan && `${transaction.fromPlan} → `}
                        {transaction.toPlan}
                      </span>
                      <span>•</span>
                      <span>{new Date(transaction.date).toLocaleString('de-CH')}</span>
                      {transaction.paymentMethod && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <i className={`${getCardIcon(transaction.paymentMethod.type)} ${getCardColor(transaction.paymentMethod.type)}`}></i>
                            <span>•••• {transaction.paymentMethod.last4}</span>
                          </div>
                        </>
                      )}
                    </div>
                    {transaction.stripeId && (
                      <div className="mt-2 flex items-center gap-2">
                        <i className="ri-shield-check-line text-slate-500 text-xs"></i>
                        <span className="text-xs text-slate-500">{transaction.stripeId}</span>
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    {transaction.type === 'upgrade' && transaction.amount && (
                      <p className="text-lg font-bold text-green-400">
                        +CHF {transaction.amount.toFixed(2)}
                      </p>
                    )}
                    {transaction.type === 'downgrade' && transaction.refundAmount && (
                      <p className="text-lg font-bold text-red-400">
                        -CHF {transaction.refundAmount.toFixed(2)}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      ID: {transaction.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total Count */}
      {filteredTransactions.length > 0 && (
        <div className="mt-4 text-sm text-slate-400">
          Gesamt: {filteredTransactions.length} Transaktionen
        </div>
      )}
    </div>
  );
}
