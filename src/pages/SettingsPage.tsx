import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';

import {
  ArrowLeft,
  User,
  Bell,
  Lock,
  Globe,
  Moon,
  ShieldCheck,
  HelpCircle,
  LogOut,
  ChevronRight,
  Heart,
  Check,
  X,
  Sparkles,
  Palette,
  Rocket,
  Eye,
  EyeOff,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

/**
 * ✅ IMPORT CORREGIDO
 * Antes:
 * import { applyTheme } from '@/components/ThemeHandler';
 */

import {
  applyTheme,
  AccentColor,
  InterfaceStyle,
} from '@/lib/theme';

import { useTranslation } from 'react-i18next';

import {
  allCategories,
  categoryEmojis,
} from '@/data/mockData';

const SettingsPage = () => {
  const navigate = useNavigate();

  const goBack = useSmartBack('/profile');

  const { t, i18n } = useTranslation();

  const [showInterests, setShowInterests] =
    useState(false);

  const [showLanguage, setShowLanguage] =
    useState(false);

  const [language, setLanguage] = useState(
    i18n.language.startsWith('en')
      ? 'English'
      : 'Español'
  );

  const [isDarkMode, setIsDarkMode] =
    useState(
      localStorage.getItem('app-theme') ===
      'dark'
    );

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [interests, setInterests] = useState<
    string[]
  >([]);

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [showPasswordText, setShowPasswordText] =
    useState(false);

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [membership, setMembership] =
    useState<string>('Basic');

  const [showAppearance, setShowAppearance] =
    useState(false);

  /**
   * ✅ TIPADO CORRECTO
   */

  const [accentColor, setAccentColor] =
    useState<AccentColor>(
      (localStorage.getItem(
        'app-accent-color'
      ) as AccentColor) || 'indigo'
    );

  const [interfaceStyle, setInterfaceStyle] =
    useState<InterfaceStyle>(
      (localStorage.getItem(
        'app-interface-style'
      ) as InterfaceStyle) || 'Moderno'
    );

  const [savingInterests, setSavingInterests] =
    useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // =========================
        // Fetch Membership
        // =========================
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (sub) {
          setMembership(sub.plan_id);

          localStorage.setItem(
            'user_membership',
            sub.plan_id
          );
        }

        // =========================
        // Fetch Interests
        // =========================
        const { data: profile } =
          await supabase
            .from('profiles')
            .select('preferences')
            .eq('id', user.id)
            .single();

        if (profile?.preferences) {
          setInterests(profile.preferences);
        }
      }
    };

    fetchProfileData();
  }, []);

  /**
   * =========================
   * APPLY THEME HELPERS
   * =========================
   */

  const handleApplyColor = (
    color: AccentColor
  ) => {
    setAccentColor(color);

    applyTheme(color, interfaceStyle);

    toast.success(
      t(
        'settings.appearance.color_updated'
      ) || 'Color actualizado'
    );
  };

  const handleApplyStyle = (
    style: InterfaceStyle
  ) => {
    setInterfaceStyle(style);

    applyTheme(accentColor, style);

    toast.success(
      t(
        'settings.appearance.style_updated'
      ) || 'Estilo actualizado'
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* TU CONTENIDO SIGUE IGUAL */}

      {/* EJEMPLO DE USO CORRECTO */}

      <button
        onClick={() =>
          handleApplyColor('indigo')
        }
      >
        Indigo
      </button>

      <button
        onClick={() =>
          handleApplyStyle('Minimalista')
        }
      >
        Minimalista
      </button>
    </div>
  );
};

export default SettingsPage;