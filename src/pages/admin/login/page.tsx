import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Demo Admin-Credentials
    const ADMIN_EMAIL = 'admin@nichefinder.com';
    const ADMIN_PASSWORD = 'admin123';

    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Admin-Session speichern
        localStorage.setItem('adminAuth', JSON.stringify({
          email: ADMIN_EMAIL,
          role: 'super_admin',
          loginTime: new Date().toISOString()
        }));
        
        // Erfolgreiche Anmeldung
        setLoading(false);
        navigate('/admin/dashboard');
      } else {
        setError('Ungültige Admin-Zugangsdaten. Bitte überprüfe E-Mail und Passwort.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-3 cursor-pointer group mb-8">
          <div className="relative w-12 h-12 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-xl flex items-center justify-center shadow-lg shadow-[#C9A961]/20 group-hover:shadow-[#C9A961]/40 transition-all duration-300">
            <i className="ri-compass-3-line text-[#0F1419] text-2xl"></i>
            <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center">
              <i className="ri-star-s-fill text-amber-400 text-sm drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"></i>
            </div>
          </div>
          <div>
            <span className="text-xl font-bold text-white">IdeaOracle<span className="text-amber-400">.ai</span></span>
            <p className="text-[10px] text-gray-400 -mt-0.5">Admin Login</p>
          </div>
        </a>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Admin E-Mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="ri-admin-line text-slate-400"></i>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="admin@nichefinder.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Admin Passwort
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="ri-lock-password-line text-slate-400"></i>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-shake">
                <i className="ri-error-warning-line text-red-400"></i>
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            {/* Demo Info */}
            <div className="flex items-start gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <i className="ri-information-line text-emerald-400 mt-0.5 flex-shrink-0"></i>
              <div className="text-sm text-emerald-400">
                <p className="font-semibold mb-2">✅ Demo-Zugangsdaten:</p>
                <div className="space-y-1 font-mono text-xs">
                  <p><span className="text-emerald-300">E-Mail:</span> admin@nichefinder.com</p>
                  <p><span className="text-emerald-300">Passwort:</span> admin123</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-lg hover:shadow-red-500/25"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  <span>Anmeldung läuft...</span>
                </>
              ) : (
                <>
                  <i className="ri-login-box-line"></i>
                  <span>Als Admin anmelden</span>
                </>
              )}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-400 hover:text-white transition-colors whitespace-nowrap inline-flex items-center gap-1"
            >
              <i className="ri-arrow-left-line"></i>
              Zurück zur Startseite
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <i className="ri-shield-check-line mr-1"></i>
          Alle Admin-Aktivitäten werden protokolliert
        </div>
      </div>
    </div>
  );
}
