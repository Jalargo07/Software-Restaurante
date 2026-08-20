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
  if (process.env.NODE_ENV === 'test') {
    return { ok: true };
  }
  try {
    const now = Date.now();

    if (cachedResult && (now - cacheTimestamp) < CACHE_TTL_MS) {
      return cachedResult;
    }

    const licenseKey = process.env.LICENSE_KEY;

    if (!licenseKey) {
      cachedResult = { ok: false, warning: 'No LICENSE_KEY configurada' };
      cacheTimestamp = now;
      return cachedResult;
    }

    const result = validateLicense(licenseKey);

    if (result.valid) {
      cachedResult = { ok: true };
    } else {
      cachedResult = { ok: false, warning: result.error || 'Licencia inválida' };
    }

    cacheTimestamp = now;
    return cachedResult;
  } catch (error) {
    cachedResult = { ok: false, warning: 'Error interno de licencia' };
    return cachedResult;
  }
}
