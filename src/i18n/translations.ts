export type Language = 'es' | 'en';

type Dictionary = {
  tabNear: string;
  tabMap: string;
  tabSaved: string;
  tabSettings: string;

  // Portada: las más cercanas
  homeTitle: string;
  homeSubtitle: (count: number, km: number) => string;
  homeSubtitleDefault: string;
  homeLocating: string;
  homeRadiusLabel: string;
  nearestChurch: string;
  homeMore: string;
  openMap: string;
  openSettings: string;
  homeNoLocationTitle: string;
  homeNoLocationDenied: string;
  homeNoLocationUnavailable: string;
  homeEmptyTitle: (km: number) => string;
  homeEmptyBody: string;
  homeEmptyFilters: string;
  homeWiden: (km: number) => string;

  // Mapa
  mapAccessibilityLabel: string;
  searchPlaceholder: string;
  filters: string;
  filtersActive: (count: number) => string;
  myLocation: string;
  seeList: string;
  nearYou: string;
  inThisArea: string;
  churchesCount: (count: number) => string;
  clusterLabel: (count: number) => string;
  zoomToSeeChurches: string;
  noChurchesHere: string;
  noChurchesHereHint: string;
  mapError: string;
  retry: string;
  locationDenied: string;

  // Búsqueda
  searchTitle: string;
  searchHint: string;
  searchEmpty: (query: string) => string;
  searchError: string;

  // Filtros
  filtersTitle: string;
  filterDenomination: string;
  filterLanguage: string;
  filterVerified: string;
  filterVerifiedHelp: string;
  clearFilters: string;
  showResults: string;
  close: string;
  back: string;

  // Lista y tarjetas
  listTitle: string;
  listSubtitleNear: (km: number) => string;
  listEmpty: string;
  verified: string;
  unverified: string;
  distanceKm: (km: number) => string;
  distanceM: (m: number) => string;
  categories: Record<string, string>;

  // Ficha
  churchLoading: string;
  churchNotFound: string;
  churchError: string;
  verifiedBadge: string;
  verifiedHelp: string;
  osmBadge: string;
  osmHelp: string;
  directions: string;
  call: string;
  website: string;
  instagram: string;
  save: string;
  saved: string;
  share: string;
  shareMessage: (name: string, place: string) => string;
  seeOnMap: string;
  nextService: string;
  today: string;
  tomorrow: string;
  scheduleTitle: string;
  noSchedules: string;
  noSchedulesOsm: string;
  serviceLanguage: (lang: string) => string;
  dayNames: string[];
  aboutTitle: string;
  languagesTitle: string;
  whereTitle: string;
  addressUnknown: string;
  suggestEdit: string;
  suggestEditSubject: (name: string) => string;

  // Guardadas
  savedTitle: string;
  savedSubtitle: string;
  savedEmptyTitle: string;
  savedEmptyBody: string;
  exploreMap: string;

  // Ajustes
  settingsTitle: string;
  settingsSubtitle: string;
  settingsLanguage: string;
  settingsLanguageHelp: string;
  languageNameSpanish: string;
  languageNameEnglish: string;
  settingsChurches: string;
  addChurch: string;
  addChurchHelp: string;
  settingsAbout: string;
  aboutBody: string;
  dataCredits: string;
  dataCreditsBody: string;
  contact: string;
};

