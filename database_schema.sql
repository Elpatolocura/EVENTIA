-- ============================================================
-- EVENTIA DATABASE SCHEMA
-- ============================================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    bio TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'premium', 'organizer', 'admin')),
    preferences JSONB NOT NULL DEFAULT '[]'::jsonb,
    preferred_entry_type TEXT NOT NULL DEFAULT 'ambas'::text,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    followers_count INTEGER NOT NULL DEFAULT 0,
    following_count INTEGER NOT NULL DEFAULT 0,
    events_count INTEGER NOT NULL DEFAULT 0,
    onboarding_complete BOOLEAN NOT NULL DEFAULT false,
    fcm_token TEXT,
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfiles públicos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Insertar propio perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Actualizar propio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organizer_name TEXT,
    organizer_avatar TEXT,
    location TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    event_date DATE,
    event_time TIME WITHOUT TIME ZONE,
    is_paid BOOLEAN DEFAULT false,
    price NUMERIC DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    max_attendees INTEGER,
    attendees_count INTEGER NOT NULL DEFAULT 0,
    amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'finished')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Eventos visibles para todos" ON public.events FOR SELECT USING (true);
CREATE POLICY "Usuarios autenticados pueden crear eventos" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizadores pueden editar sus propios eventos" ON public.events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizadores pueden eliminar sus propios eventos" ON public.events FOR DELETE USING (auth.uid() = organizer_id);

-- 3. EVENT_IMAGES
CREATE TABLE IF NOT EXISTS public.event_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.event_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Imágenes visibles" ON public.event_images FOR SELECT USING (true);
CREATE POLICY "Organizadores gestionan imágenes" ON public.event_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
);

-- 4. TICKETS
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    zone TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(10,2),
    total_price NUMERIC,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled')),
    qr_code TEXT,
    seat_info TEXT,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus propios tickets" ON public.tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Comprar tickets" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, event_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver favoritos propios" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Añadir favorito" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Quitar favorito" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- 6. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL CHECK (plan_id IN ('Basic', 'Pro', 'Business')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    price_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
    billing_period TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    payment_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver propia suscripción" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- 7. CHAT_ROOMS
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'event' CHECK (type IN ('event', 'private')),
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    participants_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Salas visibles" ON public.chat_rooms FOR SELECT USING (auth.uid() IS NOT NULL);

-- 8. CHAT_ROOM_MEMBERS
CREATE TABLE IF NOT EXISTS public.chat_room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    unread_count INTEGER NOT NULL DEFAULT 0,
    UNIQUE(room_id, user_id)
);

ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver propia membresía de sala" ON public.chat_room_members FOR SELECT USING (auth.uid() = user_id);

-- 9. CHAT_MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    video_url TEXT,
    reply_to_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mensajes visibles" ON public.chat_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_room_members WHERE room_id = chat_messages.room_id AND user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.chat_rooms WHERE id = chat_messages.room_id AND type = 'event')
);
CREATE POLICY "Enviar mensajes" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('event', 'ticket', 'chat', 'system', 'follow')),
    read BOOLEAN NOT NULL DEFAULT false,
    action_url TEXT,
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver propias notif" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Actualizar propias notif" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Insertar propia notif" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. FOLLOWS
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seguimientos visibles" ON public.follows FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Seguir usuarios" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Dejar de seguir" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- ============================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================

-- Function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, onboarding_complete)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'user',
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger: on_auth_user_created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: handle_subscription_change
CREATE OR REPLACE FUNCTION public.handle_subscription_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' THEN
    IF NEW.plan_id = 'Business' THEN
      UPDATE public.profiles SET role = 'organizer' WHERE id = NEW.user_id;
    ELSIF NEW.plan_id = 'Pro' THEN
      UPDATE public.profiles SET role = 'premium' WHERE id = NEW.user_id;
    END IF;
  ELSIF NEW.status IN ('cancelled', 'expired') THEN
    UPDATE public.profiles SET role = 'user' WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger: on_subscription_change
DROP TRIGGER IF EXISTS on_subscription_change ON public.subscriptions;
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_subscription_change();

