/** Buzón al que llegan las correcciones de datos y las consultas. */
export const CONTACT_EMAIL = 'felipecontactolp@gmail.com';

/**
 * Web donde una iglesia envía o verifica sus datos (el proyecto churchly-web). Sin esta
 * variable, la app no ofrece el enlace.
 */
export const SUBMISSION_URL = process.env.EXPO_PUBLIC_SUBMISSION_URL ?? null;
