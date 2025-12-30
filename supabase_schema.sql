-- Create a private 'profiles' table that syncs with auth.users
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  dna_json jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view own profile" 
on public.profiles for select 
using ( auth.uid() = id );

-- Policy: Users can update their own profile
create policy "Users can update own profile" 
on public.profiles for update 
using ( auth.uid() = id );

-- Policy: Users can insert their own profile
create policy "Users can insert own profile" 
on public.profiles for insert 
with check ( auth.uid() = id );

-- Create a 'drafts' table for saving writings
create table public.drafts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  content text,
  kotodama_rate integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for drafts
alter table public.drafts enable row level security;

-- Policy: Users can CRUD their own drafts
create policy "Users can crud own drafts" 
on public.drafts for all 
using ( auth.uid() = user_id );

-- Function to handle new user signup (Optional: Auto-create profile)
-- This ensures a profile row exists when a new user signs up
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, dna_json)
  values (new.id, new.email, '{}'::jsonb);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
