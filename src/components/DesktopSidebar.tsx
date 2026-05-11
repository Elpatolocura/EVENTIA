import { Link, useLocation } from 'react-router-dom';
import {
  Home, Heart, PlusSquare, MessageCircle, User,
  Settings, Bell, Ticket, Calendar, LogOut,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { path: '/', icon: Home, labelKey: 'nav.home' },
  { path: '/favorites', icon: Heart, labelKey: 'nav.favorites' },
  { path: '/create', icon: PlusSquare, labelKey: 'Create' },
  { path: '/chat', icon: MessageCircle, labelKey: 'nav.chat' },
  { path: '/tickets', icon: Ticket, labelKey: 'My Tickets' },
  { path: '/my-events', icon: Calendar, labelKey: 'My Events' },
  { path: '/notifications', icon: Bell, labelKey: 'Notifications' },
  { path: '/profile', icon: User, labelKey: 'nav.profile' },
  { path: '/settings', icon: Settings, labelKey: 'Settings' },
];

const DesktopSidebar = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 hidden lg:flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
            <span className="text-background font-black text-lg">E</span>
          </div>
          <span className="font-black text-xl tracking-tight">Eventia</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? '' : ''}`} />
              <span>{t(item.labelKey as any) || item.labelKey}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info & Logout */}
      {user && (
        <div className="p-4 border-t border-border">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.email?.split('@')[0]}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors mt-1"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('settings.logout') || 'Cerrar sesión'}</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default DesktopSidebar;