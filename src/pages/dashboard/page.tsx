import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import ChatInterface from './components/ChatInterface';
import IdeaHistory from './components/IdeaHistory';
import CreditUsage from './components/CreditUsage';
import QuickActions from './components/QuickActions';
import Settings from './components/Settings';
import Subscription from './components/Subscription';
import Overview from './components/Overview';
import { useAuth } from '../../supabase';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading: authLoading } = useAuth();

  const [activeView, setActiveView] = useState<'dashboard' | 'history' | 'credits' | 'settings' | 'subscription'>('dashboard');
  const [chatView, setChatView] = useState<'overview' | 'chat' | 'history' | 'credits' | 'settings'>('overview');

  // Sidebar responsive state — lifted up so layout knows about it
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Route protection — redirect to /auth if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/auth');
    }
  }, [isLoggedIn, authLoading, navigate]);

  const handleHeaderNavigate = (section: string) => {
    if (section === 'settings') setActiveView('settings');
    else if (section === 'credits') setActiveView('credits');
    else if (section === 'history') setActiveView('history');
    else setActiveView('dashboard');
  };

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-[#C9A961] text-4xl"></i>
          <p className="text-gray-400 mt-4 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] flex overflow-hidden">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onNavigate={handleHeaderNavigate}
          onMobileMenuToggle={() => setMobileMenuOpen(prev => !prev)}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {activeView === 'dashboard' && (
            <>
              <StatsCards />
              <QuickActions onViewChange={setChatView} />
              <ChatInterface />
              <Overview />
            </>
          )}

          {activeView === 'history' && <IdeaHistory />}
          {activeView === 'credits' && <CreditUsage fullView />}
          {activeView === 'settings' && (
            <Settings
              onBack={() => setActiveView('dashboard')}
              onNavigateSubscription={() => setActiveView('subscription')}
            />
          )}
          {activeView === 'subscription' && (
            <Subscription
              onBack={() => setActiveView('dashboard')}
              onNavigateSettings={() => setActiveView('settings')}
            />
          )}
        </main>
      </div>
    </div>
  );

  // suppress unused warning
  void chatView;
}
