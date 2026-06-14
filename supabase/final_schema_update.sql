-- =============================================================================
-- GETVIB - PRODUCTION SCHEMA UPDATE
-- Consolidated updates for Moderation, Messaging, and Notifications
-- =============================================================================

-- 1. MODÉRATION ET BANNISSEMENT
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP WITH TIME ZONE;

-- Index filtrés pour haute performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles(is_banned) WHERE is_banned = true;
CREATE INDEX IF NOT EXISTS idx_profiles_banned_until ON public.profiles(banned_until) WHERE banned_until IS NOT NULL;

COMMENT ON COLUMN public.profiles.is_banned IS 'Indique si l''utilisateur est banni du service.';
COMMENT ON COLUMN public.profiles.banned_until IS 'Date de fin de bannissement. NULL = Permanent si is_banned est TRUE.';

-- 2. MESSAGERIE ENRICHIE
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.chat_participants ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Indexation pour calcul de performance des messages non lus
CREATE INDEX IF NOT EXISTS idx_messages_chat_id_created_at ON public.messages(chat_id, created_at DESC);

-- 3. NOTIFICATIONS ACTIONNABLES
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link TEXT;
COMMENT ON COLUMN public.notifications.link IS 'URL de redirection vers l''entité concernée (chat, event, profil).';

-- 4. SÉCURITÉ ARCHITECTURALE (RLS HARDENING)
-- Empêcher les utilisateurs bannis d'écrire dans la base de données
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Deny banned users' AND tablename = 'messages') THEN
        CREATE POLICY "Deny banned users" ON public.messages
        FOR INSERT 
        WITH CHECK (
            NOT EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() 
                AND is_banned = true 
                AND (banned_until IS NULL OR banned_until > now())
            )
        );
    END IF;
END $$;
