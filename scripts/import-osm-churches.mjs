// Descarga de OpenStreetMap los templos cristianos de España y genera las migraciones SQL
// que los cargan en `churches`. Datos © colaboradores de OpenStreetMap, licencia ODbL.
//
//   node scripts/import-osm-churches.mjs            descarga y genera el SQL
//   node scripts/import-osm-churches.mjs --offline  regenera el SQL desde la caché local
//
// Reejecutarlo es seguro: cada templo lleva su identificador de OSM y la carga actualiza
// los que ya existen en vez de duplicarlos. Los que un administrador haya verificado no
// se tocan.
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';

const SERVERS = [
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const AGENT = { 'User-Agent': 'Churchly/1.0 (importador de templos; felipecontactolp@gmail.com)' };
const CACHE = 'scripts/.cache/osm-churches.json';
const BOUNDARIES = 'scripts/.cache/boundaries.json';
const MIGRATIONS = 'supabase/migrations';
/** Prefijo de las migraciones que genera este script; al regenerar se sustituyen. */
const PREFIX = '202611010';
const ROWS_PER_FILE = 4000;

/**
 * Comunidades y ciudades autónomas: nombre que guarda la app y cómo pedir su contorno.
 * Canarias va la primera.
 */
const REGIONS = [
  ['Canarias', 'Canarias, España'],
  ['Andalucía', 'Andalucía, España'],
  ['Aragón', 'Aragón, España'],
  ['Asturias', 'Principado de Asturias, España'],
  ['Illes Balears', 'Illes Balears, España'],
  ['Cantabria', 'Cantabria, España'],
  ['Castilla-La Mancha', 'Castilla-La Mancha, España'],
  ['Castilla y León', 'Castilla y León, España'],
  ['Cataluña', 'Catalunya, España'],
  ['Extremadura', 'Extremadura, España'],
  ['Galicia', 'Galicia, España'],
  ['Comunidad de Madrid', 'Comunidad de Madrid, España'],
  ['Región de Murcia', 'Región de Murcia, España'],
  ['Navarra', 'Navarra, España'],
  ['País Vasco', 'Euskadi, España'],
  ['La Rioja', 'La Rioja, España'],
  ['Comunidad Valenciana', 'Comunitat Valenciana, España'],
  ['Ceuta', 'Ceuta, España'],
  ['Melilla', 'Melilla, España'],
];

/** Vecinos: lo que caiga dentro de ellos se descarta aunque esté pegado a la frontera. */
const NEIGHBOURS = ['Portugal', 'France', 'Andorra', 'Morocco', 'Gibraltar'];

/** Rectángulos que cubren España [sur, oeste, norte, este], troceados después en teselas. */
const AREAS = [
  [27.5, -18.3, 29.5, -13.3], // Canarias
  [35.9, -9.4, 43.9, 4.4], // Península y Baleares
  [35.2, -5.5, 35.9, -2.8], // Ceuta y Melilla
];
const TILE = 2;
/** Un templo en la costa puede quedar fuera del contorno simplificado: margen en km. */
const COAST_MARGIN_KM = 2;

/** Islas, por caja de coordenadas [sur, oeste, norte, este]. Solo Canarias y Baleares. */
const ISLANDS = [
  ['El Hierro', 27.6, -18.2, 27.9, -17.85],
  ['La Palma', 28.4, -18.05, 28.9, -17.7],
  ['La Gomera', 27.98, -17.4, 28.25, -17.05],
  ['Tenerife', 27.95, -16.95, 28.62, -16.08],
  ['Gran Canaria', 27.7, -15.9, 28.2, -15.3],
  ['Fuerteventura', 28.0, -14.55, 28.78, -13.78],
  ['La Graciosa', 29.2, -13.57, 29.31, -13.45],
  ['Lanzarote', 28.8, -13.95, 29.25, -13.38],
  ['Formentera', 38.63, 1.35, 38.82, 1.62],
  ['Ibiza', 38.82, 1.15, 39.13, 1.66],
  ['Mallorca', 39.25, 2.3, 39.98, 3.5],
  ['Menorca', 39.78, 3.75, 40.1, 4.35],
];

/** Etiqueta `denomination` de OSM -> nombre que usa la app. Lo no reconocido es «Cristiana». */
const DENOMINATIONS = [
  [/catholic/, 'Católica'],
  [/orthodox/, 'Ortodoxa'],
  [/anglican|episcopal/, 'Anglicana'],
  [/baptist/, 'Bautista'],
  [/assemblies_of_god/, 'Asambleas de Dios'],
  [/pentecostal|charismatic/, 'Pentecostal'],
  [/adventist/, 'Adventista'],
  [/lutheran/, 'Luterana'],
  [/methodist/, 'Metodista'],
  [/presbyterian|reformed|calvinist/, 'Reformada'],
  [/jehovah/, 'Testigos de Jehová'],
  [/mormon|latter_day/, 'Santos de los Últimos Días'],
  [/evangelical|protestant|brethren|nondenominational/, 'Evangélica'],
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function overpass(query) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    for (const server of SERVERS) {
      try {
        const response = await fetch(server, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...AGENT },
          body: `data=${encodeURIComponent(query)}`,
          signal: AbortSignal.timeout(240000),
        });
        const text = await response.text();
        if (response.ok && text.startsWith('{')) return JSON.parse(text).elements;
        lastError = new Error(`${server}: ${response.status}`);
      } catch (error) {
        lastError = error;
      }
    }
    await sleep(15000);
  }
  throw lastError;
}

