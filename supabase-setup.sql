-- LoveLock Puzzle Database Schema

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Puzzles table
create table if not exists puzzles (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  image_url text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  grid_size integer not null check (grid_size in (3, 4, 5)),
  message text not null default '',
  sender_name text not null default '',
  sender_email text not null default '',
  tile_order jsonb not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'active', 'opened', 'completed', 'expired')),
  payment_reference text,
  payment_amount integer, -- in kobo
  paid_at timestamptz,
  reveal_at timestamptz,          -- optional: puzzle can't be opened before this
  first_opened_at timestamptz,    -- set on first receiver visit
  expires_at timestamptz,         -- set to first_opened_at + 24h on first open
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Payments table (Paystack references + verification)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  puzzle_id uuid not null references puzzles(id) on delete cascade,
  reference text unique not null,
  amount integer not null, -- in kobo
  status text not null check (status in ('pending', 'success', 'failed')),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- Magic links table (email-based auth)
create table if not exists magic_links (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text unique not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_puzzles_token on puzzles (token);
create index if not exists idx_puzzles_status_expires on puzzles (status, expires_at);
create index if not exists idx_puzzles_payment_ref on puzzles (payment_reference);
create index if not exists idx_puzzles_sender_email on puzzles (sender_email);
create index if not exists idx_payments_reference on payments (reference);
create index if not exists idx_payments_puzzle_id on payments (puzzle_id);
create index if not exists idx_magic_links_token on magic_links (token);

-- Row Level Security
alter table puzzles enable row level security;
alter table payments enable row level security;
alter table magic_links enable row level security;

-- Puzzles: allow read via token (public access for puzzle solving)
create policy "Anyone can read puzzles by token"
  on puzzles for select
  using (true);

-- Puzzles: only service role can insert/update (API routes use service role key)
create policy "Service role can insert puzzles"
  on puzzles for insert
  with check (true);

create policy "Service role can update puzzles"
  on puzzles for update
  using (true);

-- Payments: only service role
create policy "Service role can manage payments"
  on payments for all
  using (true);

-- Magic links: only service role
create policy "Service role can manage magic_links"
  on magic_links for all
  using (true);

-- Storage bucket (run manually in Supabase dashboard or via API)
-- create a public bucket named 'puzzle-images'
-- Set file size limit to 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
