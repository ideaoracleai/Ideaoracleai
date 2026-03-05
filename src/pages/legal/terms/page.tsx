
import { Link } from 'react-router-dom';

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-12">Scherbius Technology – Dubai, Vereinigte Arabische Emirate</p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Anbieter</h2>
            <p className="text-gray-700 mb-4">Anbieter dieser Plattform ist:</p>
            <p className="text-gray-700 mb-4"><strong>Scherbius Technology</strong><br />Sitz: Dubai, Vereinigte Arabische Emirate (VAE)</p>
            <p className="text-gray-700">Weitere Kontaktdaten werden ausschließlich nach freiem Ermessen von Scherbius Technology veröffentlicht.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Geltungsbereich</h2>
            <p className="text-gray-700 mb-4">Diese AGB gelten für alle Nutzer weltweit, unabhängig von Wohnsitz oder Staatsangehörigkeit, die Dienste von Scherbius Technology nutzen.</p>
            <p className="text-gray-700">Mit Zugriff oder Nutzung der Plattform erklärt sich der Nutzer vollumfänglich und verbindlich mit diesen AGB einverstanden.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Leistungen</h2>
            <p className="text-gray-700 mb-4">Scherbius Technology stellt digitale Dienste, Inhalte und Funktionen ohne Zusicherung bestimmter Eigenschaften bereit.</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Kein Anspruch auf Verfügbarkeit</li>
              <li>Kein Anspruch auf Fehlerfreiheit</li>
              <li>Kein Anspruch auf dauerhafte Bereitstellung</li>
            </ul>
            <p className="text-gray-700">Leistungen können jederzeit geändert, eingeschränkt oder eingestellt werden.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Preise & Zahlungen</h2>
            <p className="text-gray-700 mb-4">Scherbius Technology ist jederzeit berechtigt, Preise zu ändern oder zu erhöhen.</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Preisänderungen können ohne Vorankündigung erfolgen.</li>
              <li>Bereits bezahlte Beträge sind nicht rückerstattungsfähig, außer nach freiem Ermessen von Scherbius Technology.</li>
              <li>Neue kostenpflichtige Leistungen können jederzeit eingeführt werden.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Nutzerkonten</h2>
            <p className="text-gray-700 mb-4">Scherbius Technology behält sich ausdrücklich das Recht vor, jederzeit und ohne Angabe von Gründen:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Nutzerkonten zu sperren</li>
              <li>Nutzerkonten zu löschen</li>
              <li>Inhalte zu entfernen</li>
              <li>Zugriffe einzuschränken</li>
            </ul>
            <p className="text-gray-700">Ein Anspruch auf Wiederherstellung oder Datenexport besteht nicht.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Pflichten der Nutzer</h2>
            <p className="text-gray-700 mb-4">Nutzer verpflichten sich insbesondere:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>keine rechtswidrigen Inhalte bereitzustellen</li>
              <li>keine Systeme zu manipulieren</li>
              <li>keine Rechte Dritter zu verletzen</li>
            </ul>
            <p className="text-gray-700">Bei Verstößen können sofortige Maßnahmen ergriffen werden.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Haftungsausschluss</h2>
            <p className="text-gray-700 mb-4">Scherbius Technology haftet in keinem Fall, weder direkt noch indirekt, für:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Vermögensschäden</li>
              <li>Datenverlust</li>
              <li>entgangenen Gewinn</li>
              <li>Betriebsunterbrechungen</li>
              <li>technische Fehler oder Ausfälle</li>
            </ul>
            <p className="text-gray-700">Die Nutzung erfolgt ausschließlich auf eigenes Risiko.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Änderungen der AGB</h2>
            <p className="text-gray-700 mb-4">Scherbius Technology kann diese AGB jederzeit einseitig ändern.</p>
            <p className="text-gray-700">Die weitere Nutzung gilt als stillschweigende Zustimmung.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Anwendbares Recht & Gerichtsstand</h2>
            <p className="text-gray-700 mb-4">Es gilt ausschließlich das Recht der Vereinigten Arabischen Emirate.</p>
            <p className="text-gray-700">Gerichtsstand ist Dubai, VAE.</p>
          </section>
        </div>

        {/* Legal Links */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link to="/legal/imprint" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
              Impressum
            </Link>
            <Link to="/legal/privacy" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
              Datenschutz
            </Link>
            <span className="text-gray-900 font-semibold">
              AGB
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
