
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LanguageSelector from '../../../components/feature/LanguageSelector';

interface LegalSection {
  title: string;
  content: string;
}

interface LegalPageData {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
  contactEmail: string;
  contactAddress: string;
}

export default function PrivacyPage() {
  const { t } = useTranslation();
  const [customData, setCustomData] = useState<LegalPageData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('website_legal');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.privacy) setCustomData(parsed.privacy);
      } catch {
        /* fallback */
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1419]">
      {/* Header */}
      <header className="border-b border-[#2D5F4F]/30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative w-12 h-12 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-xl flex items-center justify-center shadow-lg shadow-[#C9A961]/20 group-hover:shadow-[#C9A961]/40 transition-all duration-300">
              <i className="ri-compass-3-line text-[#0F1419] text-2xl"></i>
              <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center">
                <i className="ri-star-s-fill text-amber-400 text-sm drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"></i>
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-white">
                IdeaOracle<span className="text-amber-400">.ai</span>
              </span>
              <p className="text-[10px] text-gray-400 -mt-0.5">{t('nav.slogan')}</p>
            </div>
          </a>
          <LanguageSelector />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-[#C9A961] hover:underline cursor-pointer text-sm"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Zurück zur Startseite
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">Datenschutzrichtlinie</h1>
        <p className="text-gray-400 mb-2 font-semibold">Scherbius Technology – Dubai, Vereinigte Arabische Emirate</p>
        <p className="text-gray-400 mb-10">Zuletzt aktualisiert: 15. Januar 2025</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Verantwortlicher</h2>
            <p className="text-gray-400 leading-relaxed mb-3">Verantwortlich für die Datenverarbeitung ist:</p>
            <div className="bg-[#1A1F26] rounded-xl p-6 border border-[#3D3428]/30">
              <p className="text-gray-300 font-semibold">Scherbius Technology</p>
              <p className="text-gray-400">Sitz: Dubai, Vereinigte Arabische Emirate (VAE)</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Geltungsbereich</h2>
            <p className="text-gray-400 leading-relaxed mb-3">
              Diese Datenschutzrichtlinie gilt für alle Nutzer weltweit, die Websites, Apps, Plattformen oder Dienste von Scherbius Technology nutzen.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Mit Nutzung der Dienste erklärt sich der Nutzer ausdrücklich mit dieser Datenschutzrichtlinie einverstanden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Anwendbares Datenschutzrecht</h2>
            <p className="text-gray-400 leading-relaxed mb-3">
              Die Verarbeitung personenbezogener Daten erfolgt ausschließlich nach dem Recht der Vereinigten Arabischen Emirate (VAE).
            </p>
            <p className="text-gray-400 leading-relaxed">
              Andere Datenschutzgesetze (z. B. DSGVO) finden keine Anwendung, soweit gesetzlich zulässig.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Erhobene Daten</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Scherbius Technology kann insbesondere folgende Daten erheben und verarbeiten:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>IP-Adresse</li>
              <li>Geräte-, Browser- und Systeminformationen</li>
              <li>Nutzungs- und Interaktionsdaten</li>
              <li>Standortdaten (ungefähre Lokalisierung)</li>
              <li>Registrierungs- und Kontodaten</li>
              <li>Zahlungs- und Abrechnungsinformationen</li>
              <li>freiwillig bereitgestellte Inhalte und Angaben</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Zweck der Datenverarbeitung</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Die Datenverarbeitung erfolgt insbesondere zu folgenden Zwecken:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>Bereitstellung und Betrieb der Dienste</li>
              <li>technische Sicherheit und Stabilität</li>
              <li>Analyse, Optimierung und Weiterentwicklung</li>
              <li>Marketing-, Statistik- und Geschäftszwecke</li>
              <li>Missbrauchs- und Betrugsprävention</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Datenweitergabe</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Scherbius Technology ist berechtigt, personenbezogene Daten:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>an verbundene Unternehmen weiterzugeben</li>
              <li>an externe Dienstleister und Partner zu übermitteln</li>
              <li>in andere Länder zu transferieren</li>
              <li>an Behörden oder Dritte herauszugeben, wenn dies erforderlich, zweckmäßig oder rechtlich geboten ist</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Datenspeicherung</h2>
            <p className="text-gray-400 leading-relaxed mb-3">
              Personenbezogene Daten können zeitlich unbegrenzt gespeichert werden.
            </p>
            <p className="text-gray-400 leading-relaxed mb-3">
              Dies gilt auch nach Kündigung oder Löschung eines Nutzerkontos.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Ein Anspruch auf vollständige oder sofortige Löschung besteht nicht.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Rechte der Nutzer</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Nutzer haben keinen garantierten Anspruch auf:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>Auskunft über gespeicherte Daten</li>
              <li>Berichtigung</li>
              <li>Löschung</li>
              <li>Einschränkung der Verarbeitung</li>
              <li>Datenübertragbarkeit</li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-4">
              Anfragen können nach freiem Ermessen von Scherbius Technology bearbeitet oder abgelehnt werden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Datensicherheit</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Scherbius Technology trifft angemessene technische und organisatorische Maßnahmen, übernimmt jedoch keine Garantie für absolute Sicherheit.
            </p>
            <p className="text-gray-400 leading-relaxed mb-3">Es besteht keine Haftung für:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>Datenverlust</li>
              <li>unbefugten Zugriff</li>
              <li>Cyberangriffe</li>
              <li>Sicherheitslücken</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Cookies & Tracking</h2>
            <p className="text-gray-400 leading-relaxed mb-3">
              Die Dienste können Cookies, Tracking-Technologien und ähnliche Mechanismen einsetzen, auch zu Analyse- und Marketingzwecken.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Die Nutzung der Dienste gilt als Einwilligung.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">11. Änderungen der Datenschutzrichtlinie</h2>
            <p className="text-gray-400 leading-relaxed mb-3">
              Scherbius Technology kann diese Datenschutzrichtlinie jederzeit ändern.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Die weitere Nutzung der Dienste gilt als Zustimmung zur jeweils aktuellen Version.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">12. Gerichtsstand</h2>
            <p className="text-gray-400 leading-relaxed mb-3">
              Es gilt ausschließlich das Recht der Vereinigten Arabischen Emirate.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Gerichtsstand ist Dubai, VAE.
            </p>
          </section>
        </div>

        {/* Legal Links */}
        <div className="mt-16 pt-8 border-t border-gray-700/30">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link to="/legal/imprint" className="text-gray-400 hover:text-[#C9A961] transition-colors cursor-pointer">
              Impressum
            </Link>
            <span className="text-[#C9A961] font-semibold">
              Datenschutz
            </span>
            <Link to="/legal/terms" className="text-gray-400 hover:text-[#C9A961] transition-colors cursor-pointer">
              AGB
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#3D3428]/30 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            {'\u00a9'} 2025 IdeaOracle.ai. {t('legal.allRightsReserved')}
          </p>
          <div className="flex items-center space-x-6">
            <Link to="/legal/terms" className="text-gray-400 hover:text-[#C9A961] text-sm cursor-pointer">
              {t('footer.terms')}
            </Link>
            <a
              href="https://readdy.ai/?ref=logo"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-gray-400 hover:text-[#C9A961] text-sm cursor-pointer whitespace-nowrap"
            >
              Powered by Readdy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
