insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read avatars" on storage.objects;
drop policy if exists "Admins can manage avatars" on storage.objects;

create policy "Public can read avatars"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Admins can manage avatars"
on storage.objects for all
using (bucket_id = 'avatars' and public.is_admin())
with check (bucket_id = 'avatars' and public.is_admin());
