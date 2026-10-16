-- Prepara `churches` para pasar de un puñado de iglesias dadas de alta a mano a decenas de
-- miles importadas de OpenStreetMap, y mueve al servidor lo que la app hacía descargando
-- la tabla entera: ver solo lo que cabe en el mapa, agrupar marcadores, buscar por cercanía
-- y por texto.

-- ---------------------------------------------------------------------------
-- Columnas nuevas
-- ---------------------------------------------------------------------------

alter table public.churches
  -- De dónde sale la ficha. Las de OSM entran sin verificar y sin horarios.
  add column source text not null default 'manual'
    constraint churches_source_check check (source in ('manual', 'osm')),
  -- «node/123», «way/456»… Permite reimportar sin duplicar.
  add column osm_id text,
  -- Tipo de templo, para distinguirlo en el mapa.
  add column category text not null default 'iglesia'
    constraint churches_category_check
    check (category in ('iglesia', 'catedral', 'capilla', 'ermita', 'monasterio')),
  -- Comunidad autónoma.
  add column region text,
  add constraint churches_osm_id_key unique (osm_id),
  add constraint churches_osm_con_id check ((source = 'osm') = (osm_id is not null));

-- La isla era obligatoria cuando solo había iglesias de Canarias.
alter table public.churches alter column island drop not null;

-- Todo lo que consulta el mapa filtra por un rectángulo de coordenadas.
create index churches_coordenadas_idx on public.churches (latitude, longitude)
  where latitude is not null and longitude is not null;

-- Búsqueda sin distinguir tildes: «san andres» encuentra «San Andrés».
create extension if not exists unaccent with schema extensions;

-- ---------------------------------------------------------------------------
-- Lo que cabe en el mapa
-- ---------------------------------------------------------------------------

-- Devuelve los templos del rectángulo visible. Si son pocos, uno a uno; si pasan de
-- `max_points`, agrupados en una rejilla: cada celda devuelve su centro y cuántos tiene
-- (`point_count`). Una celda con un solo templo lo devuelve tal cual.
create function public.churches_in_view(
  min_lat double precision,
  min_lon double precision,
  max_lat double precision,
  max_lon double precision,
  denominations text[] default null,
  languages text[] default null,
  only_verified boolean default false,
  max_points integer default 150
)
returns table (
  id uuid,
  name text,
  denomination text,
  category text,
  verified boolean,
  latitude double precision,
  longitude double precision,
  point_count integer
)
language sql
stable
set search_path = ''
as $$
  with visibles as (
    select c.id, c.name, c.denomination, c.category, c.verified, c.latitude, c.longitude
    from public.churches c
    where c.latitude between min_lat and max_lat
      and c.longitude between min_lon and max_lon
      and (denominations is null or c.denomination = any (denominations))
      -- El parámetro se llama igual que la columna: hay que nombrarlo con la función.
      and (churches_in_view.languages is null or c.languages && churches_in_view.languages)
      and (not only_verified or c.verified)
  ),
  total as (
    select count(*) as n from visibles
  ),
  celdas as (
    -- Rejilla de 7 x 5: suficiente para leer el reparto sin llenar la pantalla de globos.
    select
      count(*) as n,
      avg(v.latitude) as latitude,
      avg(v.longitude) as longitude,
      -- El representante de la celda: primero los verificados.
      (array_agg(v.id order by v.verified desc, v.name))[1] as representante
    from visibles v
    group by
      floor((v.latitude - min_lat) / nullif((max_lat - min_lat) / 7, 0)),
      floor((v.longitude - min_lon) / nullif((max_lon - min_lon) / 5, 0))
  )
  select v.id, v.name, v.denomination, v.category, v.verified, v.latitude, v.longitude, 1
  from visibles v
  where (select n from total) <= max_points
  union all
  select
    v.id, v.name, v.denomination, v.category, v.verified,
    case when c.n = 1 then v.latitude else c.latitude end,
    case when c.n = 1 then v.longitude else c.longitude end,
    c.n::integer
  from celdas c
  join visibles v on v.id = c.representante
  where (select n from total) > max_points;
$$;

-- ---------------------------------------------------------------------------
-- Las más cercanas
-- ---------------------------------------------------------------------------

