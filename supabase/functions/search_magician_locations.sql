-- Function to search magician locations with fuzzy matching
create or replace function search_magician_locations(
  search_term text,
  similarity_threshold float default 0.3
)
returns table (
  city text,
  state text,
  slug text,
  similarity float,
  magician_count bigint
)
language plpgsql
as $$
begin
  -- Validate input parameters
  if similarity_threshold < 0 or similarity_threshold > 1 then
    raise exception 'similarity_threshold must be between 0 and 1';
  end if;

  -- Handle empty search term
  if trim(search_term) = '' then
    return query
    select 
      ml.city,
      ml.state,
      ml.slug,
      1.0::float as similarity,
      count(distinct m.id) as magician_count
    from magician_locations ml
    left join magicians m on ml.magician_id = m.id
    group by ml.city, ml.state, ml.slug
    order by magician_count desc
    limit 10;
    return;
  end if;

  return query
  with location_matches as (
    select 
      ml.city,
      ml.state,
      ml.slug,
      greatest(
        similarity(lower(ml.city), lower(search_term)),
        similarity(lower(ml.state), lower(search_term))
      ) as similarity
    from magician_locations ml
    where 
      similarity(lower(ml.city), lower(search_term)) > similarity_threshold
      or similarity(lower(ml.state), lower(search_term)) > similarity_threshold
  ),
  location_counts as (
    select 
      ml.city,
      ml.state,
      ml.slug,
      count(distinct m.id) as magician_count
    from magician_locations ml
    left join magicians m on ml.magician_id = m.id
    group by ml.city, ml.state, ml.slug
  )
  select 
    lm.city,
    lm.state,
    lm.slug,
    lm.similarity,
    coalesce(lc.magician_count, 0) as magician_count
  from location_matches lm
  left join location_counts lc 
    on lm.city = lc.city 
    and lm.state = lc.state
    and lm.slug = lc.slug
  order by lm.similarity desc, lc.magician_count desc
  limit 10;
end;
$$;
