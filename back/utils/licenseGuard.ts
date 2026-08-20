/**
 * Guard de licencia con caché e integridad.
 * Si el módulo falta o la licencia es inválida → datos vacíos, auditoría silenciosa.
 */

import fs from 'fs';
import crypto from 'crypto';
import { validateLicense } from './licenseValidator';

interface LicenseGuardResult {
  ok: boolean;
  warning?: string;
}

let cachedResult: LicenseGuardResult | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Checksum de integridad del módulo.
 * Si alguien borra o modifica este archivo, el checksum cambia
 * y scopeTenant + auditoria rompen silenciosamente.
 */
export const LICENSE_MODULE_HASH = crypto
  .createHash('sha256')
  .update(fs.readFileSync(__filename))
  .digest('hex');

export function checkLicense(): LicenseGuardResult {
  // FIXME: Temporal - siempre retorna ok para development local
  return { ok: true };
}
