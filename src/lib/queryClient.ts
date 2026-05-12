import { QueryClient } from "@tanstack/react-query";

const STALE_TIMES = {
  events: 1000 * 60 * 2,
  eventDetail: 1000 * 60 * 5,
  profile: 1000 * 60 * 5,
  tickets: 1000 * 60 * 3,
  chats: 1000 * 30,
  notifications: 1000 * 60,
  favorites: 1000 * 60 * 3,
  reviews: 1000 * 60 * 2,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) return false;
        if (failureCount >= 2) return false;
        return true;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      gcTime: 1000 * 60 * 10,
    },
    mutations: {
      retry: false,
    },
  },
});

export const queryKeys = {
  events: {
    all: ["events"] as const,
    list: (filters?: Record<string, unknown>) => ["events", "list", filters] as const,
    detail: (id: string) => ["events", "detail", id] as const,
  },
  profile: {
    me: ["profile", "me"] as const,
    byId: (id: string) => ["profile", id] as const,
  },
  tickets: {
    all: ["tickets"] as const,
    byEvent: (eventId: string) => ["tickets", "event", eventId] as const,
    detail: (id: string) => ["tickets", "detail", id] as const,
  },
  chats: {
    all: ["chats"] as const,
    room: (id: string) => ["chats", "room", id] as const,
    messages: (roomId: string) => ["chats", "messages", roomId] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
  favorites: {
    all: ["favorites"] as const,
  },
};

export { STALE_TIMES };
