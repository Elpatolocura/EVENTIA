import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { ArrowLeft, Shield, FileText, Scale, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LegalPage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/settings');
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center gap-4 border-b border-border">
        <button onClick={goBack} className="lg:hidden p-2 rounded-full hover:bg-secondary transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('settings.legal.title')}</h1>
      </div>

      <div className="p-6 space-y-10">
        {/* Intro */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-2">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-black">{t('settings.legal.terms_title')}</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">{t('settings.legal.last_update')}</p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="w-4 h-4" />
              <h3 className="font-bold text-sm uppercase tracking-wider">{t('settings.legal.sections.terms.title')}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('settings.legal.sections.terms.content')}
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <AlertCircle className="w-4 h-4" />
              <h3 className="font-bold text-sm uppercase tracking-wider">{t('settings.legal.sections.cancellation.title')}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('settings.legal.sections.cancellation.content')}
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="w-4 h-4" />
              <h3 className="font-bold text-sm uppercase tracking-wider">{t('settings.legal.sections.privacy.title')}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('settings.legal.sections.privacy.content')}
            </p>
          </section>
        </div>

        {/* Footer info */}
        <div className="pt-10 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            {t('settings.legal.footer')} <span className="text-primary font-medium">legal@eventia.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
