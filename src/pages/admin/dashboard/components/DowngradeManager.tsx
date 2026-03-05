import { useState, useEffect } from 'react';
import DowngradeModal from './DowngradeModal';

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

interface DowngradeRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  currentPlan: string;
  requestedPlan: string;
  reason: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface MonthlyStats {
  month: string;
  total: number;
  approved: number;
  rejected: number;
  pending: number;
}

interface DowngradeRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: RuleCondition[];
  action: {
    fromPlan: string;
    toPlan: string;
    notifyUser: boolean;
    gracePeriodDays: number;
  };
  createdAt: string;
  triggeredCount: number;
}

interface RuleCondition {
  type: 'inactivity' | 'credit_usage' | 'login_frequency' | 'feature_usage' | 'support_tickets';
  operator: 'less_than' | 'greater_than' | 'equals' | 'between';
  value: number;
  value2?: number;
  unit?: string;
}

interface RefundRecord {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  fromPlan: string;
  toPlan: string;
  amount: number;
  calculationType: 'prorata' | 'full' | 'none';
  daysRemaining: number;
  totalDays: number;
  date: string;
  status: 'completed' | 'pending';
}

// Paket-Preise für Berechnung
const PLAN_PRICES: Record<string, number> = {
  Free: 0,
  Starter: 0,
  Pro: 29,
  Builder: 99
};

