-- Schema SQL pour la migration de Firebase vers Supabase

-- Extension pour la génération d'UUID
create extension if not exists "uuid-ossp";

-- Profils utilisateurs (Lié à auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  email text,
  photo_url text,
  age integer,
  bio text,
  interests text[],
  verification_level integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Active RLS
alter table public.profiles enable row level security;
create policy "Profils visibles par tous" on public.profiles for select using (true);
create policy "Mise à jour par l'utilisateur lui-même" on public.profiles for update using (auth.uid() = id);

-- Type d'événements
create type event_type as enum ('vib', 'vibplus');
create type event_status as enum ('draft', 'published', 'cancelled', 'completed');

-- Événements
create table public.events (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references public.profiles(id) on delete cascade not null,
  type event_type not null,
  title text not null,
  description text,
  image text,
  vibe text,
  date timestamp with time zone not null,
  city text,
  address text,
  address_visible boolean default false,
  reveal_at timestamp with time zone not null,
  max_participants integer not null,
  contribution_amount integer,
  contribution_reason text,
  min_age integer,
  max_age integer,
  interests_required text[],
  status event_status default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.events enable row level security;
create policy "Événements publiés visibles par tous" on public.events for select using (status = 'published');
create policy "Hôtes peuvent gérer leurs événements" on public.events for all using (auth.uid() = host_id);

-- Participants aux événements (Junction table)
create table public.event_participants (
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (event_id, user_id)
);

alter table public.event_participants enable row level security;
create policy "Participants visibles par tous" on public.event_participants for select using (true);

-- Candidatures (Applications)
create type application_status as enum ('pending', 'accepted', 'rejected');

create table public.applications (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  message text,
  status application_status default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (event_id, user_id)
);

alter table public.applications enable row level security;
create policy "Hôtes et candidats peuvent voir les candidatures" on public.applications for select using (
  auth.uid() = user_id or auth.uid() in (select host_id from public.events where id = event_id)
);

-- Chats
create type chat_kind as enum ('private', 'group');

create table public.chats (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  type chat_kind not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.chats enable row level security;

-- Participants aux Chats
create table public.chat_participants (
  chat_id uuid references public.chats(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  primary key (chat_id, user_id)
);

alter table public.chat_participants enable row level security;

-- Fix RLS recursion for chat_participants
create policy "Les membres peuvent voir les participants de leur chat" on public.chat_participants for select using (
  exists (
    select 1 from public.chat_participants cp 
    where cp.chat_id = chat_participants.chat_id 
    and cp.user_id = auth.uid()
  )
);

create policy "Les membres peuvent voir les chats" on public.chats for select using (
  exists (
    select 1 from public.chat_participants 
    where chat_id = chats.id 
    and user_id = auth.uid()
  )
);

-- Messages
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;
create policy "Les membres du chat peuvent lire les messages" on public.messages for select using (
  exists (
    select 1 from public.chat_participants 
    where chat_id = messages.chat_id 
    and user_id = auth.uid()
  )
);
create policy "Les membres du chat peuvent envoyer des messages" on public.messages for insert with check (
  exists (
    select 1 from public.chat_participants 
    where chat_id = messages.chat_id 
    and user_id = auth.uid()
  )
  and auth.uid() = sender_id
);

-- Notifications
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;
create policy "Les utilisateurs voient leurs notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Les utilisateurs modifient leurs notifications" on public.notifications for update using (auth.uid() = user_id);

-- Reports
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  target_user_id uuid references public.profiles(id) on delete cascade not null,
  reason text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reports enable row level security;
create policy "Utilisateurs peuvent voir leurs signalements" on public.reports for select using (auth.uid() = reporter_id);
create policy "Utilisateurs peuvent créer des signalements" on public.reports for insert with check (auth.uid() = reporter_id);

-- Fonction Trigger pour créer automatiquement un profil lors de l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Fonction Trigger pour mettre à jour 'updated_at' sur les chats lors d'un nouveau message
create or replace function public.handle_chat_update()
returns trigger as $$
begin
  update public.chats
  set updated_at = now()
  where id = new.chat_id;
  return new;
end;
$$ language plpgsql;

create trigger on_message_inserted
  after insert on public.messages
  for each row execute procedure public.handle_chat_update();
