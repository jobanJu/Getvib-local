-- Ajoute un lien de redirection aux notifications
alter table public.notifications add column link text;

-- Commentaire
comment on column public.notifications.link is 'URL vers laquelle rediriger l''utilisateur quand il clique sur la notification.';
