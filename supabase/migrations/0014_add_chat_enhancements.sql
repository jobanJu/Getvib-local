-- Ajoute le support des photos dans les messages
alter table public.messages add column photo_url text;

-- Ajoute le suivi de lecture pour les badges
alter table public.chat_participants add column last_read_at timestamp with time zone default now();

-- Index pour optimiser la recherche des messages non lus
create index idx_messages_chat_id_created_at on public.messages(chat_id, created_at);
