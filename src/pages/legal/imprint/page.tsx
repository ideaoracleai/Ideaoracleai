
import { Link } from 'react-router-dom';

export default function ImprintPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <i className="ri-arrow-left-line mr-2"></i>
            Zurück zur Startseite
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Impressum</h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Scherbius Technology</h2>
            <p className="text-gray-700 mb-2">Dubai, Vereinigte Arabische Emirate (VAE)</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unternehmenssitz:</h2>
            <p className="text-gray-700">Dubai, Vereinigte Arabische Emirate</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Kontakt:</h2>
            <p className="text-gray-700">Kontaktinformationen werden ausschließlich nach freiem Ermessen von Scherbius Technology bereitgestellt.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vertretungsberechtigung:</h2>
            <p className="text-gray-700">Scherbius Technology wird durch seine gesetzlichen Vertreter gemäß dem Recht der Vereinigten Arabischen Emirate vertreten.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Haftung für Inhalte:</h2>
            <p className="text-gray-700">Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt.</p>
            <p className="text-gray-700">Scherbius Technology übernimmt jedoch keine Gewähr für Richtigkeit, Vollständigkeit oder Aktualität der Inhalte.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Haftung für externe Links:</h2>
            <p className="text-gray-700">Diese Website enthält ggf. Links zu externen Websites Dritter, auf deren Inhalte kein Einfluss besteht.</p>
            <p className="text-gray-700">Für diese fremden Inhalte wird keine Haftung übernommen.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Anwendbares Recht:</h2>
            <p className="text-gray-700 mb-2">Es gilt ausschließlich das Recht der Vereinigten Arabischen Emirate.</p>
            <p className="text-gray-700">Gerichtsstand ist Dubai, VAE.</p>
          </section>
        </div>

        {/* Legal Links */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-6 text-sm">
            <span className="text-gray-900 font-semibold">
              Impressum
            </span>
            <Link to="/legal/privacy" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
              Datenschutz
            </Link>
            <Link to="/legal/terms" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
              AGB
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
