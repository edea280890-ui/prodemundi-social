-- Función del trigger para manejar nuevos usuarios en auth.users e insertarlos en public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_id, role)
  values (
    new.id,
    coalesce(
      lower(new.raw_user_meta_data->>'username'), 
      split_part(new.email, '@', 1),
      'usuario_' || substring(new.id::text from 1 for 8)
    ),
    coalesce(new.raw_user_meta_data->>'name', 'Usuario'),
    'avatar_01',
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger que se ejecuta después de que se inserta un registro en auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
