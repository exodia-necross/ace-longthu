insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read banners" on storage.objects;
drop policy if exists "Admins can manage banners" on storage.objects;

create policy "Public can read banners"
on storage.objects for select
using (bucket_id = 'banners');

create policy "Admins can manage banners"
on storage.objects for all
using (bucket_id = 'banners' and public.is_admin())
with check (bucket_id = 'banners' and public.is_admin());