const es: Dictionary = {
  tabNear: 'Cerca',
  tabMap: 'Mapa',
  tabSaved: 'Guardadas',
  tabSettings: 'Ajustes',

  homeTitle: 'Cerca de ti',
  homeSubtitle: (count, km) =>
    `${count === 1 ? '1 iglesia' : `${count} iglesias`} a menos de ${km} km, la más cercana primero.`,
  homeSubtitleDefault: 'Las iglesias más cercanas a ti, la primera la que tienes más a mano.',
  homeLocating: 'Buscando las iglesias más cercanas…',
  homeRadiusLabel: 'Distancia máxima',
  nearestChurch: 'La más cercana',
  homeMore: 'También cerca',
  openMap: 'Ver en el mapa',
  openSettings: 'Abrir ajustes',
  homeNoLocationTitle: 'No sabemos dónde estás',
  homeNoLocationDenied:
    'Churchly necesita tu ubicación para ordenar las iglesias por cercanía. Actívala en los ajustes, o explora el mapa.',
  homeNoLocationUnavailable:
    'No hemos podido obtener tu ubicación. Inténtalo de nuevo o explora el mapa.',
  homeEmptyTitle: (km) => `Ninguna iglesia a menos de ${km} km`,
  homeEmptyBody: 'Prueba con una distancia mayor o mira el mapa.',
  homeEmptyFilters: 'Con los filtros que tienes puestos no hay ninguna. Quita alguno o amplía la distancia.',
  homeWiden: (km) => `Buscar hasta ${km} km`,

  mapAccessibilityLabel: 'Mapa de iglesias',
  searchPlaceholder: 'Busca una iglesia o una localidad',
  filters: 'Filtros',
  filtersActive: (count) => `Filtros, ${count} ${count === 1 ? 'activo' : 'activos'}`,
  myLocation: 'Ir a mi ubicación',
  seeList: 'Ver lista',
  nearYou: 'Cerca de ti',
  inThisArea: 'En esta zona',
  churchesCount: (count) => (count === 1 ? '1 iglesia' : `${count} iglesias`),
  clusterLabel: (count) => `${count} iglesias en esta zona. Toca para acercar`,
  zoomToSeeChurches: 'Acerca el mapa para ver cada iglesia',
  noChurchesHere: 'No hay iglesias en esta zona',
  noChurchesHereHint: 'Mueve el mapa o quita algún filtro.',
  mapError: 'No se han podido cargar las iglesias. Comprueba tu conexión.',
  retry: 'Reintentar',
  locationDenied: 'Sin acceso a tu ubicación. Puedes mover el mapa o buscar una localidad.',

  searchTitle: 'Buscar',
  searchHint: 'Escribe el nombre de una iglesia, una ciudad o una isla.',
  searchEmpty: (query) => `No hemos encontrado nada para «${query}».`,
  searchError: 'No se ha podido buscar. Comprueba tu conexión.',

  filtersTitle: 'Filtros',
  filterDenomination: 'Tradición',
  filterLanguage: 'Idioma del culto',
  filterVerified: 'Solo verificadas',
  filterVerifiedHelp: 'Iglesias cuyos datos y horarios ha confirmado su propia comunidad.',
  clearFilters: 'Quitar filtros',
  showResults: 'Ver iglesias',
  close: 'Cerrar',
  back: 'Volver',

  listTitle: 'Iglesias cercanas',
  listSubtitleNear: (km) => `A menos de ${km} km de ti, de la más cercana a la más lejana.`,
  listEmpty: 'No hay iglesias con esos filtros a esta distancia.',
  verified: 'Verificada',
  unverified: 'Sin verificar',
  distanceKm: (km) => `${km.toFixed(km < 10 ? 1 : 0).replace('.', ',')} km`,
  distanceM: (m) => `${m} m`,
  categories: {
    iglesia: 'Iglesia',
    catedral: 'Catedral',
    capilla: 'Capilla',
    ermita: 'Ermita',
    monasterio: 'Monasterio',
  },

  churchLoading: 'Cargando iglesia…',
  churchNotFound: 'No hemos encontrado esta iglesia.',
  churchError: 'No se ha podido cargar la iglesia. Comprueba tu conexión.',
  verifiedBadge: 'Verificada',
  verifiedHelp: 'Su comunidad ha confirmado estos datos y horarios.',
  osmBadge: 'Sin verificar',
  osmHelp:
    'Ubicación tomada de OpenStreetMap. Nadie de esta iglesia ha confirmado los datos, y puede que falten los horarios.',
  directions: 'Cómo llegar',
  call: 'Llamar',
  website: 'Web',
  instagram: 'Instagram',
  save: 'Guardar',
  saved: 'Guardada',
  share: 'Compartir',
  shareMessage: (name, place) => `${name}${place ? `, ${place}` : ''}. La he encontrado en Churchly:`,
  seeOnMap: 'Ver en el mapa',
  nextService: 'Próximo culto',
  today: 'Hoy',
  tomorrow: 'Mañana',
  scheduleTitle: 'Horarios',
  noSchedules: 'Esta iglesia todavía no ha publicado sus horarios.',
  noSchedulesOsm: 'No tenemos los horarios de esta iglesia. Consulta su web o llama antes de ir.',
  serviceLanguage: (lang) => `en ${lang}`,
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  aboutTitle: 'Sobre esta iglesia',
  languagesTitle: 'Idiomas',
  whereTitle: 'Dónde está',
  addressUnknown: 'Sin dirección exacta',
  suggestEdit: '¿Algún dato incorrecto? Avísanos',
  suggestEditSubject: (name) => `Corrección de datos: ${name}`,

  savedTitle: 'Guardadas',
  savedSubtitle: 'Tus iglesias, siempre a mano.',
  savedEmptyTitle: 'Aún no has guardado ninguna',
  savedEmptyBody: 'Toca «Guardar» en la ficha de una iglesia para tenerla aquí.',
  exploreMap: 'Explorar el mapa',

  settingsTitle: 'Ajustes',
  settingsSubtitle: 'Idioma, tu iglesia y de dónde salen los datos.',
  settingsLanguage: 'Idioma de la app',
  settingsLanguageHelp: 'Elige en qué idioma quieres ver Churchly.',
  languageNameSpanish: 'Español',
  languageNameEnglish: 'English',
  settingsChurches: '¿Eres de una iglesia?',
  addChurch: 'Añadir o verificar mi iglesia',
  addChurchHelp:
    'Envía los datos y los horarios de tu comunidad. Los revisamos y aparecerá como verificada.',
  settingsAbout: 'Sobre Churchly',
  aboutBody: 'Churchly te ayuda a encontrar una iglesia cerca de ti, estés donde estés.',
  dataCredits: 'Datos del mapa',
  dataCreditsBody:
    'Las ubicaciones sin verificar proceden de OpenStreetMap, © colaboradores de OpenStreetMap, con licencia ODbL.',
  contact: 'Escríbenos',
};