function denominationOf(tags) {
  const raw = (tags.denomination ?? '').toLowerCase();
  if (!raw) return 'Cristiana';
  return DENOMINATIONS.find(([pattern]) => pattern.test(raw))?.[1] ?? 'Cristiana';
}

/** Tipo de templo, para pintarlo distinto en el mapa. */
function categoryOf(tags) {
  const name = tags.name.toLowerCase();
  const building = tags.building ?? '';
  if (building === 'cathedral' || /^(santa iglesia )?(con)?catedral\b|\bseu\b/.test(name)) return 'catedral';
  if (building === 'monastery' || /^(real )?(monasterio|convento|abad[ií]a|monestir)\b/.test(name)) return 'monasterio';
  if (/^(ermita|ermida|santuario|santuari)\b/.test(name)) return 'ermita';
  if (building === 'chapel' || /^(capilla|capela|capella|oratorio)\b/.test(name)) return 'capilla';
  return 'iglesia';
}

function islandOf(lat, lon) {
  return ISLANDS.find(([, south, west, north, east]) => lat >= south && lat <= north && lon >= west && lon <= east)?.[0] ?? null;
}

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function clean(value, max = 200) {
  const text = (value ?? '').replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, max) : null;
}

function websiteOf(tags) {
  const url = clean(tags.website ?? tags['contact:website'], 300);
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function toChurch(element, region) {
  const tags = element.tags ?? {};
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  const name = clean(tags['name:es'] ?? tags.name, 160);
  if (!name || latitude == null || longitude == null) return null;

  const street = clean([tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' '));
  const osmId = `${element.type}/${element.id}`;
  return {
    osm_id: osmId,
    name,
    slug: `${slugify(name) || 'templo'}-${element.type[0]}${element.id}`,
    denomination: denominationOf(tags),
    category: categoryOf({ ...tags, name }),
    address: street,
    city: clean(tags['addr:city'] ?? tags['addr:place'] ?? tags['addr:hamlet'], 100),
    island: islandOf(latitude, longitude),
    region,
    country: 'España',
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
    website: websiteOf(tags),
    phone: clean(tags.phone ?? tags['contact:phone'], 40),
  };
}

/** Contorno de un territorio (GeoJSON simplificado), con caché en disco. */
async function boundaries() {
  if (existsSync(BOUNDARIES)) return JSON.parse(readFileSync(BOUNDARIES, 'utf8'));
  const result = { regions: [], neighbours: [] };
  const fetchShape = async (params) => {
    const url = `https://nominatim.openstreetmap.org/search?${params}&format=jsonv2&polygon_geojson=1&polygon_threshold=0.002&limit=1`;
    const response = await fetch(url, { headers: AGENT, signal: AbortSignal.timeout(60000) });
    const [match] = await response.json();
    if (!match || !/Polygon/.test(match.geojson?.type ?? '')) throw new Error(`sin contorno: ${params}`);
    await sleep(1500);
    return { found: match.display_name, geojson: match.geojson };
  };
  for (const [name, query] of REGIONS) {
    const shape = await fetchShape(`q=${encodeURIComponent(query)}`);
    console.log(`contorno ${name} <- ${shape.found}`);
    result.regions.push({ name, geojson: shape.geojson });
  }
  for (const country of NEIGHBOURS) {
    const shape = await fetchShape(`country=${encodeURIComponent(country)}`);
    console.log(`contorno ${country} <- ${shape.found}`);
    result.neighbours.push({ name: country, geojson: shape.geojson });
  }
  writeFileSync(BOUNDARIES, JSON.stringify(result));
  return result;
}

/** Anillos de un contorno, con su caja para descartar rápido. */
function prepare(territory) {
  const polygons = territory.geojson.type === 'Polygon' ? [territory.geojson.coordinates] : territory.geojson.coordinates;
  return {
    name: territory.name,
    polygons: polygons.map((rings) => {
      const outer = rings[0];
      const lons = outer.map((point) => point[0]);
      const lats = outer.map((point) => point[1]);
      return { rings, box: [Math.min(...lats), Math.min(...lons), Math.max(...lats), Math.max(...lons)] };
    }),
  };
}

function inRing(lat, lon, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function contains(territory, lat, lon) {
  return territory.polygons.some(
    ({ rings, box }) =>
      lat >= box[0] && lat <= box[2] && lon >= box[1] && lon <= box[3] &&
      inRing(lat, lon, rings[0]) &&
      !rings.slice(1).some((hole) => inRing(lat, lon, hole)),
  );
}

/** Distancia en km al vértice más cercano del contorno; basta para el margen de costa. */
function distanceTo(territory, lat, lon) {
  const margin = 0.05;
  let best = Infinity;
  for (const { rings, box } of territory.polygons) {
    if (lat < box[0] - margin || lat > box[2] + margin || lon < box[1] - margin || lon > box[3] + margin) continue;
    for (const [x, y] of rings[0]) {
      const dx = (x - lon) * 111 * Math.cos((lat * Math.PI) / 180);
      const dy = (y - lat) * 111;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < best) best = distance;
    }
  }
  return best;
}

function regionOf(shapes, lat, lon) {
  const inside = shapes.regions.find((region) => contains(region, lat, lon));
  if (inside) return inside.name;
  if (shapes.neighbours.some((country) => contains(country, lat, lon))) return null;
  // Fuera de todo contorno: costa o islote. Se asigna a la comunidad que tenga al lado.
  let nearest = null;
  let best = COAST_MARGIN_KM;
  for (const region of shapes.regions) {
    const distance = distanceTo(region, lat, lon);
    if (distance < best) {
      best = distance;
      nearest = region.name;
    }
  }
  return nearest;
}

async function download() {
  const raw = await boundaries();
  const shapes = { regions: raw.regions.map(prepare), neighbours: raw.neighbours.map(prepare) };
  const churches = new Map();
  let outside = 0;

  for (const [south, west, north, east] of AREAS) {
    for (let lat = south; lat < north; lat += TILE) {
      for (let lon = west; lon < east; lon += TILE) {
        const box = [lat, lon, Math.min(lat + TILE, north), Math.min(lon + TILE, east)].map((n) => n.toFixed(4));
        const elements = await overpass(
          `[out:json][timeout:200];nwr["amenity"="place_of_worship"]["religion"="christian"]["name"](${box.join(',')});out center tags;`,
        );
        let added = 0;
        for (const element of elements) {
          const latitude = element.lat ?? element.center?.lat;
          const longitude = element.lon ?? element.center?.lon;
          if (latitude == null || longitude == null) continue;
          const region = regionOf(shapes, latitude, longitude);
          if (!region) {
            outside += 1;
            continue;
          }
          const church = toChurch(element, region);
          if (church && !churches.has(church.osm_id)) {
            churches.set(church.osm_id, church);
            added += 1;
          }
        }
        console.log(`tesela ${box.join(',')}: ${elements.length} en OSM, ${added} en España`);
        await sleep(3000);
      }
    }
  }
  console.log(`descartados por estar fuera de España: ${outside}`);
  return [...churches.values()];
}

const sql = (value) => (value == null ? 'null' : `'${String(value).replace(/'/g, "''")}'`);

const COLUMNS = [
  'osm_id', 'name', 'slug', 'denomination', 'category', 'address', 'city', 'island', 'region',
  'country', 'latitude', 'longitude', 'website', 'phone',
];

function writeMigrations(churches) {
  for (const file of readdirSync(MIGRATIONS)) {
    if (file.startsWith(PREFIX)) unlinkSync(`${MIGRATIONS}/${file}`);
  }
  const sorted = [...churches].sort((a, b) => a.osm_id.localeCompare(b.osm_id));
  let files = 0;
  for (let start = 0; start < sorted.length; start += ROWS_PER_FILE) {
    const rows = sorted.slice(start, start + ROWS_PER_FILE).map(
      (church) =>
        `  (${COLUMNS.map((column) =>
          column === 'latitude' || column === 'longitude' ? church[column] : sql(church[column]),
        ).join(', ')})`,
    );
    const body =
      `-- Templos de OpenStreetMap (© colaboradores de OpenStreetMap, ODbL). Generado por\n` +
      `-- scripts/import-osm-churches.mjs; no editar a mano.\n\n` +
      `insert into public.churches (${COLUMNS.join(', ')}, source, verified)\nvalues\n` +
      rows.map((row) => row.replace(/\)$/, ", 'osm', false)")).join(',\n') +
      `\non conflict (osm_id) do update set\n` +
      COLUMNS.filter((column) => column !== 'osm_id' && column !== 'slug')
        .map((column) => `  ${column} = excluded.${column}`)
        .join(',\n') +
      `\n-- Lo que un administrador ya ha revisado no se pisa con datos de OSM.\nwhere not churches.verified;\n`;
    const number = String(files + 1).padStart(5, '0');
    writeFileSync(`${MIGRATIONS}/${PREFIX}${number}_osm_churches_${number}.sql`, body);
    files += 1;
  }
  return files;
}

let churches;
if (process.argv.includes('--offline')) {
  churches = JSON.parse(readFileSync(CACHE, 'utf8'));
} else {
  if (!existsSync('scripts/.cache')) mkdirSync('scripts/.cache', { recursive: true });
  churches = await download();
  writeFileSync(CACHE, JSON.stringify(churches));
}

const count = (key) =>
  Object.entries(
    churches.reduce((totals, church) => ({ ...totals, [church[key]]: (totals[church[key]] ?? 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1]);

const files = writeMigrations(churches);
console.log(`\n${churches.length} templos en ${files} migraciones`);
console.log('por comunidad:', count('region'));
console.log('por denominación:', count('denomination'));
console.log('por tipo:', count('category'));