-- Templos a menos de `radius_km` de un punto, del más cercano al más lejano. Primero
-- acota por un rectángulo (usa el índice) y después mide la distancia real.
create function public.churches_near(
  lat double precision,
  lon double precision,
  radius_km double precision default 10,
  denominations text[] default null,
  languages text[] default null,
  only_verified boolean default false,
  max_results integer default 50
)
returns table (
  id uuid,
  name text,
  denomination text,
  category text,
  verified boolean,
  address text,
  city text,
  island text,
  region text,
  latitude double precision,
  longitude double precision,
  distance_km double precision
)
language sql
stable
set search_path = ''
as $$
  select *
  from (
    select
      c.id, c.name, c.denomination, c.category, c.verified, c.address, c.city, c.island,
      c.region, c.latitude, c.longitude,
      -- Fórmula del semiverseno, con el radio medio de la Tierra en kilómetros.
      2 * 6371 * asin(sqrt(
        power(sin(radians(c.latitude - lat) / 2), 2)
        + cos(radians(lat)) * cos(radians(c.latitude)) * power(sin(radians(c.longitude - lon) / 2), 2)
      )) as distance_km
    from public.churches c
    where c.latitude between lat - radius_km / 111.0 and lat + radius_km / 111.0
      and c.longitude between lon - radius_km / (111.0 * greatest(cos(radians(lat)), 0.01))
                          and lon + radius_km / (111.0 * greatest(cos(radians(lat)), 0.01))
      and (denominations is null or c.denomination = any (denominations))
      and (churches_near.languages is null or c.languages && churches_near.languages)
      and (not only_verified or c.verified)
  ) cercanas
  where cercanas.distance_km <= radius_km
  order by cercanas.distance_km
  limit least(greatest(max_results, 1), 200);
$$;

-- ---------------------------------------------------------------------------
-- Buscar por nombre o localidad
-- ---------------------------------------------------------------------------

-- Con un punto de referencia ordena por cercanía; sin él, las verificadas primero.
create function public.churches_search(
  query text,
  near_lat double precision default null,
  near_lon double precision default null,
  max_results integer default 30
)
returns table (
  id uuid,
  name text,
  denomination text,
  category text,
  verified boolean,
  city text,
  island text,
  region text,
  latitude double precision,
  longitude double precision
)
language sql
stable
set search_path = ''
as $$
  select c.id, c.name, c.denomination, c.category, c.verified, c.city, c.island, c.region,
         c.latitude, c.longitude
  from public.churches c
  where char_length(trim(query)) >= 2
    and (
      extensions.unaccent(c.name) ilike '%' || extensions.unaccent(trim(query)) || '%'
      or extensions.unaccent(coalesce(c.city, '')) ilike '%' || extensions.unaccent(trim(query)) || '%'
      or extensions.unaccent(coalesce(c.island, '')) ilike extensions.unaccent(trim(query)) || '%'
    )
  order by
    case
      when near_lat is null or near_lon is null or c.latitude is null then null
      else power(c.latitude - near_lat, 2) + power((c.longitude - near_lon) * cos(radians(near_lat)), 2)
    end nulls last,
    c.verified desc,
    c.name
  limit least(greatest(max_results, 1), 100);
$$;

-- Las tres leen `churches` con los permisos de quien llama: la política de lectura pública
-- de la tabla sigue siendo la que manda.
grant execute on function public.churches_in_view(
  double precision, double precision, double precision, double precision, text[], text[], boolean, integer
) to anon, authenticated;
grant execute on function public.churches_near(
  double precision, double precision, double precision, text[], text[], boolean, integer
) to anon, authenticated;
grant execute on function public.churches_search(text, double precision, double precision, integer)
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Permisos de escritura
-- ---------------------------------------------------------------------------

-- Las tablas tenían concedido todo a cualquiera y dependían solo de las políticas RLS.
-- Se retira lo que la app nunca debe hacer, para que un descuido en una política no
-- abra la escritura: quien no ha iniciado sesión solo lee, y propone iglesias.
revoke insert, update, delete, truncate on public.churches, public.service_times from anon;
revoke update, delete, truncate on public.church_submissions from anon;
revoke truncate on public.churches, public.service_times, public.church_submissions from authenticated;
