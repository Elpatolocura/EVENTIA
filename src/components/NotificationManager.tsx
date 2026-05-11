import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationsService } from '@/lib/notifications';
import { App as CapacitorApp, AppUrlOpenEvent } from '@capacitor/app';
import type { Channel } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Audio context not supported
  }
};

const NotificationManager = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Initialize Native Push Notifications
    NotificationsService.initialize().catch(err => {
      console.error('Failed to init push notifications:', err);
    });

    // Handle Deep Links (App opening from URL or notification)
    CapacitorApp.addListener('appUrlOpen', (event: AppUrlOpenEvent) => {
      const slug = event.url.split('://').pop();
      if (slug) {
        navigate(slug);
      }
    });

    let channel: Channel | null = null;

    const setupSubscription = async () => {
      if (!user) return;

      channel = supabase
        .channel(`user-notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotif = payload.new as any;

            playNotificationSound();

            // Show real-time toast
            toast(newNotif.title, {
              description: newNotif.message,
              icon: <Bell className="w-4 h-4 text-primary" />,
              action: newNotif.action_url ? {
                label: 'Ver',
                onClick: () => navigate(newNotif.action_url)
              } : undefined,
              duration: 5000,
            });
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [navigate, user?.id]);

  return null; // This component only handles logic
};

export default NotificationManager;
