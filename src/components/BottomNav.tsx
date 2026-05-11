import { Home, Heart, PlusSquare, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;
  const { t } = useTranslation();

  // List of paths where the BottomNav should NOT be visible
  const hideOnPaths = [
    '/event',
    '/support',
    '/knowledge-base',
    '/checkout',
    '/auth',
    '/welcome',
    '/onboarding',
    '/chat/',
    '/chat-settings',
    '/settings',
    '/premium',
    '/subscribe',
    '/my-events',
    '/notifications',
    '/ticket',
    '/profile/edit',
    '/terms',
    '/report'
  ];

  // Check if current path starts with any of the hidden paths
  const shouldHide = hideOnPaths.some(p => path.startsWith(p));

  if (shouldHide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border px-6 py-3 pb-8 lg:hidden">
      <div className="max-w-xl mx-auto flex justify-between items-center">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 transition-all ${path === '/' ? 'text-foreground scale-110' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Home className={`w-6 h-6 ${path === '/' ? 'fill-foreground' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('nav.home')}</span>
        </Link>
        
        <Link 
          to="/favorites" 
          className={`flex flex-col items-center gap-1 transition-all ${path === '/favorites' ? 'text-foreground scale-110' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Heart className={`w-6 h-6 ${path === '/favorites' ? 'fill-foreground' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('nav.favorites')}</span>
        </Link>

        <Link 
          to="/create" 
          className="flex items-center justify-center w-14 h-14 bg-secondary rounded-[22px] -mt-10 shadow-lg border-4 border-background transition-all active:scale-90 hover:bg-foreground hover:text-background group"
        >
          <PlusSquare className="w-6 h-6 text-foreground group-hover:text-background" />
        </Link>

        <Link 
          to="/chat" 
          className={`flex flex-col items-center gap-1 transition-all ${path === '/chat' ? 'text-foreground scale-110' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <MessageCircle className={`w-6 h-6 ${path === '/chat' ? 'fill-foreground' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('nav.chat')}</span>
        </Link>

        <Link 
          to="/profile" 
          className={`flex flex-col items-center gap-1 transition-all ${path === '/profile' ? 'text-foreground scale-110' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <User className={`w-6 h-6 ${path === '/profile' ? 'fill-foreground' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('nav.profile')}</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