export default function DowngradeManager() {
  const [requests, setRequests] = useState<DowngradeRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [autoApprove, setAutoApprove] = useState(false);
  const [refundPolicy, setRefundPolicy] = useState<'prorata' | 'full' | 'none'>('prorata');
  const [activeSection, setActiveSection] = useState<'requests' | 'stats' | 'reports' | 'rules'>('requests');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  // Rules State
  const [rules, setRules] = useState<DowngradeRule[]>([]);
  const [editingRule, setEditingRule] = useState<DowngradeRule | null>(null);
  const [showRuleEditor, setShowRuleEditor] = useState(false);

  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [totalRefundAmount, setTotalRefundAmount] = useState(0);
  const [pendingRefundAmount, setPendingRefundAmount] = useState(0);

  useEffect(() => {
    loadData();
    loadRefunds();
  }, []);

  const loadData = () => {
    // Lade Downgrade-Anfragen
    const savedRequests = localStorage.getItem('downgradeRequests');
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests));
    } else {
      // Demo-Daten mit mehr Einträgen für bessere Statistiken
      const demoRequests: DowngradeRequest[] = [
        {
          id: 'DR-001',
          userId: 'user-1',
          userName: 'Max Müller',
          userEmail: 'max@example.com',
          currentPlan: 'Builder',
          requestedPlan: 'Pro',
          reason: 'Zu teuer für aktuelle Nutzung',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        },
        {
          id: 'DR-002',
          userId: 'user-2',
          userName: 'Anna Schmidt',
          userEmail: 'anna@example.com',
          currentPlan: 'Pro',
          requestedPlan: 'Starter',
          reason: 'Nutze die Features nicht mehr',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        },
        {
          id: 'DR-003',
          userId: 'user-3',
          userName: 'Thomas Weber',
          userEmail: 'thomas@example.com',
          currentPlan: 'Builder',
          requestedPlan: 'Starter',
          reason: 'Projekt abgeschlossen',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'approved'
        },
        {
          id: 'DR-004',
          userId: 'user-4',
          userName: 'Lisa Braun',
          userEmail: 'lisa@example.com',
          currentPlan: 'Pro',
          requestedPlan: 'Starter',
          reason: 'Budget-Einschränkungen',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'approved'
        },
        {
          id: 'DR-005',
          userId: 'user-5',
          userName: 'Michael Koch',
          userEmail: 'michael@example.com',
          currentPlan: 'Builder',
          requestedPlan: 'Pro',
          reason: 'Weniger Features benötigt',
          date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'rejected'
        },
        {
          id: 'DR-006',
          userId: 'user-6',
          userName: 'Sarah Hoffmann',
          userEmail: 'sarah@example.com',
          currentPlan: 'Pro',
          requestedPlan: 'Starter',
          reason: 'Temporäre Pause',
          date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'approved'
        },
        {
          id: 'DR-007',
          userId: 'user-7',
          userName: 'Daniel Fischer',
          userEmail: 'daniel@example.com',
          currentPlan: 'Builder',
          requestedPlan: 'Starter',
          reason: 'Wechsel zu anderem Tool',
          date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'approved'
        },
        {
          id: 'DR-008',
          userId: 'user-8',
          userName: 'Julia Wagner',
          userEmail: 'julia@example.com',
          currentPlan: 'Pro',
          requestedPlan: 'Starter',
          reason: 'Saisonales Geschäft',
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'rejected'
        }
      ];
      setRequests(demoRequests);
      localStorage.setItem('downgradeRequests', JSON.stringify(demoRequests));
    }

    // Lade Benutzer
    const savedUsers = localStorage.getItem('adminUsers');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }

    // Lade Einstellungen
    const savedAutoApprove = localStorage.getItem('autoApproveDowngrades');
    if (savedAutoApprove) setAutoApprove(JSON.parse(savedAutoApprove));

    const savedRefundPolicy = localStorage.getItem('refundPolicy');
    if (savedRefundPolicy) setRefundPolicy(savedRefundPolicy as 'prorata' | 'full' | 'none');

    // Lade Regeln
    const savedRules = localStorage.getItem('downgradeRules');
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    } else {
      // Demo-Regeln
      const demoRules: DowngradeRule[] = [
        {
          id: 'rule-1',
          name: 'Inaktive Builder-Nutzer',
          description: 'Downgrade für Builder-Nutzer die 30+ Tage inaktiv sind',
          enabled: true,
          conditions: [
            { type: 'inactivity', operator: 'greater_than', value: 30, unit: 'days' }
          ],
          action: {
            fromPlan: 'Builder',
            toPlan: 'Pro',
            notifyUser: true,
            gracePeriodDays: 7
          },
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          triggeredCount: 12
        },
        {
          id: 'rule-2',
          name: 'Geringe Credit-Nutzung',
          description: 'Downgrade wenn weniger als 10% der Credits genutzt werden',
          enabled: true,
          conditions: [
            { type: 'credit_usage', operator: 'less_than', value: 10, unit: 'percent' }
          ],
          action: {
            fromPlan: 'Pro',
            toPlan: 'Starter',
            notifyUser: true,
            gracePeriodDays: 14
          },
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          triggeredCount: 8
        },
        {
          id: 'rule-3',
          name: 'Seltene Logins',
          description: 'Downgrade bei weniger als 2 Logins pro Monat',
          enabled: false,
          conditions: [
            { type: 'login_frequency', operator: 'less_than', value: 2, unit: 'per_month' }
          ],
          action: {
            fromPlan: 'Builder',
            toPlan: 'Starter',
            notifyUser: true,
            gracePeriodDays: 30
          },
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          triggeredCount: 3
        }
      ];
      setRules(demoRules);
      localStorage.setItem('downgradeRules', JSON.stringify(demoRules));
    }
  };

  const loadRefunds = () => {
    const savedRefunds = localStorage.getItem('downgradeRefunds');
    if (savedRefunds) {
      const refundData = JSON.parse(savedRefunds);
      setRefunds(refundData);
      const total = refundData.reduce((sum: number, r: RefundRecord) => sum + r.amount, 0);
      setTotalRefundAmount(total);
    }
    
    const savedPending = localStorage.getItem('pendingDowngradeRefunds');
    if (savedPending) {
      const pendingData = JSON.parse(savedPending);
      const pending = pendingData.reduce((sum: number, r: RefundRecord) => sum + r.amount, 0);
      setPendingRefundAmount(pending);
    }
  };

  // Berechne Rückerstattung basierend auf Richtlinie
  const calculateRefund = (currentPlan: string, newPlan: string, policy: 'prorata' | 'full' | 'none'): { amount: number; daysRemaining: number; totalDays: number } => {
    const currentPrice = PLAN_PRICES[currentPlan] || 0;
    const newPrice = PLAN_PRICES[newPlan] || 0;
    const priceDifference = currentPrice - newPrice;
    
    if (priceDifference <= 0 || policy === 'none') {
      return { amount: 0, daysRemaining: 0, totalDays: 30 };
    }
    
    // Simuliere verbleibende Tage im Abrechnungszeitraum (Demo: zufällig 5-25 Tage)
    const daysRemaining = Math.floor(Math.random() * 20) + 5;
    const totalDays = 30;
    
    if (policy === 'full') {
      return { amount: priceDifference, daysRemaining, totalDays };
    }
    
    // Pro-rata Berechnung
    const proRataAmount = (priceDifference / totalDays) * daysRemaining;
    return { amount: Math.round(proRataAmount * 100) / 100, daysRemaining, totalDays };
  };

  const handleApprove = (request: DowngradeRequest) => {
    // Berechne Rückerstattung
    const refundCalc = calculateRefund(request.currentPlan, request.requestedPlan, refundPolicy);
    
    if (refundCalc.amount > 0) {
      // Erstelle Rückerstattungs-Eintrag
      const newRefund: RefundRecord = {
        id: `REF-${Date.now()}`,
        requestId: request.id,
        userId: request.userId,
        userName: request.userName,
        fromPlan: request.currentPlan,
        toPlan: request.requestedPlan,
        amount: refundCalc.amount,
        calculationType: refundPolicy,
        daysRemaining: refundCalc.daysRemaining,
        totalDays: refundCalc.totalDays,
        date: new Date().toISOString(),
        status: 'pending'
      };
      
      // Speichere als ausstehende Rückerstattung
      const pendingRefunds = JSON.parse(localStorage.getItem('pendingDowngradeRefunds') || '[]');
      pendingRefunds.push(newRefund);
      localStorage.setItem('pendingDowngradeRefunds', JSON.stringify(pendingRefunds));
      
      setPendingRefundAmount(prev => prev + refundCalc.amount);
    }
    
    const user = users.find(u => u.id === request.userId);
    if (user) {
      setSelectedUser(user);
    }
  };

  const handleReject = (requestId: string) => {
    const updatedRequests = requests.map(req =>
      req.id === requestId ? { ...req, status: 'rejected' as const } : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('downgradeRequests', JSON.stringify(updatedRequests));
  };

  const handleDowngradeSuccess = (updatedUser: User) => {
    // Update user in list
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));

    // Finde die zugehörige Anfrage
    const request = requests.find(req => req.userId === updatedUser.id && req.status === 'pending');
    
    // Verschiebe ausstehende Rückerstattung zu abgeschlossen
    if (request) {
      const pendingRefunds: RefundRecord[] = JSON.parse(localStorage.getItem('pendingDowngradeRefunds') || '[]');
      const completedRefunds: RefundRecord[] = JSON.parse(localStorage.getItem('downgradeRefunds') || '[]');
      
      const refundIndex = pendingRefunds.findIndex(r => r.requestId === request.id);
      if (refundIndex >= 0) {
        const refund = { ...pendingRefunds[refundIndex], status: 'completed' as const, date: new Date().toISOString() };
        pendingRefunds.splice(refundIndex, 1);
        completedRefunds.push(refund);
        
        localStorage.setItem('pendingDowngradeRefunds', JSON.stringify(pendingRefunds));
        localStorage.setItem('downgradeRefunds', JSON.stringify(completedRefunds));
        
        setRefunds(completedRefunds);
        setTotalRefundAmount(completedRefunds.reduce((sum, r) => sum + r.amount, 0));
        setPendingRefundAmount(pendingRefunds.reduce((sum, r) => sum + r.amount, 0));
      }
    }

    // Update request status
    const updatedRequests = requests.map(req =>
      req.userId === updatedUser.id && req.status === 'pending'
        ? { ...req, status: 'approved' as const }
        : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('downgradeRequests', JSON.stringify(updatedRequests));

    setSelectedUser(null);
  };

  const saveSettings = () => {
    localStorage.setItem('autoApproveDowngrades', JSON.stringify(autoApprove));
    localStorage.setItem('refundPolicy', refundPolicy);
    
    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.innerHTML = '<i class="ri-check-line mr-2"></i>Einstellungen gespeichert';
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
  };

  // Rule Functions
  const toggleRuleEnabled = (ruleId: string) => {
    const updatedRules = rules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );
    setRules(updatedRules);
    localStorage.setItem('downgradeRules', JSON.stringify(updatedRules));
  };

  const deleteRule = (ruleId: string) => {
    const updatedRules = rules.filter(rule => rule.id !== ruleId);
    setRules(updatedRules);
    localStorage.setItem('downgradeRules', JSON.stringify(updatedRules));
  };

  const createNewRule = () => {
    const newRule: DowngradeRule = {
      id: `rule-${Date.now()}`,
      name: '',
      description: '',
      enabled: false,
      conditions: [{ type: 'inactivity', operator: 'greater_than', value: 30, unit: 'days' }],
      action: {
        fromPlan: 'Builder',
        toPlan: 'Pro',
        notifyUser: true,
        gracePeriodDays: 7
      },
      createdAt: new Date().toISOString(),
      triggeredCount: 0
    };
    setEditingRule(newRule);
    setShowRuleEditor(true);
  };

  const editRule = (rule: DowngradeRule) => {
    setEditingRule({ ...rule });
    setShowRuleEditor(true);
  };

  const saveRule = () => {
    if (!editingRule || !editingRule.name) return;

    const existingIndex = rules.findIndex(r => r.id === editingRule.id);
    let updatedRules: DowngradeRule[];

    if (existingIndex >= 0) {
      updatedRules = rules.map(r => r.id === editingRule.id ? editingRule : r);
    } else {
      updatedRules = [...rules, editingRule];
    }

    setRules(updatedRules);
    localStorage.setItem('downgradeRules', JSON.stringify(updatedRules));
    setShowRuleEditor(false);
    setEditingRule(null);

    // Success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.innerHTML = '<i class="ri-check-line mr-2"></i>Regel gespeichert';
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
  };

  const addCondition = () => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      conditions: [
        ...editingRule.conditions,
        { type: 'inactivity', operator: 'greater_than', value: 30, unit: 'days' }
      ]
    });
  };

  const removeCondition = (index: number) => {
    if (!editingRule || editingRule.conditions.length <= 1) return;
    setEditingRule({
      ...editingRule,
      conditions: editingRule.conditions.filter((_, i) => i !== index)
    });
  };

  const updateCondition = (index: number, updates: Partial<RuleCondition>) => {
    if (!editingRule) return;
    const newConditions = [...editingRule.conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    setEditingRule({ ...editingRule, conditions: newConditions });
  };

  const getConditionTypeLabel = (type: string) => {
    switch (type) {
      case 'inactivity': return 'Inaktivität';
      case 'credit_usage': return 'Credit-Nutzung';
      case 'login_frequency': return 'Login-Häufigkeit';
      case 'feature_usage': return 'Feature-Nutzung';
      case 'support_tickets': return 'Support-Tickets';
      default: return type;
    }
  };

  const getConditionIcon = (type: string) => {
    switch (type) {
      case 'inactivity': return 'ri-time-line';
      case 'credit_usage': return 'ri-coin-line';
      case 'login_frequency': return 'ri-login-box-line';
      case 'feature_usage': return 'ri-apps-line';
      case 'support_tickets': return 'ri-customer-service-line';
      default: return 'ri-settings-line';
    }
  };

  const getOperatorLabel = (operator: string) => {
    switch (operator) {
      case 'less_than': return 'weniger als';
      case 'greater_than': return 'mehr als';
      case 'equals': return 'genau';
      case 'between': return 'zwischen';
      default: return operator;
    }
  };

  const getUnitLabel = (unit?: string) => {
    switch (unit) {
      case 'days': return 'Tage';
      case 'percent': return '%';
      case 'per_month': return 'pro Monat';
      case 'count': return 'Anzahl';
      default: return unit || '';
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-400 bg-amber-400/10';
      case 'approved': return 'text-green-400 bg-green-400/10';
      case 'rejected': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ausstehend';
      case 'approved': return 'Genehmigt';
      case 'rejected': return 'Abgelehnt';
      default: return status;
    }
  };

  // Statistik-Berechnungen
  const getFilteredByDateRange = () => {
    const now = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return requests.filter(r => new Date(r.date) >= cutoff);
  };

  const filteredByDate = getFilteredByDateRange();

  const approvalRate = filteredByDate.length > 0 
    ? Math.round((filteredByDate.filter(r => r.status === 'approved').length / filteredByDate.filter(r => r.status !== 'pending').length) * 100) || 0
    : 0;

  const avgProcessingTime = 2.3; // Demo-Wert in Tagen

  const getReasonStats = () => {
    const reasons: Record<string, number> = {};
    filteredByDate.forEach(r => {
      const key = r.reason.length > 30 ? r.reason.substring(0, 30) + '...' : r.reason;
      reasons[key] = (reasons[key] || 0) + 1;
    });
    return Object.entries(reasons)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const getPlanTransitions = () => {
    const transitions: Record<string, number> = {};
    filteredByDate.forEach(r => {
      const key = `${r.currentPlan} → ${r.requestedPlan}`;
      transitions[key] = (transitions[key] || 0) + 1;
    });
    return Object.entries(transitions).sort((a, b) => b[1] - a[1]);
  };

  const getMonthlyStats = (): MonthlyStats[] => {
    const months: MonthlyStats[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('de-CH', { month: 'short', year: '2-digit' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthRequests = requests.filter(r => {
        const reqDate = new Date(r.date);
        return reqDate >= monthStart && reqDate <= monthEnd;
      });
      
      months.push({
        month: monthName,
        total: monthRequests.length,
        approved: monthRequests.filter(r => r.status === 'approved').length,
        rejected: monthRequests.filter(r => r.status === 'rejected').length,
        pending: monthRequests.filter(r => r.status === 'pending').length
      });
    }
    
    return months;
  };

  const monthlyStats = getMonthlyStats();
  const maxMonthlyTotal = Math.max(...monthlyStats.map(m => m.total), 1);

  const exportReport = (format: 'csv' | 'json') => {
    const data = filteredByDate.map(r => ({
      ID: r.id,
      Benutzer: r.userName,
      Email: r.userEmail,
      'Aktuelles Paket': r.currentPlan,
      'Gewünschtes Paket': r.requestedPlan,
      Grund: r.reason,
      Datum: new Date(r.date).toLocaleDateString('de-CH'),
      Status: getStatusText(r.status)
    }));

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      const headers = Object.keys(data[0] || {}).join(';');
      const rows = data.map(row => Object.values(row).join(';')).join('\n');
      content = `${headers}\n${rows}`;
      filename = `downgrade-report-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(data, null, 2);
      filename = `downgrade-report-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    // Success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.innerHTML = `<i class="ri-download-line mr-2"></i>Report als ${format.toUpperCase()} exportiert`;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700 w-fit">
        <button
          onClick={() => setActiveSection('requests')}
          className={`px-5 py-2 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'requests' ? 'bg-[#C9A961] text-[#0F1419]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <i className="ri-list-check mr-2"></i>
          Anfragen
        </button>
        <button
          onClick={() => setActiveSection('stats')}
          className={`px-5 py-2 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'stats' ? 'bg-[#C9A961] text-[#0F1419]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <i className="ri-pie-chart-line mr-2"></i>
          Statistiken
        </button>
        <button
          onClick={() => setActiveSection('reports')}
          className={`px-5 py-2 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'reports' ? 'bg-[#C9A961] text-[#0F1419]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <i className="ri-file-chart-line mr-2"></i>
          Reports
        </button>
        <button
          onClick={() => setActiveSection('rules')}
          className={`px-5 py-2 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'rules' ? 'bg-[#C9A961] text-[#0F1419]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <i className="ri-robot-line mr-2"></i>
          Regeln
        </button>
      </div>

      {/* Header Stats - ERWEITERT mit Rückerstattungen */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-time-line text-amber-400 text-2xl"></i>
            <span className="text-2xl font-bold text-white">
              {requests.filter(r => r.status === 'pending').length}
            </span>
          </div>
          <p className="text-sm text-slate-400">Ausstehende Anfragen</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-check-line text-green-400 text-2xl"></i>
            <span className="text-2xl font-bold text-white">
              {requests.filter(r => r.status === 'approved').length}
            </span>
          </div>
          <p className="text-sm text-slate-400">Genehmigte Anfragen</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-close-line text-red-400 text-2xl"></i>
            <span className="text-2xl font-bold text-white">
              {requests.filter(r => r.status === 'rejected').length}
            </span>
          </div>
          <p className="text-sm text-slate-400">Abgelehnte Anfragen</p>
        </div>

        {/* NEUE KARTE: Rückerstattungen */}
        <div className="bg-slate-800 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-refund-2-line text-red-400 text-2xl"></i>
            <span className="text-2xl font-bold text-red-400">
              CHF {totalRefundAmount.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-slate-400">Rückerstattungen</p>
          {pendingRefundAmount > 0 && (
            <p className="text-xs text-amber-400 mt-1">
              <i className="ri-time-line mr-1"></i>
              CHF {pendingRefundAmount.toFixed(2)} ausstehend
            </p>
          )}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-robot-line text-[#C9A961] text-2xl"></i>
            <span className="text-2xl font-bold text-white">{rules.filter(r => r.enabled).length}</span>
          </div>
          <p className="text-sm text-slate-400">Aktive Regeln</p>
        </div>
      </div>

      {/* RULES SECTION */}
      {activeSection === 'rules' && (
        <div className="space-y-6">
          {/* Rules Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="ri-robot-line text-[#C9A961]"></i>
                Automatische Downgrade-Regeln
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Erstelle Regeln, die automatisch Downgrades basierend auf Nutzungsverhalten auslösen
              </p>
            </div>
            <button
              onClick={createNewRule}
              className="px-5 py-2.5 bg-[#C9A961] hover:bg-[#A08748] text-[#0F1419] rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer font-medium"
            >
              <i className="ri-add-line"></i>
              Neue Regel
            </button>
          </div>

          {/* Rules Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 flex items-center justify-center bg-[#C9A961]/10 rounded-xl">
                  <i className="ri-list-settings-line text-[#C9A961] text-xl"></i>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{rules.length}</p>
                  <p className="text-sm text-slate-400">Gesamt Regeln</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 flex items-center justify-center bg-green-500/10 rounded-xl">
                  <i className="ri-play-circle-line text-green-400 text-xl"></i>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{rules.filter(r => r.enabled).length}</p>
                  <p className="text-sm text-slate-400">Aktive Regeln</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 flex items-center justify-center bg-amber-500/10 rounded-xl">
                  <i className="ri-flashlight-line text-amber-400 text-xl"></i>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{rules.reduce((sum, r) => sum + r.triggeredCount, 0)}</p>
                  <p className="text-sm text-slate-400">Ausgelöste Aktionen</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`bg-slate-800 border rounded-xl p-6 transition-all ${
                  rule.enabled ? 'border-[#C9A961]/30' : 'border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${
                      rule.enabled ? 'bg-[#C9A961]/10' : 'bg-slate-700'
                    }`}>
                      <i className={`ri-robot-line text-xl ${rule.enabled ? 'text-[#C9A961]' : 'text-slate-500'}`}></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-white">{rule.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          rule.enabled ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'
                        }`}>
                          {rule.enabled ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{rule.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRuleEnabled(rule.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                        rule.enabled ? 'bg-[#C9A961]' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          rule.enabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Conditions */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Bedingungen (UND-Verknüpfung)</p>
                  <div className="flex flex-wrap gap-2">
                    {rule.conditions.map((condition, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-lg border border-slate-700">
                        <i className={`${getConditionIcon(condition.type)} text-[#C9A961]`}></i>
                        <span className="text-sm text-slate-300">
                          {getConditionTypeLabel(condition.type)} {getOperatorLabel(condition.operator)} {condition.value} {getUnitLabel(condition.unit)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Aktion</p>
                  <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                    <span className="px-2 py-1 bg-[#C9A961]/10 text-[#C9A961] rounded text-sm font-medium">
                      {rule.action.fromPlan}
                    </span>
                    <i className="ri-arrow-right-line text-slate-500"></i>
                    <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm font-medium">
                      {rule.action.toPlan}
                    </span>
                    <span className="text-slate-500 mx-2">|</span>
                    <span className="text-sm text-slate-400">
                      <i className="ri-notification-line mr-1"></i>
                      {rule.action.notifyUser ? 'Benachrichtigung' : 'Keine Benachrichtigung'}
                    </span>
                    <span className="text-slate-500 mx-2">|</span>
                    <span className="text-sm text-slate-400">
                      <i className="ri-time-line mr-1"></i>
                      {rule.action.gracePeriodDays} Tage Frist
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>
                      <i className="ri-calendar-line mr-1"></i>
                      Erstellt: {new Date(rule.createdAt).toLocaleDateString('de-CH')}
                    </span>
                    <span>
                      <i className="ri-flashlight-line mr-1"></i>
                      {rule.triggeredCount}x ausgelöst
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => editRule(rule)}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all flex items-center gap-1.5 text-sm whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-edit-line"></i>
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all flex items-center gap-1.5 text-sm whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-delete-bin-line"></i>
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {rules.length === 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                <i className="ri-robot-line text-slate-600 text-5xl mb-4"></i>
                <p className="text-slate-400 mb-4">Noch keine Regeln erstellt</p>
                <button
                  onClick={createNewRule}
                  className="px-5 py-2.5 bg-[#C9A961] hover:bg-[#A08748] text-[#0F1419] rounded-lg transition-all inline-flex items-center gap-2 whitespace-nowrap cursor-pointer font-medium"
                >
                  <i className="ri-add-line"></i>
                  Erste Regel erstellen
                </button>
              </div>
            )}
          </div>

          {/* Rule Editor Modal */}
          {showRuleEditor && editingRule && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                      {rules.find(r => r.id === editingRule.id) ? 'Regel bearbeiten' : 'Neue Regel erstellen'}
                    </h3>
                    <button
                      onClick={() => { setShowRuleEditor(false); setEditingRule(null); }}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <i className="ri-close-line text-xl"></i>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Regelname *</label>
                      <input
                        type="text"
                        value={editingRule.name}
                        onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                        placeholder="z.B. Inaktive Premium-Nutzer"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A961]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Beschreibung</label>
                      <textarea
                        value={editingRule.description}
                        onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                        placeholder="Beschreibe, was diese Regel macht..."
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A961] resize-none"
                      />
                    </div>
                  </div>

                  {/* Conditions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-slate-300">Bedingungen (alle müssen erfüllt sein)</label>
                      <button
                        onClick={addCondition}
                        className="text-sm text-[#C9A961] hover:text-[#A08748] flex items-center gap-1 cursor-pointer"
                      >
                        <i className="ri-add-line"></i>
                        Bedingung hinzufügen
                      </button>
                    </div>
                    <div className="space-y-3">
                      {editingRule.conditions.map((condition, index) => (
                        <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">Typ</label>
                                <select
                                  value={condition.type}
                                  onChange={(e) => updateCondition(index, { 
                                    type: e.target.value as RuleCondition['type'],
                                    unit: e.target.value === 'inactivity' ? 'days' : 
                                          e.target.value === 'credit_usage' ? 'percent' :
                                          e.target.value === 'login_frequency' ? 'per_month' : 'count'
                                  })}
                                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A961] cursor-pointer"
                                >
                                  <option value="inactivity">Inaktivität</option>
                                  <option value="credit_usage">Credit-Nutzung</option>
                                  <option value="login_frequency">Login-Häufigkeit</option>
                                  <option value="feature_usage">Feature-Nutzung</option>
                                  <option value="support_tickets">Support-Tickets</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">Operator</label>
                                <select
                                  value={condition.operator}
                                  onChange={(e) => updateCondition(index, { operator: e.target.value as RuleCondition['operator'] })}
                                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A961] cursor-pointer"
                                >
                                  <option value="less_than">Weniger als</option>
                                  <option value="greater_than">Mehr als</option>
                                  <option value="equals">Genau</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">Wert ({getUnitLabel(condition.unit)})</label>
                                <input
                                  type="number"
                                  value={condition.value}
                                  onChange={(e) => updateCondition(index, { value: parseInt(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A961]"
                                />
                              </div>
                            </div>
                            {editingRule.conditions.length > 1 && (
                              <button
                                onClick={() => removeCondition(index)}
                                className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer mt-5"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">Aktion</label>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Von Paket</label>
                          <select
                            value={editingRule.action.fromPlan}
                            onChange={(e) => setEditingRule({
                              ...editingRule,
                              action: { ...editingRule.action, fromPlan: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A961] cursor-pointer"
                          >
                            <option value="Builder">Builder</option>
                            <option value="Pro">Pro</option>
                            <option value="Starter">Starter</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Zu Paket</label>
                          <select
                            value={editingRule.action.toPlan}
                            onChange={(e) => setEditingRule({
                              ...editingRule,
                              action: { ...editingRule.action, toPlan: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A961] cursor-pointer"
                          >
                            <option value="Pro">Pro</option>
                            <option value="Starter">Starter</option>
                            <option value="Free">Free</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-white mb-1">Gnadenfrist (Tage)</label>
                        <input
                          type="number"
                          value={editingRule.action.gracePeriodDays}
                          onChange={(e) => setEditingRule({
                            ...editingRule,
                            action: { ...editingRule.action, gracePeriodDays: parseInt(e.target.value) || 0 }
                          })}
                          min={0}
                          max={90}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A961]"
                        />
                        <p className="text-xs text-slate-500 mt-1">Zeit, die der Nutzer hat, um zu reagieren bevor das Downgrade durchgeführt wird</p>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                        <div>
                          <p className="text-sm text-white">Nutzer benachrichtigen</p>
                          <p className="text-xs text-slate-500">E-Mail-Benachrichtigung vor dem Downgrade senden</p>
                        </div>
                        <button
                          onClick={() => setEditingRule({
                            ...editingRule,
                            action: { ...editingRule.action, notifyUser: !editingRule.action.notifyUser }
                          })}
                          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                            editingRule.action.notifyUser ? 'bg-[#C9A961]' : 'bg-slate-700'
                          }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              editingRule.action.notifyUser ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
                  <button
                    onClick={() => { setShowRuleEditor(false); setEditingRule(null); }}
                    className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all whitespace-nowrap cursor-pointer"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={saveRule}
                    disabled={!editingRule.name}
                    className="px-5 py-2.5 bg-[#C9A961] hover:bg-[#A08748] text-[#0F1419] rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="ri-save-line"></i>
                    Regel speichern
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STATISTIKEN SECTION - ERWEITERT */}
      {activeSection === 'stats' && (
        <div className="space-y-6">
          {/* Date Range Filter */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <i className="ri-pie-chart-line text-[#C9A961]"></i>
              Downgrade-Statistiken
            </h3>
            <div className="flex gap-2">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap cursor-pointer ${
                    dateRange === range
                      ? 'bg-[#C9A961] text-[#0F1419]'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {range === '7d' ? '7 Tage' : range === '30d' ? '30 Tage' : range === '90d' ? '90 Tage' : '1 Jahr'}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics - ERWEITERT */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 flex items-center justify-center bg-green-500/10 rounded-xl">
                  <i className="ri-percent-line text-green-400 text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Genehmigungsrate</p>
                  <p className="text-2xl font-bold text-white">{approvalRate}%</p>
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${approvalRate}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 flex items-center justify-center bg-amber-500/10 rounded-xl">
                  <i className="ri-timer-line text-amber-400 text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Ø Bearbeitungszeit</p>
                  <p className="text-2xl font-bold text-white">{avgProcessingTime} Tage</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">Durchschnittliche Zeit bis zur Entscheidung</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 flex items-center justify-center bg-[#C9A961]/10 rounded-xl">
                  <i className="ri-line-chart-line text-[#C9A961] text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Trend (vs. Vormonat)</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-2">
                    {monthlyStats.length >= 2 && monthlyStats[monthlyStats.length - 1].total > monthlyStats[monthlyStats.length - 2].total ? (
                      <>
                        <i className="ri-arrow-up-line text-red-400"></i>
                        <span className="text-red-400">+{monthlyStats[monthlyStats.length - 1].total - monthlyStats[monthlyStats.length - 2].total}</span>
                      </>
                    ) : monthlyStats.length >= 2 && monthlyStats[monthlyStats.length - 1].total < monthlyStats[monthlyStats.length - 2].total ? (
                      <>
                        <i className="ri-arrow-down-line text-green-400"></i>
                        <span className="text-green-400">{monthlyStats[monthlyStats.length - 1].total - monthlyStats[monthlyStats.length - 2].total}</span>
                      </>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500">Weniger Downgrades = besser</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <i className="ri-bar-chart-2-line text-[#C9A961]"></i>
                Monatlicher Verlauf
              </h4>
              <div className="space-y-3">
                {monthlyStats.map((stat, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{stat.month}</span>
                      <span className="text-white font-medium">{stat.total} Anfragen</span>
                    </div>
                    <div className="flex gap-1 h-6">
                      <div 
                        className="bg-green-500 rounded-l transition-all"
                        style={{ width: `${(stat.approved / maxMonthlyTotal) * 100}%` }}
                        title={`Genehmigt: ${stat.approved}`}
                      />
                      <div 
                        className="bg-red-500 transition-all"
                        style={{ width: `${(stat.rejected / maxMonthlyTotal) * 100}%` }}
                        title={`Abgelehnt: ${stat.rejected}`}
                      />
                      <div 
                        className="bg-amber-500 rounded-r transition-all"
                        style={{ width: `${(stat.pending / maxMonthlyTotal) * 100}%` }}
                        title={`Ausstehend: ${stat.pending}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-xs text-slate-400">Genehmigt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-xs text-slate-400">Abgelehnt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded"></div>
                  <span className="text-xs text-slate-400">Ausstehend</span>
                </div>
              </div>
            </div>

            {/* Plan Transitions */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <i className="ri-exchange-line text-[#C9A961]"></i>
                Paket-Übergänge
              </h4>
              <div className="space-y-3">
                {getPlanTransitions().map(([transition, count], index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-[#C9A961]/10 text-[#C9A961] rounded text-sm font-medium">
                        {transition.split(' → ')[0]}
                      </span>
                      <i className="ri-arrow-right-line text-slate-500"></i>
                      <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm font-medium">
                        {transition.split(' → ')[1]}
                      </span>
                    </div>
                    <span className="text-white font-bold">{count}</span>
                  </div>
                ))}
                {getPlanTransitions().length === 0 && (
                  <p className="text-slate-500 text-center py-4">Keine Daten verfügbar</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Reasons */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <i className="ri-question-line text-[#C9A961]"></i>
              Häufigste Downgrade-Gründe
            </h4>
            <div className="space-y-3">
              {getReasonStats().map(([reason, count], index) => {
                const percentage = Math.round((count / filteredByDate.length) * 100);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{reason}</span>
                      <span className="text-slate-400">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-[#C9A961] h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {getReasonStats().length === 0 && (
                <p className="text-slate-500 text-center py-4">Keine Daten verfügbar</p>
              )}
            </div>
          </div>

          {/* Rückerstattungs-Verlauf */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <i className="ri-refund-2-line text-red-400"></i>
              Rückerstattungs-Verlauf
            </h4>
            {refunds.length > 0 ? (
              <div className="space-y-3">
                {refunds.slice(-5).reverse().map((refund) => (
                  <div key={refund.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 rounded-lg">
                        <i className="ri-arrow-down-line text-red-400"></i>
                      </div>
                      <div>
                        <p className="text-white font-medium">{refund.userName}</p>
                        <p className="text-sm text-slate-400">
                          {refund.fromPlan} → {refund.toPlan}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-400">-CHF {refund.amount.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">
                        {refund.calculationType === 'prorata' 
                          ? `Pro-rata (${refund.daysRemaining}/${refund.totalDays} Tage)`
                          : refund.calculationType === 'full' 
                            ? 'Volle Rückerstattung'
                            : 'Keine Rückerstattung'
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="ri-refund-2-line text-slate-600 text-4xl mb-3"></i>
                <p className="text-slate-400">Noch keine Rückerstattungen</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REPORTS SECTION - ERWEITERT */}
      {activeSection === 'reports' && (
        <div className="space-y-6">
          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center bg-green-500/10 rounded-lg">
                  <i className="ri-file-excel-2-line text-green-400 text-xl"></i>
                </div>
                <div>
                  <p className="font-medium text-white">CSV Export</p>
                  <p className="text-xs text-slate-400">Für Excel, Google Sheets</p>
                </div>
              </div>
              <button
                onClick={() => exportReport('csv')}
                className="w-full px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-download-line"></i>
                Als CSV herunterladen
              </button>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center bg-amber-500/10 rounded-lg">
                  <i className="ri-braces-line text-amber-400 text-xl"></i>
                </div>
                <div>
                  <p className="font-medium text-white">JSON Export</p>
                  <p className="text-xs text-slate-400">Für Entwickler, APIs</p>
                </div>
              </div>
              <button
                onClick={() => exportReport('json')}
                className="w-full px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-download-line"></i>
                Als JSON herunterladen
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-900/50 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">
              <i className="ri-information-line mr-1"></i>
              Der Export enthält {filteredByDate.length} Einträge aus dem gewählten Zeitraum ({dateRange === '7d' ? '7 Tage' : dateRange === '30d' ? '30 Tage' : dateRange === '90d' ? '90 Tage' : '1 Jahr'}).
            </p>
            <div className="flex gap-2 flex-wrap">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 rounded text-xs transition-all whitespace-nowrap cursor-pointer ${
                    dateRange === range
                      ? 'bg-[#C9A961] text-[#0F1419]'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {range === '7d' ? '7 Tage' : range === '30d' ? '30 Tage' : range === '90d' ? '90 Tage' : '1 Jahr'}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Report - ERWEITERT */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <i className="ri-file-list-3-line text-[#C9A961]"></i>
              Zusammenfassung
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                <p className="text-3xl font-bold text-white">{filteredByDate.length}</p>
                <p className="text-sm text-slate-400">Gesamt</p>
              </div>
              <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                <p className="text-3xl font-bold text-green-400">{filteredByDate.filter(r => r.status === 'approved').length}</p>
                <p className="text-sm text-slate-400">Genehmigt</p>
              </div>
              <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                <p className="text-3xl font-bold text-red-400">{filteredByDate.filter(r => r.status === 'rejected').length}</p>
                <p className="text-sm text-slate-400">Abgelehnt</p>
              </div>
              <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                <p className="text-3xl font-bold text-amber-400">{filteredByDate.filter(r => r.status === 'pending').length}</p>
                <p className="text-sm text-slate-400">Ausstehend</p>
              </div>
              <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-3xl font-bold text-red-400">CHF {totalRefundAmount.toFixed(2)}</p>
                <p className="text-sm text-slate-400">Rückerstattungen</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">Genehmigungsrate</span>
                <span className="text-white font-bold">{approvalRate}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">Häufigster Übergang</span>
                <span className="text-white font-bold">{getPlanTransitions()[0]?.[0] || '-'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">Häufigster Grund</span>
                <span className="text-white font-bold text-right max-w-[200px] truncate">{getReasonStats()[0]?.[0] || '-'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">Ø Bearbeitungszeit</span>
                <span className="text-white font-bold">{avgProcessingTime} Tage</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                <span className="text-slate-400 flex items-center gap-2">
                  <i className="ri-refund-2-line text-red-400"></i>
                  Gesamte Rückerstattungen
                </span>
                <span className="text-red-400 font-bold">-CHF {totalRefundAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">Ausstehende Rückerstattungen</span>
                <span className="text-amber-400 font-bold">CHF {pendingRefundAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REQUESTS SECTION - ERWEITERT mit Rückerstattungs-Vorschau */}
      {activeSection === 'requests' && (
        <>
          {/* Settings - ERWEITERT mit Rückerstattungs-Info */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <i className="ri-settings-3-line text-[#C9A961]"></i>
              Downgrade-Einstellungen
            </h3>

            <div className="space-y-4">
              {/* Auto-Approve */}
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">Automatische Genehmigung</p>
                  <p className="text-sm text-slate-400">Downgrade-Anfragen automatisch genehmigen</p>
                </div>
                <button
                  onClick={() => setAutoApprove(!autoApprove)}
                  className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer ${
                    autoApprove ? 'bg-[#C9A961]' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      autoApprove ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Refund Policy */}
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <p className="font-medium text-white mb-3">Rückerstattungsrichtlinie</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="refundPolicy"
                      checked={refundPolicy === 'prorata'}
                      onChange={() => setRefundPolicy('prorata')}
                      className="w-4 h-4 text-[#C9A961] cursor-pointer"
                    />
                    <div>
                      <p className="text-white text-sm">Pro-rata Rückerstattung</p>
                      <p className="text-xs text-slate-400">Anteilige Rückerstattung basierend auf verbleibenden Tagen</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="refundPolicy"
                      checked={refundPolicy === 'full'}
                      onChange={() => setRefundPolicy('full')}
                      className="w-4 h-4 text-[#C9A961] cursor-pointer"
                    />
                    <div>
                      <p className="text-white text-sm">Volle Rückerstattung</p>
                      <p className="text-xs text-slate-400">Komplette Rückerstattung des Preisunterschieds</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="refundPolicy"
                      checked={refundPolicy === 'none'}
                      onChange={() => setRefundPolicy('none')}
                      className="w-4 h-4 text-[#C9A961] cursor-pointer"
                    />
                    <div>
                      <p className="text-white text-sm">Keine Rückerstattung</p>
                      <p className="text-xs text-slate-400">Downgrade ohne Rückerstattung</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Rückerstattungs-Vorschau */}
              <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <i className="ri-calculator-line text-[#C9A961]"></i>
                  Rückerstattungs-Rechner (Beispiel)
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 mb-1">Builder → Pro</p>
                    <p className="text-white font-bold">
                      {refundPolicy === 'none' ? 'CHF 0.00' : 
                       refundPolicy === 'full' ? 'CHF 70.00' : 
                       `~CHF ${((70 / 30) * 15).toFixed(2)}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {refundPolicy === 'prorata' && '(bei 15 Tagen Rest)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Builder → Starter</p>
                    <p className="text-white font-bold">
                      {refundPolicy === 'none' ? 'CHF 0.00' : 
                       refundPolicy === 'full' ? 'CHF 99.00' : 
                       `~CHF ${((99 / 30) * 15).toFixed(2)}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {refundPolicy === 'prorata' && '(bei 15 Tagen Rest)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Pro → Starter</p>
                    <p className="text-white font-bold">
                      {refundPolicy === 'none' ? 'CHF 0.00' : 
                       refundPolicy === 'full' ? 'CHF 29.00' : 
                       `~CHF ${((29 / 30) * 15).toFixed(2)}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {refundPolicy === 'prorata' && '(bei 15 Tagen Rest)'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={saveSettings}
                className="w-full px-6 py-3 bg-[#C9A961] hover:bg-[#A08748] text-white rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-save-line"></i>
                Einstellungen speichern
              </button>
            </div>
          </div>

          {/* Requests List */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="ri-list-check text-[#C9A961]"></i>
                  Downgrade-Anfragen
                </h3>
              </div>

              {/* Filter */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap cursor-pointer ${
                    filter === 'all'
                      ? 'bg-[#C9A961] text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Alle ({requests.length})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap cursor-pointer ${
                    filter === 'pending'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Ausstehend ({requests.filter(r => r.status === 'pending').length})
                </button>
                <button
                  onClick={() => setFilter('approved')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap cursor-pointer ${
                    filter === 'approved'
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Genehmigt ({requests.filter(r => r.status === 'approved').length})
                </button>
                <button
                  onClick={() => setFilter('rejected')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap cursor-pointer ${
                    filter === 'rejected'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Abgelehnt ({requests.filter(r => r.status === 'rejected').length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Benutzer</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Aktuell</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Gewünscht</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Rückerstattung</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Grund</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Datum</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => {
                    const refundCalc = calculateRefund(request.currentPlan, request.requestedPlan, refundPolicy);
                    return (
                      <tr key={request.id} className="border-t border-slate-700 hover:bg-slate-900/30">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-white">{request.userName}</p>
                            <p className="text-sm text-slate-400">{request.userEmail}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-[#C9A961]/10 text-[#C9A961] rounded-full text-sm font-medium">
                            {request.currentPlan}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm font-medium">
                            {request.requestedPlan}
                          </span>
                        </td>
                        <td className="p-4">
                          {request.status === 'pending' ? (
                            <div>
                              <p className={`font-bold ${refundCalc.amount > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                                {refundCalc.amount > 0 ? `-CHF ${refundCalc.amount.toFixed(2)}` : 'CHF 0.00'}
                              </p>
                              <p className="text-xs text-slate-500">
                                {refundPolicy === 'prorata' ? 'Pro-rata' : refundPolicy === 'full' ? 'Voll' : 'Keine'}
                              </p>
                            </div>
                          ) : request.status === 'approved' ? (
                            <span className="text-green-400 text-sm">Erstattet</span>
                          ) : (
                            <span className="text-slate-500 text-sm">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-300 max-w-xs truncate">{request.reason}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-400">
                            {new Date(request.date).toLocaleDateString('de-CH')}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(request)}
                                className="w-8 h-8 flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-all cursor-pointer"
                                title={`Genehmigen (Rückerstattung: CHF ${refundCalc.amount.toFixed(2)})`}
                              >
                                <i className="ri-check-line"></i>
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="w-8 h-8 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer"
                                title="Ablehnen"
                              >
                                <i className="ri-close-line"></i>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredRequests.length === 0 && (
                <div className="p-12 text-center">
                  <i className="ri-inbox-line text-slate-600 text-5xl mb-4"></i>
                  <p className="text-slate-400">Keine Anfragen gefunden</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Downgrade Modal */}
      {selectedUser && (
        <DowngradeModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={handleDowngradeSuccess}
        />
      )}
    </div>
  );
}
