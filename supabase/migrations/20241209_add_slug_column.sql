-- Create a function to add a column if it doesn't exist
create or replace function add_slug_column(table_name text, column_name text)
returns void
language plpgsql
as $$
begin
    -- Check if the column exists
    if not exists (
        select 1
        from information_schema.columns
        where table_name = $1
        and column_name = $2
    ) then
        -- Add the column if it doesn't exist
        execute format('alter table %I add column %I text unique', $1, $2);
    end if;
end;
$$;
