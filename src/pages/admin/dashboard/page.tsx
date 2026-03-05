import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './components/AdminHeader';
import UserList from './components/UserList';
import TransactionLog from './components/TransactionLog';
import AdminStats from './components/AdminStats';
import CouponManager from './components/CouponManager';
import WebsiteEditor from './components/WebsiteEditor';
import AISettingsEditor from './components/AISettingsEditor';
import TipOfTheDay from './components/TipOfTheDay';
import DowngradeManager from './components/DowngradeManager';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'coupons' | 'stats' | 'website' | 'ai' | 'tips' | 'downgrades'>('users');

  useEffect(() => {
    try {
      const adminAuth = localStorage.getItem('adminAuth');
      if (!adminAuth) {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Failed to read admin authentication token:', error);
      // Fallback navigation in case of unexpected errors
      navigate('/admin');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-900">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-800/50 p-1 rounded-lg border border-slate-700 w-fit flex-wrap">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'users' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="ri-user-line mr-2"></i>
            Benutzerverwaltung
          </button>

          <button
            onClick={() => setActiveTab('downgrades')}
            className={`px-6 py-2.5 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'downgrades' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="ri-arrow-down-line mr-2"></i>
            Downgrades
          </button>

          <button
            onClick={() => setActiveTab('tips')}
            className={`px-6 py-2.5 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'tips' ? 'bg-[#C9A961] text-[#0F1419]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="ri-lightbulb-flash-line mr-2"></i>
            Tipp des Tages
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-6 py-2.5 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'coupons' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="ri-coupon-3-line mr-2"></i>
            Gutschein-Codes
          </button>

          <button
            onClick={() => setActiveTab('website')}
            className={`px-6 py-2.5 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'website' ? 'bg-[#C9A961] text-[#0F1419]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="ri-global-line mr-2"></i>
            Website-Editor
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-2.5 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ai' ? 'bg-[#C9A961] text-[#0F1419]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="ri-robot-2-line mr-2"></i>
            KI-Einstellungen
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-2.5 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'transactions' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="ri-exchange-line mr-2"></i>
            Transaktionslog
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-2.5 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'stats' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="ri-bar-chart-line mr-2"></i>
            Statistiken
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'users' && <UserList />}
          {activeTab === 'downgrades' && <DowngradeManager />}
          {activeTab === 'tips' && <TipOfTheDay />}
          {activeTab === 'coupons' && <CouponManager />}
          {activeTab === 'website' && <WebsiteEditor />}
          {activeTab === 'ai' && (
            <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-700 p-6">
              <AISettingsEditor />
            </div>
          )}
          {activeTab === 'transactions' && <TransactionLog />}
          {activeTab === 'stats' && <AdminStats />}
        </div>
      </div>
    </div>
  );
}
