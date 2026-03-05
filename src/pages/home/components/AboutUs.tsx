import { useTranslation } from 'react-i18next';

export default function AboutUs() {
  const { t } = useTranslation();

  return (
    <section id="about-us" className="relative py-28 px-6 bg-[#0F1419]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#B87333]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#B87333]/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B87333]/10 border border-[#B87333]/20 mb-8">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-team-line text-[#B87333] text-sm"></i>
            </div>
            <span className="text-[#B87333] text-xs font-medium tracking-wider uppercase">{t('aboutUs.badge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {t('aboutUs.title')}
          </h2>
        </div>

        {/* Manifesto Content */}
        <div className="space-y-10">
          {/* Opening */}
          <div className="space-y-3">
            <p className="text-[#B87333] text-lg font-semibold">{t('aboutUs.line1')}</p>
            <p className="text-[#B87333] text-lg font-semibold">{t('aboutUs.line2')}</p>
          </div>

          <p className="text-gray-300 text-base leading-relaxed">
            {t('aboutUs.paragraph1')}
          </p>

          {/* Beliefs */}
          <div className="border-l-2 border-[#B87333]/40 pl-6 space-y-4">
            <p className="text-gray-400 text-base">{t('aboutUs.belief1a')}</p>
            <p className="text-white text-base font-medium">{t('aboutUs.belief1b')}</p>
            <p className="text-gray-400 text-base mt-4">{t('aboutUs.belief2a')}</p>
            <p className="text-white text-base font-medium">{t('aboutUs.belief2b')}</p>
          </div>

          <p className="text-gray-300 text-base leading-relaxed">
            {t('aboutUs.mission1')}<br />
            {t('aboutUs.mission2')}
          </p>

          <p className="text-gray-300 text-base leading-relaxed">
            {t('aboutUs.analysis')}
          </p>

          {/* Failure */}
          <div className="bg-[#B87333]/5 border border-[#B87333]/10 rounded-xl p-8">
            <p className="text-white text-base leading-relaxed">
              {t('aboutUs.failure1')}<br />
              {t('aboutUs.failure2')}<br />
              {t('aboutUs.failure3')}
            </p>
          </div>

          <p className="text-white text-lg font-semibold text-center">
            {t('aboutUs.clarity')}
          </p>

          {/* Values */}
          <div className="flex justify-center gap-8">
            <span className="text-[#B87333] font-semibold text-base">{t('aboutUs.value1')}</span>
            <span className="text-[#B87333] font-semibold text-base">{t('aboutUs.value2')}</span>
            <span className="text-[#B87333] font-semibold text-base">{t('aboutUs.value3')}</span>
          </div>

          <div className="space-y-3 text-gray-300 text-base leading-relaxed">
            <p>{t('aboutUs.confirm')}</p>
            <p>{t('aboutUs.deny')}</p>
          </div>

          {/* Closing */}
          <div className="text-center space-y-1 pt-4">
            <p className="text-gray-500 text-sm">{t('aboutUs.noApplause')}</p>
            <p className="text-gray-500 text-sm">{t('aboutUs.noSugarcoating')}</p>
            <p className="text-gray-500 text-sm">{t('aboutUs.noTheater')}</p>
          </div>

          <p className="text-center text-white text-xl font-bold tracking-wide pt-4">
            No hype. Just truth.
          </p>
        </div>
      </div>
    </section>
  );
}
