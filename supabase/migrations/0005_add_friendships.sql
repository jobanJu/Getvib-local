-- Migration 0005 — Ajoute le système d'amis.

create type friendship_status as enum ('pending', 'accepted');

create table public.friendships (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  status friendship_status default 'pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (sender_id, receiver_id),
  constraint no_self_friendship check (sender_id <> receiver_id)
);

-- RLS
alter table public.friendships enable row level security;

create policy "Utilisateurs voient leurs propres amitiés" 
  on public.friendships for select 
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Utilisateurs peuvent envoyer des demandes" 
  on public.friendships for insert 
  with check (auth.uid() = sender_id);

create policy "Destinataire peut modifier le statut" 
  on public.friendships for update 
  using (auth.uid() = receiver_id);

create policy "Utilisateurs peuvent supprimer leurs amitiés" 
  on public.friendships for delete 
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
