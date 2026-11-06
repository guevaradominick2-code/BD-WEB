alter table public.memories
  add column if not exists content_hash text;

create unique index if not exists memories_celebration_content_hash_key
  on public.memories (celebration_id, content_hash)
  where content_hash is not null;
