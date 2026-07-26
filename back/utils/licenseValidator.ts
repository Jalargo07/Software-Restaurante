/**
 * Validador de licencias BiteOps.
 * Verifica la firma RSA-SHA256 y la expiración de una clave de licencia.
 */

import crypto from 'crypto';

export interface LicenseResult {
  valid: boolean;
  expired: boolean;
  tenantId?: number;
  domain?: string;
  expiryDate?: string;
  licenseType?: string;
  error?: string;
}

/**
 * Clave pública RSA para verificar firmas de licencia.
 * IMPORTANTE: Reemplazar con la clave real después de generar el primer par de claves
 * con `npx ts-node back/utils/generateLicense.ts`.
 */
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqErSiIxaggJUCCEOWbpw
8RElbELylX76K97A45sUuEpDs9UEDrNtIUx1ImtJaFLx/RPA8pXB2ICpVnjOfkfv
05d4pvf55VUTh7m3tsS/dHasklPKw2fyI34yKbmf0/qiBRs5RwijKZJJj0SF4GSU
PzUjaTbEioKVCWrjPncthiZtCScr6BJF8vPrCbRHdTHPfBStL+XeAktxrNP6pA0c
W15RpgGBZXjUNy3MOKTlHo+dW/Q3ft4T99K5iHb6Ey9dDgvrIykJ/hJ+kQ/QmS2B
vyCTrfjil9EqXrwONV0LeP5lj0aBjP1yKDjBqTRyLxhFvqWWsfIlxwL2vMTII08i
9QIDAQAB
-----END PUBLIC KEY-----`;

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  if (padding) {
    base64 += '='.repeat(4 - padding);
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

function base64UrlEncode(data: string): string {
  return Buffer.from(data, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function validateLicense(licenseKey: string): LicenseResult {
  // Resultado por defecto: inválido
  const fail = (error: string): LicenseResult => ({
    valid: false,
    expired: false,
    error,
  });

  try {
    // 1. Separar las 3 partes del key
    const parts = licenseKey.split('.');
    if (parts.length !== 3) {
      return fail('Formato de licencia inválido: se esperan 3 partes separadas por punto');
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // 2. Decodificar header
    const headerJson = base64UrlDecode(headerB64);
    const header = JSON.parse(headerJson);

    if (header.alg !== 'RSA-SHA256' || header.typ !== 'BOP-LIC') {
      return fail(`Algoritmo o tipo inválido: alg=${header.alg}, typ=${header.typ}`);
    }

    // 3. Decodificar payload
    const payloadJson = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadJson);

    const { tenantId, domain, expiryDate, licenseType, issuedAt } = payload;

    if (!tenantId || !domain || !expiryDate || !licenseType) {
      return fail('Payload de licencia incompleto: faltan campos requeridos');
    }

    // 4. Verificar firma RSA-SHA256
    const signingInput = `${headerB64}.${payloadB64}`;
    const signatureBuffer = Buffer.from(signatureB64, 'base64url');

    const publicKeyObj = crypto.createPublicKey(PUBLIC_KEY);
    const verified = crypto.verify(
      'sha256',
      Buffer.from(signingInput),
      publicKeyObj,
      signatureBuffer
    );

    if (!verified) {
      return fail('Firma de licencia inválida');
    }

    // 5. Verificar expiración
    const expiryTime = new Date(expiryDate).getTime();
    const isExpired = Date.now() > expiryTime;

    if (isExpired) {
      return {
        valid: false,
        expired: true,
        tenantId,
        domain,
        expiryDate,
        licenseType,
        error: `Licencia expirada el ${expiryDate}`,
      };
    }

    // 6. Licencia válida
    return {
      valid: true,
      expired: false,
      tenantId,
      domain,
      expiryDate,
      licenseType,
    };
  } catch (error: any) {
    return fail(`Error al validar licencia: ${error.message}`);
  }
}
