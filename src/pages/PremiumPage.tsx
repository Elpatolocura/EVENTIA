import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { 
  ArrowLeft, Check, Crown, Zap, Shield, Star, Rocket, 
  Map, MessageCircle, Heart, Bell, PlusCircle, Globe,
  Infinity, TrendingUp, BarChart3, Headphones, ShieldCheck, UserCheck, Wand2,
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const PremiumPage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/');
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = React.useState<string>('all_access');
  const [currentMembership, setCurrentMembership] = React.useState<string | null>(localStorage.getItem('user_membership'));

  React.useEffect(() => {
    const checkMembership = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();
        
        if (subscription) {
          // Normalizar para que coincida con los IDs internos
          const planId = subscription.plan_id === 'Acceso Total' ? 'all_access' : subscription.plan_id;
          setCurrentMembership(planId);
          localStorage.setItem('user_membership', planId);
        } else {
          setCurrentMembership(null);
          localStorage.removeItem('user_membership');
        }
      }
    };
    checkMembership();
  }, []);

  const plans = [
    {
      id: 'Basic',
      name: t('premium.plans.basic.name'),
      price: t('premium.plans.basic.price'),
      period: '',
      icon: Zap,
      description: t('premium.plans.basic.desc'),
      buttonText: t('premium.plans.basic.button'),
      features: [
        { text: t('premium.plans.basic.features.0'), icon: Map },
        { text: t('premium.plans.basic.features.1'), icon: MessageCircle },
        { text: t('premium.plans.basic.features.2'), icon: Heart },
        { text: t('premium.plans.basic.features.3'), icon: Bell },
        { text: t('premium.plans.basic.features.4'), icon: PlusCircle },
        { text: t('premium.plans.basic.features.5'), icon: Globe },
      ],
      color: 'bg-zinc-900/50',
      borderColor: 'border-white/5',
      accentColor: 'text-zinc-400',
      isPremium: false
    },
    {
      id: 'all_access',
      name: t('premium.plans.all_access.name'),
      price: t('premium.plans.all_access.price'),
      period: '/mes',
      icon: Crown,
      description: t('premium.plans.all_access.desc'),
      buttonText: t('premium.plans.all_access.button'),
      badge: t('premium.plans.all_access.badge'),
      features: [
        { text: t('premium.plans.all_access.features.0'), icon: Check },
        { text: t('premium.plans.all_access.features.1'), icon: Infinity },
        { text: t('premium.plans.all_access.features.2'), icon: Star },
        { text: t('premium.plans.all_access.features.3'), icon: TrendingUp },
        { text: t('premium.plans.all_access.features.4'), icon: BarChart3 },
        { text: t('premium.plans.all_access.features.5'), icon: Zap },
        { text: t('premium.plans.all_access.features.6'), icon: Headphones },
        { text: t('premium.plans.all_access.features.7'), icon: ShieldCheck },
        { text: t('premium.plans.all_access.features.8'), icon: UserCheck },
        { text: t('premium.plans.all_access.features.9'), icon: Wand2 },
      ],
      color: 'bg-indigo-600/10',
      borderColor: 'border-indigo-500/30',
      accentColor: 'text-indigo-400',
      isPremium: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 overflow-x-hidden selection:bg-indigo-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={goBack} 
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <h1 className="text-lg font-bold tracking-tight">{t('premium.title')}</h1>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-6">
        {/* Hero Section */}
        <div className="pt-12 pb-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Eleva tu Experiencia</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white leading-tight">
            Desbloquea el <br /> 
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent italic">Potencial Máximo</span>
          </h2>
          <p className="text-zinc-400 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
            {t('premium.subtitle')}
          </p>
        </div>

        {/* Plan Cards */}
        <div className="space-y-6">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`group relative rounded-[40px] border-2 p-8 transition-all duration-500 cursor-pointer overflow-hidden ${
                selectedPlan === plan.id 
                  ? `${plan.borderColor} ${plan.color} shadow-2xl shadow-indigo-500/10 scale-[1.02]` 
                  : 'border-white/5 bg-white/5 grayscale hover:grayscale-0 hover:border-white/10'
              }`}
            >
              {/* Card Glow Effect */}
              {selectedPlan === plan.id && (
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-[80px]"></div>
              )}

              {plan.badge && (
                <div className="absolute top-6 right-6">
                  <span className="px-3 py-1 rounded-full bg-indigo-500 text-[10px] font-black uppercase tracking-tighter text-white">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-8">
                  <div className={`p-4 rounded-[24px] ${selectedPlan === plan.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/10 text-zinc-500'} transition-all duration-500`}>
                    <plan.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white leading-none mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black tracking-tight text-white">{plan.price}</span>
                      {plan.period && <span className="text-sm font-bold text-zinc-500 tracking-tight">{plan.period}</span>}
                    </div>
                  </div>
                </div>

                <p className="text-zinc-400 text-xs font-medium mb-8 leading-relaxed">
                  {plan.description}
                </p>

                <div className="space-y-4 mb-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{t('premium.benefits_included')}</p>
                  <div className="grid gap-3.5">
                    {plan.features.map((feature: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-4 animate-slide-up" style={{ animationDelay: `${idx * 40}ms` }}>
                        <div className={`p-1 rounded-full mt-0.5 ${plan.isPremium ? 'bg-indigo-500/20' : 'bg-white/10'}`}>
                          <feature.icon className={`w-3 h-3 ${plan.isPremium ? 'text-indigo-400' : 'text-zinc-500'}`} />
                        </div>
                        <span className="text-[12px] font-semibold text-zinc-300 leading-tight">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  disabled={currentMembership === plan.id || (plan.id === 'Basic' && !currentMembership)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (plan.id === 'Basic') {
                      toast.info(t('premium.already_basic'));
                    } else {
                      navigate(`/subscribe/${plan.id}`);
                    }
                  }}
                  className={`w-full h-16 rounded-[24px] font-black uppercase tracking-widest text-[11px] transition-all duration-300 active:scale-[0.97] ${
                    selectedPlan === plan.id 
                      ? plan.isPremium 
                        ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                        : 'bg-white text-black hover:bg-zinc-200'
                      : 'bg-white/10 text-zinc-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {currentMembership === plan.id || (plan.id === 'Basic' && !currentMembership)
                    ? 'Plan Actual' 
                    : plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-16 text-center space-y-6">
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('premium.safe_payment')}</span>
            </div>
            <div className="w-px h-8 bg-white/5"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <Headphones className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Soporte VIP</span>
            </div>
          </div>
          
          <p className="text-[10px] text-zinc-600 font-medium max-w-xs mx-auto px-4">
            Tu suscripción se renovará automáticamente al final de cada periodo. 
            Puedes cancelar en cualquier momento desde tu configuración.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
