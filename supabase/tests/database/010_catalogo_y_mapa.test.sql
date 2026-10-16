begin;
create extension if not exists pgtap with schema extensions;
select plan(17);

delete from public.churches;

-- Tres iglesias en Las Palmas, una en Telde y una en Madrid.
insert into public.churches (name, slug, denomination, island, city, region, country, latitude, longitude, languages, verified)
values
  ('Iglesia de San Andrés', 'san-andres', 'Evangélica', 'Gran Canaria', 'Las Palmas', 'Canarias', 'España', 28.1000, -15.4100, '{Español,English}', true),
  ('Holy Trinity', 'holy-trinity', 'Anglicana', 'Gran Canaria', 'Las Palmas', 'Canarias', 'España', 28.1300, -15.4300, '{English}', true),
  ('Parroquia de Santa Ana', 'santa-ana', 'Católica', 'Gran Canaria', 'Las Palmas', 'Canarias', 'España', 28.1010, -15.4150, '{Español}', false),
  ('Iglesia de San Juan', 'san-juan', 'Católica', 'Gran Canaria', 'Telde', 'Canarias', 'España', 27.9950, -15.4170, '{Español}', false),
  ('Catedral de la Almudena', 'almudena', 'Católica', null, 'Madrid', 'Comunidad de Madrid', 'España', 40.4158, -3.7144, '{Español}', false);

-- ------------------------------------------------------------ Lo que cabe en el mapa
select set_config('role', 'anon', true);

select is(
  (select count(*) from public.churches_in_view(27.9, -15.6, 28.2, -15.3)),
  4::bigint,
  'El mapa de Gran Canaria devuelve sus cuatro iglesias, una a una'
);
select is(
  (select count(*) from public.churches_in_view(27.9, -15.6, 28.2, -15.3) where point_count <> 1),
  0::bigint,
  'Con pocas iglesias no se agrupa nada'
);
select is(
  (select count(*) from public.churches_in_view(27.9, -15.6, 28.2, -15.3, array['Católica'])),
  2::bigint,
  'El filtro de denominación se aplica en el servidor'
);
select is(
  (select count(*) from public.churches_in_view(27.9, -15.6, 28.2, -15.3, null, array['English'])),
  2::bigint,
  'El filtro de idioma encuentra las que ofrecen ese idioma'
);
select is(
  (select count(*) from public.churches_in_view(27.9, -15.6, 28.2, -15.3, null, null, true)),
  2::bigint,
  'Se puede pedir solo las verificadas'
);
select is(
  (select sum(point_count) from public.churches_in_view(27.0, -19.0, 44.0, 5.0, null, null, false, 3)),
  5::bigint,
  'Al superar el máximo se agrupa, y los grupos suman todas las iglesias'
);
select ok(
  (select count(*) from public.churches_in_view(27.0, -19.0, 44.0, 5.0, null, null, false, 3)) < 5,
  'Agrupadas ocupan menos marcadores que iglesias hay'
);
select is(
  (select name from public.churches_in_view(27.0, -19.0, 44.0, 5.0, null, null, false, 3) where point_count = 1),
  'Catedral de la Almudena',
  'Una celda con una sola iglesia la devuelve tal cual, no como grupo'
);

-- ------------------------------------------------------------------ Las más cercanas
select is(
  (select string_agg(name, ' > ' order by distance_km) from public.churches_near(28.1, -15.41, 5)),
  'Iglesia de San Andrés > Parroquia de Santa Ana > Holy Trinity',
  'Devuelve las que están dentro del radio, de la más cercana a la más lejana'
);
select ok(
  (select distance_km between 11 and 12.5 from public.churches_near(28.1, -15.41, 20) where name = 'Iglesia de San Juan'),
  'La distancia a Telde es la real, unos 12 km'
);
select is(
  (select count(*) from public.churches_near(28.1, -15.41, 20, null, null, false, 2)),
  2::bigint,
  'Respeta el máximo de resultados'
);

-- ---------------------------------------------------------------------------- Buscar
select is(
  (select name from public.churches_search('san andres')),
  'Iglesia de San Andrés',
  'La búsqueda no distingue tildes ni mayúsculas'
);
select is(
  (select count(*) from public.churches_search('madrid')),
  1::bigint,
  'También busca por localidad'
);
select is(
  (select count(*) from public.churches_search('a')),
  0::bigint,
  'Con menos de dos letras no busca'
);
select is(
  (select name from public.churches_search('iglesia', 27.99, -15.41) limit 1),
  'Iglesia de San Juan',
  'Con un punto de referencia, primero la más cercana'
);

-- ------------------------------------------------------------------------- Permisos
select throws_ok(
  $$ insert into public.churches (name, slug, denomination) values ('Falsa', 'falsa', 'Evangélica') $$,
  '42501',
  null,
  'Quien no ha iniciado sesión no puede añadir iglesias'
);
select throws_ok(
  $$ update public.churches set verified = true $$,
  '42501',
  null,
  'Ni modificar las que hay'
);

select * from finish();
rollback;
