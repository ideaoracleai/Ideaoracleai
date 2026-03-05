import { useNavigate } from 'react-router-dom';

export default function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-3 cursor-pointer group">
              <div className="relative w-10 h-10 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-lg flex items-center justify-center shadow-lg shadow-[#C9A961]/20 group-hover:shadow-[#C9A961]/40 transition-all duration-300">
                <i className="ri-compass-3-line text-[#0F1419] text-xl"></i>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center">
                  <i className="ri-star-s-fill text-amber-400 text-xs drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]"></i>
                </div>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Admin Dashboard</h1>
                <p className="text-xs text-gray-400 -mt-0.5">Verwaltungszentrale</p>
              </div>
            </a>
          </div>

          {/* Admin Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">Super Admin</p>
              <p className="text-xs text-slate-400">admin@nichefinder.com</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <i className="ri-logout-box-line"></i>
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
