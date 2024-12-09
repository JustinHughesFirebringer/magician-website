-- Create function to add slug column if it doesn't exist
create or replace function add_slug_column_if_not_exists()
returns void
language plpgsql
security definer
as $$
begin
  -- Check if slug column exists
  if not exists (
    select 1
    from information_schema.columns
    where table_name = 'magicians'
    and column_name = 'slug'
  ) then
    -- Add slug column
    execute 'alter table magicians add column slug text unique';
    
    -- Create index for faster lookups
    execute 'create index idx_magicians_slug on magicians(slug)';
    
    -- Add not null constraint after migration
    execute 'alter table magicians alter column slug set not null';
  end if;
end;
$$;