const en: Dictionary = {
  tabNear: 'Nearby',
  tabMap: 'Map',
  tabSaved: 'Saved',
  tabSettings: 'Settings',

  homeTitle: 'Near you',
  homeSubtitle: (count, km) =>
    `${count === 1 ? '1 church' : `${count} churches`} within ${km} km, nearest first.`,
  homeSubtitleDefault: 'The churches closest to you, starting with the nearest.',
  homeLocating: 'Finding the nearest churches…',
  homeRadiusLabel: 'Maximum distance',
  nearestChurch: 'Nearest',
  homeMore: 'Also nearby',
  openMap: 'See on the map',
  openSettings: 'Open settings',
  homeNoLocationTitle: "We don't know where you are",
  homeNoLocationDenied:
    'Churchly needs your location to sort churches by distance. Turn it on in settings, or explore the map.',
  homeNoLocationUnavailable: "We couldn't get your location. Try again or explore the map.",
  homeEmptyTitle: (km) => `No churches within ${km} km`,
  homeEmptyBody: 'Try a larger distance or look at the map.',
  homeEmptyFilters: 'Nothing matches your filters. Remove one or widen the distance.',
  homeWiden: (km) => `Search up to ${km} km`,

  mapAccessibilityLabel: 'Map of churches',
  searchPlaceholder: 'Search for a church or a town',
  filters: 'Filters',
  filtersActive: (count) => `Filters, ${count} active`,
  myLocation: 'Go to my location',
  seeList: 'See list',
  nearYou: 'Near you',
  inThisArea: 'In this area',
  churchesCount: (count) => (count === 1 ? '1 church' : `${count} churches`),
  clusterLabel: (count) => `${count} churches in this area. Tap to zoom in`,
  zoomToSeeChurches: 'Zoom in to see each church',
  noChurchesHere: 'No churches in this area',
  noChurchesHereHint: 'Move the map or remove a filter.',
  mapError: "Couldn't load churches. Check your connection.",
  retry: 'Try again',
  locationDenied: 'No access to your location. You can move the map or search for a town.',

  searchTitle: 'Search',
  searchHint: 'Type the name of a church, a city or an island.',
  searchEmpty: (query) => `We found nothing for “${query}”.`,
  searchError: "Couldn't search. Check your connection.",

  filtersTitle: 'Filters',
  filterDenomination: 'Tradition',
  filterLanguage: 'Service language',
  filterVerified: 'Verified only',
  filterVerifiedHelp: 'Churches whose details and times were confirmed by their own community.',
  clearFilters: 'Clear filters',
  showResults: 'Show churches',
  close: 'Close',
  back: 'Back',

  listTitle: 'Nearby churches',
  listSubtitleNear: (km) => `Within ${km} km of you, nearest first.`,
  listEmpty: 'No churches match those filters at this distance.',
  verified: 'Verified',
  unverified: 'Unverified',
  distanceKm: (km) => `${km.toFixed(km < 10 ? 1 : 0)} km`,
  distanceM: (m) => `${m} m`,
  categories: {
    iglesia: 'Church',
    catedral: 'Cathedral',
    capilla: 'Chapel',
    ermita: 'Hermitage',
    monasterio: 'Monastery',
  },

  churchLoading: 'Loading church…',
  churchNotFound: "We couldn't find this church.",
  churchError: "Couldn't load the church. Check your connection.",
  verifiedBadge: 'Verified',
  verifiedHelp: 'Its community has confirmed these details and times.',
  osmBadge: 'Unverified',
  osmHelp:
    'Location taken from OpenStreetMap. Nobody from this church has confirmed the details, and service times may be missing.',
  directions: 'Directions',
  call: 'Call',
  website: 'Website',
  instagram: 'Instagram',
  save: 'Save',
  saved: 'Saved',
  share: 'Share',
  shareMessage: (name, place) => `${name}${place ? `, ${place}` : ''}. I found it on Churchly:`,
  seeOnMap: 'See on the map',
  nextService: 'Next service',
  today: 'Today',
  tomorrow: 'Tomorrow',
  scheduleTitle: 'Service times',
  noSchedules: "This church hasn't published its service times yet.",
  noSchedulesOsm: "We don't have this church's service times. Check its website or call before you go.",
  serviceLanguage: (lang) => `in ${lang}`,
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  aboutTitle: 'About this church',
  languagesTitle: 'Languages',
  whereTitle: 'Where it is',
  addressUnknown: 'No exact address',
  suggestEdit: 'Something wrong? Let us know',
  suggestEditSubject: (name) => `Data correction: ${name}`,

  savedTitle: 'Saved',
  savedSubtitle: 'Your churches, always at hand.',
  savedEmptyTitle: "You haven't saved any yet",
  savedEmptyBody: 'Tap “Save” on a church page to keep it here.',
  exploreMap: 'Explore the map',

  settingsTitle: 'Settings',
  settingsSubtitle: 'Language, your church and where the data comes from.',
  settingsLanguage: 'App language',
  settingsLanguageHelp: 'Choose the language you want to see Churchly in.',
  languageNameSpanish: 'Español',
  languageNameEnglish: 'English',
  settingsChurches: 'Are you from a church?',
  addChurch: 'Add or verify my church',
  addChurchHelp:
    "Send your community's details and service times. We review them and it will show as verified.",
  settingsAbout: 'About Churchly',
  aboutBody: 'Churchly helps you find a church near you, wherever you are.',
  dataCredits: 'Map data',
  dataCreditsBody:
    'Unverified locations come from OpenStreetMap, © OpenStreetMap contributors, under the ODbL licence.',
  contact: 'Write to us',
};

export const translations: Record<Language, Dictionary> = { es, en };

/** Tradiciones que se ofrecen como filtro. El valor es el que guarda la base de datos. */
export const DENOMINATIONS = [
  'Católica',
  'Evangélica',
  'Bautista',
  'Pentecostal',
  'Asambleas de Dios',
  'Anglicana',
  'Luterana',
  'Ortodoxa',
  'Adventista',
  'Metodista',
  'Reformada',
  'Cristiana',
];

/** Idiomas de culto que se ofrecen como filtro; los mismos que el formulario de la web. */
export const SERVICE_LANGUAGES = [
  'Español',
  'English',
  'Deutsch',
  'Svenska',
  'Norsk',
  'Dansk',
  'Suomi',
  'Français',
  'Italiano',
  'Nederlands',
];
