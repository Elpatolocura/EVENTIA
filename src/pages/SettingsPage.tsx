import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import {
  ArrowLeft, User, Bell, Lock, Globe, Moon, ShieldCheck, HelpCircle, LogOut, ChevronRight, Check, X, Palette, Rocket, Eye, EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { applyTheme, applyColorMode, ACCENT_COLORS, type AccentColor, type InterfaceStyle } from '@/lib/theme';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/profile');
  const { t, i18n } = useTranslation();
  const { user, signOut: authSignOut } = useAuth();

  const [showLanguage, setShowLanguage] = useState(false);
  const [language, setLanguage] = useState(i18n.language.startsWith('en') ? 'English' : 'Español');
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('app-theme') === 'dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [membership, setMembership] = useState<string>('Basic');
  const [showAppearance, setShowAppearance] = useState(false);

  const [accentColor, setAccentColor] = useState<AccentColor>(
    (localStorage.getItem('app-accent-color') as AccentColor) || 'indigo'
  );

  const [interfaceStyle, setInterfaceStyle] = useState<InterfaceStyle>(
    (localStorage.getItem('app-interface-style') as InterfaceStyle) || 'Moderno'
  );

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (sub) {
          setMembership(sub.plan_id);
          localStorage.setItem('user_membership', sub.plan_id);
        }
      } catch (error) {
        console.error('Error fetching settings data:', error);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleApplyColor = (color: AccentColor) => {
    setAccentColor(color);
    applyTheme(color, interfaceStyle);
    toast.success(t('settings.appearance.color_updated') || 'Color actualizado');
  };

  const handleApplyStyle = (style: InterfaceStyle) => {
    setInterfaceStyle(style);
    applyTheme(accentColor, style);
    toast.success(t('settings.appearance.style_updated') || 'Estilo actualizado');
  };

  const handleThemeToggle = (dark: boolean) => {
    setIsDarkMode(dark);
    applyColorMode(dark ? 'dark' : 'light');
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await authSignOut();
    navigate('/auth');
    toast.success(t('settings.logged_out') || 'Sesión cerrada');
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={goBack} className="lg:hidden p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t('settings.title') || 'Ajustes'}</h1>
        </div>
      </div>

      <div className="divide-y divide-border">
        <div className="p-4">
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate('/profile/edit')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t('settings.edit_profile') || 'Editar perfil'}</p>
                <p className="text-sm text-muted-foreground">{t('settings.edit_profile_desc') || 'Foto, nombre, biografía'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        <div className="p-4 space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">{t('settings.preferences') || 'Preferencias'}</h2>
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setShowLanguage(true)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Globe className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="font-medium text-foreground">{t('settings.language') || 'Idioma'}</p>
                <p className="text-sm text-muted-foreground">{language}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Moon className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="font-medium text-foreground">{t('settings.dark_mode') || 'Modo oscuro'}</p>
                <p className="text-sm text-muted-foreground">{t('settings.dark_mode_desc') || 'Cambiar apariencia'}</p>
              </div>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} />
          </div>
        </div>

        <div className="p-4 space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">{t('settings.appearance.title') || 'Apariencia'}</h2>
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setShowAppearance(!showAppearance)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Palette className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="font-medium text-foreground">{t('settings.customize') || 'Personalizar'}</p>
                <p className="text-sm text-muted-foreground">{t('settings.customize_desc') || 'Color y estilo'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          {showAppearance && (
            <div className="mt-3 p-4 rounded-xl bg-muted/30 space-y-4">
              <div>
                <p className="text-sm font-medium mb-3">{t('settings.appearance.accent_color') || 'Color principal'}</p>
                <div className="flex gap-3 flex-wrap">
                  {Object.keys(ACCENT_COLORS).map((color) => (
                    <button key={color} onClick={() => handleApplyColor(color as AccentColor)} className={`w-10 h-10 rounded-full transition-all ${accentColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}`} style={{ backgroundColor: `hsl(${ACCENT_COLORS[color as AccentColor]})` }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                {['Moderno', 'Minimalista'].map((style) => (
                  <button key={style} onClick={() => handleApplyStyle(style as InterfaceStyle)} className={`flex-1 py-2 rounded-xl font-medium transition-all ${interfaceStyle === style ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{style}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">{t('settings.security') || 'Seguridad'}</h2>
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setShowPasswordModal(true)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Lock className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="font-medium text-foreground">{t('settings.change_password') || 'Cambiar contraseña'}</p>
                <p className="text-sm text-muted-foreground">{t('settings.change_password_desc') || 'Actualizar contraseña'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        <div className="p-4 space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">{t('settings.support') || 'Soporte'}</h2>
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate('/support')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><HelpCircle className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="font-medium text-foreground">{t('settings.help') || 'Centro de ayuda'}</p>
                <p className="text-sm text-muted-foreground">{t('settings.help_desc') || 'Preguntas frecuentes'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        <div className="p-4 space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">{t('settings.privacy') || 'Políticas'}</h2>
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate('/terms')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="font-medium text-foreground">{t('settings.privacy') || 'Privacidad y Términos'}</p>
                <p className="text-sm text-muted-foreground">{t('settings.privacy_desc') || 'Normas y condiciones de uso'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        <div className="p-4">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><LogOut className="w-5 h-5 text-red-600" /></div>
            <div className="flex-1 text-left">
              <p className="font-medium">{t('settings.logout') || 'Cerrar sesión'}</p>
              <p className="text-sm text-red-500/70">{t('settings.logout_desc') || 'Salir de tu cuenta'}</p>
            </div>
          </button>
        </div>
      </div>

      </div>

      {/* Language Modal */}
      <Dialog open={showLanguage} onOpenChange={setShowLanguage}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('settings.select_language')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {[
              { code: 'es', label: 'Español' },
              { code: 'en', label: 'English' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setLanguage(lang.label);
                  setShowLanguage(false);
                  toast.success(t('settings.language_changed', { lang: lang.label }));
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted transition-colors"
              >
                <span className="font-medium text-foreground">{lang.label}</span>
                {language === lang.label && <Check className="w-5 h-5 text-primary" />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('settings.change_password')}</DialogTitle>
            <DialogDescription>{t('settings.change_password_desc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="relative">
              <input
                type={showPasswordText ? 'text' : 'password'}
                placeholder={t('settings.new_password') || 'Nueva contraseña'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-muted border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-primary pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPasswordText(!showPasswordText)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPasswordText ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPasswordText ? 'text' : 'password'}
                placeholder={t('settings.confirm_password') || 'Confirmar contraseña'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-muted border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-primary pr-12"
              />
            </div>
            <Button
              className="w-full h-12 rounded-xl font-bold"
              onClick={async () => {
                if (newPassword.length < 6) {
                  toast.error(t('settings.password_length_error') || 'La contraseña debe tener al menos 6 caracteres');
                  return;
                }
                if (newPassword !== confirmPassword) {
                  toast.error(t('settings.password_mismatch') || 'Las contraseñas no coinciden');
                  return;
                }
                const { error } = await supabase.auth.updateUser({ password: newPassword });
                if (error) {
                  toast.error(error.message);
                } else {
                  toast.success(t('settings.password_updated'));
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }
              }}
            >
              {t('common.save') || 'Guardar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.confirm_logout_title') || '¿Cerrar sesión?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.confirm_logout_desc') || '¿Estás seguro de que deseas cerrar sesión? Deberás iniciar sesión nuevamente para acceder a tu cuenta.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel') || 'Cancelar'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-red-600 hover:bg-red-700 text-white">
              {t('settings.logout') || 'Cerrar sesión'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsPage;