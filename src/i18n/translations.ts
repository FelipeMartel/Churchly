export type Language = 'es' | 'en';

export type FilterOption = {
  value: string;
  label: string;
};

type Dictionary = {
  tabHome: string;
  tabSettings: string;

  mapLoading: string;
  mapErrorTitle: string;
  counterText: (radiusKm: number, count: number) => string;
  locationDenied: string;
  locationUnavailable: string;

  filtersButton: (activeCount: number) => string;
  filterSectionLanguage: string;
  filterSectionDenomination: string;
  filterSectionCountry: string;
  filterAllLanguages: string;
  filterAllDenominations: string;
  filterAllCountries: string;
  searchPlaceholder: string;
  clearFilters: string;
  close: string;
  denominations: FilterOption[];

  churchNoName: string;
  addressUnavailable: string;
  unknownLocation: string;
  viewDetails: string;

  churchLoading: string;
  churchErrorTitle: string;
  churchNotFound: string;
  errorNoId: string;
  unknownError: string;
  denominationNotSpecified: string;
  verifiedChurch: string;
  sectionLocation: string;
  addressNotAvailable: string;
  openInMaps: string;
  sectionInfo: string;
  labelDenomination: string;
  labelAddress: string;
  labelWebsite: string;
  labelPhone: string;
  labelInstagram: string;
  notSpecified: string;
  notAvailable: string;

  scheduleTitle: string;
  scheduleLoading: string;
  noSchedules: string;
  scheduleTBD: string;
  serviceLanguageLabel: (lang: string) => string;
  dayNames: string[];

  settingsTitle: string;
  settingsLanguageLabel: string;
  settingsLanguageHelper: string;
  languageNameSpanish: string;
  languageNameEnglish: string;

  radiusSliderLabel: string;
  filtersPanelLabel: string;
  mapAccessibilityLabel: string;
};

const es: Dictionary = {
  tabHome: 'Inicio',
  tabSettings: 'Ajustes',

  mapLoading: 'Cargando mapa e iglesias...',
  mapErrorTitle: 'Error al cargar iglesias',
  counterText: (radiusKm, count) => `Iglesias a ${radiusKm} km: ${count}`,
  locationDenied: 'Permiso de ubicación denegado. Mostrando Canarias por defecto.',
  locationUnavailable: 'No se pudo obtener tu ubicación. Mostrando Canarias por defecto.',

  filtersButton: (activeCount) => `Filtros${activeCount > 0 ? ` · ${activeCount}` : ''}`,
  filterSectionLanguage: 'Idioma',
  filterSectionDenomination: 'Denominación',
  filterSectionCountry: 'País',
  filterAllLanguages: 'Todos',
  filterAllDenominations: 'Todas',
  filterAllCountries: 'Todos',
  searchPlaceholder: 'Buscar por nombre, ciudad o país...',
  clearFilters: 'Limpiar filtros',
  close: 'Cerrar',
  denominations: [
    { value: 'catolica', label: 'Católica' },
    { value: 'evangelica', label: 'Evangélica' },
    { value: 'bautista', label: 'Bautista' },
    { value: 'asambleas_de_dios', label: 'Asambleas de Dios' },
    { value: 'anglicana', label: 'Anglicana' },
    { value: 'luterana', label: 'Luterana' },
    { value: 'adventista', label: 'Adventista' },
    { value: 'ortodoxa', label: 'Ortodoxa' },
  ],

  churchNoName: 'Iglesia sin nombre',
  addressUnavailable: 'Sin dirección',
  unknownLocation: 'Ubicación no disponible',
  viewDetails: 'Ver detalle',

  churchLoading: 'Cargando iglesia...',
  churchErrorTitle: 'Error al cargar iglesia',
  churchNotFound: 'No se encontró la iglesia.',
  errorNoId: 'No llegó id',
  unknownError: 'Error desconocido',
  denominationNotSpecified: 'Denominación no especificada',
  verifiedChurch: 'Iglesia verificada',
  sectionLocation: 'Ubicación',
  addressNotAvailable: 'Dirección no disponible',
  openInMaps: 'Abrir en Google Maps',
  sectionInfo: 'Información',
  labelDenomination: 'Denominación',
  labelAddress: 'Dirección',
  labelWebsite: 'Web',
  labelPhone: 'Teléfono',
  labelInstagram: 'Instagram',
  notSpecified: 'No especificada',
  notAvailable: 'No disponible',

  scheduleTitle: 'Horarios',
  scheduleLoading: 'Cargando horarios...',
  noSchedules: 'Esta iglesia todavía no tiene horarios publicados.',
  scheduleTBD: 'Horario por confirmar',
  serviceLanguageLabel: (lang) => `Idioma: ${lang}`,
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],

  settingsTitle: 'Ajustes',
  settingsLanguageLabel: 'Idioma de la app',
  settingsLanguageHelper: 'Elige el idioma en el que quieres ver Churchly.',
  languageNameSpanish: 'Español',
  languageNameEnglish: 'English',

  radiusSliderLabel: 'Radio de búsqueda cercana en kilómetros',
  filtersPanelLabel: 'Panel de filtros',
  mapAccessibilityLabel: 'Mapa con iglesias cercanas',
};

const en: Dictionary = {
  tabHome: 'Home',
  tabSettings: 'Settings',

  mapLoading: 'Loading map and churches...',
  mapErrorTitle: 'Failed to load churches',
  counterText: (radiusKm, count) => `Churches within ${radiusKm} km: ${count}`,
  locationDenied: 'Location permission denied. Showing the Canary Islands by default.',
  locationUnavailable: "Couldn't get your location. Showing the Canary Islands by default.",

  filtersButton: (activeCount) => `Filters${activeCount > 0 ? ` · ${activeCount}` : ''}`,
  filterSectionLanguage: 'Language',
  filterSectionDenomination: 'Denomination',
  filterSectionCountry: 'Country',
  filterAllLanguages: 'All',
  filterAllDenominations: 'All',
  filterAllCountries: 'All',
  searchPlaceholder: 'Search by name, city, or country...',
  clearFilters: 'Clear filters',
  close: 'Close',
  denominations: [
    { value: 'catolica', label: 'Catholic' },
    { value: 'evangelica', label: 'Evangelical' },
    { value: 'bautista', label: 'Baptist' },
    { value: 'asambleas_de_dios', label: 'Assemblies of God' },
    { value: 'anglicana', label: 'Anglican' },
    { value: 'luterana', label: 'Lutheran' },
    { value: 'adventista', label: 'Adventist' },
    { value: 'ortodoxa', label: 'Orthodox' },
  ],

  churchNoName: 'Unnamed church',
  addressUnavailable: 'No address',
  unknownLocation: 'Location not available',
  viewDetails: 'View details',

  churchLoading: 'Loading church...',
  churchErrorTitle: 'Failed to load church',
  churchNotFound: 'Church not found.',
  errorNoId: 'No id received',
  unknownError: 'Unknown error',
  denominationNotSpecified: 'Denomination not specified',
  verifiedChurch: 'Verified church',
  sectionLocation: 'Location',
  addressNotAvailable: 'Address not available',
  openInMaps: 'Open in Google Maps',
  sectionInfo: 'Information',
  labelDenomination: 'Denomination',
  labelAddress: 'Address',
  labelWebsite: 'Website',
  labelPhone: 'Phone',
  labelInstagram: 'Instagram',
  notSpecified: 'Not specified',
  notAvailable: 'Not available',

  scheduleTitle: 'Service times',
  scheduleLoading: 'Loading service times...',
  noSchedules: 'This church has no published service times yet.',
  scheduleTBD: 'Time to be confirmed',
  serviceLanguageLabel: (lang) => `Language: ${lang}`,
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  settingsTitle: 'Settings',
  settingsLanguageLabel: 'App language',
  settingsLanguageHelper: 'Choose the language you want to see Churchly in.',
  languageNameSpanish: 'Español',
  languageNameEnglish: 'English',

  radiusSliderLabel: 'Nearby search radius in kilometers',
  filtersPanelLabel: 'Filters panel',
  mapAccessibilityLabel: 'Map with nearby churches',
};

export const translations: Record<Language, Dictionary> = { es, en };
