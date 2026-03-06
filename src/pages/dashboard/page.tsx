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

  const [activeView, setActiveView] = useState<'dashboard' | 'chat' | 'history' | 'credits' | 'settings' | 'subscription'>('dashboard');

  // Sidebar responsive state — lifted up so layout knows about it
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Route protection — redirect to /auth if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/auth');
    }
  }, [isLoggedIn, authLoading, navigate]);

  // Check URL params for view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'chat') setActiveView('chat');
    else if (view === 'credits') setActiveView('credits');
    else if (view === 'history') setActiveView('history');
    else if (view === 'settings') setActiveView('settings');
    else if (view === 'subscription') setActiveView('subscription');
  }, []);

  const handleHeaderNavigate = (section: string) => {
    if (section === 'settings') setActiveView('settings');
    else if (section === 'credits') setActiveView('credits');
    else if (section === 'history') setActiveView('history');
    else if (section === 'chat') setActiveView('chat');
    else setActiveView('dashboard');
  };

  const handleQuickAction = (action: string) => {
    if (action === 'chat') {
      setActiveView('chat');
    }
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
    <div className="h-screen bg-[#0F1419] flex overflow-hidden">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Only show header when NOT in chat view — chat has its own header */}
        {activeView !== 'chat' && (
          <Header
            onNavigate={handleHeaderNavigate}
            onMobileMenuToggle={() => setMobileMenuOpen(prev => !prev)}
          />
        )}

        {activeView === 'chat' ? (
          /* Chat takes full height with no padding */
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              onBack={() => setActiveView('dashboard')}
            />
          </div>
        ) : (
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {activeView === 'dashboard' && (
              <>
                <StatsCards />
                <QuickActions onNavigateChat={() => setActiveView('chat')} />
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
        )}
      </div>
    </div>
  );
}
