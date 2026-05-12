import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
});

const activeChannels = new Map<string, RealtimeChannel>();
let isAppVisible = true;

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    isAppVisible = !document.hidden;
    if (document.hidden) {
      activeChannels.forEach((channel) => {
        try { channel.unsubscribe(); } catch {}
      });
    } else {
      activeChannels.forEach((channel, key) => {
        try { 
          const callback = channel.callbacks;
          channel.subscribe();
        } catch {}
      });
    }
  });
}

export function createRealtimeChannel(
  name: string,
  config: Parameters<typeof supabase.channel>[1],
  onEvents: () => void
): RealtimeChannel {
  if (activeChannels.has(name)) {
    const existing = activeChannels.get(name)!;
    existing.unsubscribe();
    activeChannels.delete(name);
  }

  const channel = supabase
    .channel(name, config)
    .on('postgres_changes' as any, { event: '*', schema: 'public' }, onEvents)
    .subscribe();

  activeChannels.set(name, channel);
  return channel;
}

export function removeRealtimeChannel(name: string) {
  const channel = activeChannels.get(name);
  if (channel) {
    supabase.removeChannel(channel);
    activeChannels.delete(name);
  }
}

export function getRealtimeState() {
  return { isAppVisible, activeChannels: activeChannels.size };
}