-- Function: handle_new_event
CREATE OR REPLACE FUNCTION public.handle_new_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  organizer_name TEXT;
BEGIN
  INSERT INTO public.chat_rooms (name, event_id, type)
  VALUES (NEW.title || ' — Chat', NEW.id, 'event');

  SELECT COALESCE(full_name, 'un organizador') INTO organizer_name
  FROM public.profiles WHERE id = NEW.organizer_id;

  INSERT INTO public.notifications (user_id, title, message, type, related_id, action_url)
  SELECT
    f.follower_id,
    'Nuevo evento de ' || organizer_name,
    NEW.title || ' — ' || COALESCE(TO_CHAR(NEW.event_date, 'DD/MM/YYYY'), 'Próximamente'),
    'event',
    NEW.id,
    '/event/' || NEW.id
  FROM public.follows f
  WHERE f.following_id = NEW.organizer_id;
  RETURN NEW;
END;
$$;

-- Trigger: on_event_created
DROP TRIGGER IF EXISTS on_event_created ON public.events;
CREATE TRIGGER on_event_created
  AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_event();

-- Function: handle_new_ticket
CREATE OR REPLACE FUNCTION public.handle_new_ticket()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.events
  SET attendees_count = attendees_count + COALESCE(NEW.quantity, 1)
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$;

-- Trigger: on_ticket_purchased
DROP TRIGGER IF EXISTS on_ticket_purchased ON public.tickets;
CREATE TRIGGER on_ticket_purchased
  AFTER INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_ticket();

-- Function: handle_new_chat_message
CREATE OR REPLACE FUNCTION public.handle_new_chat_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.chat_rooms
  SET
    last_message = CASE WHEN NEW.text IS NOT NULL THEN LEFT(NEW.text, 100) ELSE '📎 Archivo' END,
    last_message_at = NEW.created_at
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$;

-- Trigger: on_chat_message_sent
DROP TRIGGER IF EXISTS on_chat_message_sent ON public.chat_messages;
CREATE TRIGGER on_chat_message_sent
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_chat_message();

-- Function: handle_follow_change
CREATE OR REPLACE FUNCTION public.handle_follow_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  follower_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;

    SELECT COALESCE(full_name, 'Alguien') INTO follower_name
    FROM public.profiles WHERE id = NEW.follower_id;

    INSERT INTO public.notifications (user_id, title, message, type, related_id, action_url)
    VALUES (
      NEW.following_id,
      'Nuevo seguidor',
      follower_name || ' ha comenzado a seguirte.',
      'follow',
      NEW.follower_id,
      '/profile/u/' || NEW.follower_id
    );
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
    UPDATE public.profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger: on_follow_change
DROP TRIGGER IF EXISTS on_follow_change ON public.follows;
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow_change();

-- Trigger: Notify on Event Cancellation
CREATE OR REPLACE FUNCTION public.handle_event_cancellation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_id, action_url)
    SELECT
      user_id,
      'Evento Cancelado: ' || NEW.title,
      'Lo sentimos, el evento ha sido cancelado por el organizador.',
      'event',
      NEW.id,
      '/events/' || NEW.id
    FROM public.tickets
    WHERE event_id = NEW.id AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_event_cancelled ON public.events;
CREATE TRIGGER on_event_cancelled
  AFTER UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_event_cancellation();

-- Trigger: Notify on New Ticket (Success)
CREATE OR REPLACE FUNCTION public.handle_ticket_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  event_name TEXT;
BEGIN
  SELECT title INTO event_name FROM public.events WHERE id = NEW.event_id;

  INSERT INTO public.notifications (user_id, title, message, type, related_id, action_url)
  VALUES (
    NEW.user_id,
    '¡Ticket Confirmado!',
    'Tu entrada para ' || event_name || ' ya está disponible.',
    'ticket',
    NEW.id,
    '/tickets'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_ticket_created_notify ON public.tickets;
CREATE TRIGGER on_ticket_created_notify
  AFTER INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_ticket_notification();
