import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationsService } from '@/lib/notifications';
import { App as CapacitorApp } from '@capacitor/app';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

const NotificationManager = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    NotificationsService.initialize().catch(() => {});

    CapacitorApp.addListener('appUrlOpen', (event) => {
      const slug = event.url.split('://').pop();
      if (slug) navigate(slug);
    });

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newNotif = payload.new as any;
          if (document.hidden) return;
          toast(newNotif.title, {
            description: newNotif.message,
            icon: <Bell className="w-4 h-4 text-primary" />,
            action: newNotif.action_url ? { label: 'Ver', onClick: () => navigate(newNotif.action_url) } : undefined,
            duration: 5000,
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [user?.id, navigate]);

  return null;
};

export default NotificationManager;
