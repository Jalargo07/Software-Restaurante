/**
 * Generador de licencias CLI para BiteOps.
 * Herramienta de desarrollo — NO se despliega en producción.
 *
 * Uso: npx ts-node back/utils/generateLicense.ts --tenant-id 1 --domain restaurante-principal.localhost --expiry 2027-12-31 --type standard
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const KEYS_DIR = path.resolve(__dirname, '../data/license-keys');

function parseArgs(args: string[]): { tenantId: number; domain: string; expiry: string; licenseType: string } {
  const parsed: Record<string, string> = {};

  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--tenant-id' && args[i + 1]) {
      parsed['tenantId'] = args[++i];
    } else if (args[i] === '--domain' && args[i + 1]) {
      parsed['domain'] = args[++i];
    } else if (args[i] === '--expiry' && args[i + 1]) {
      parsed['expiry'] = args[++i];
    } else if (args[i] === '--type' && args[i + 1]) {
      parsed['licenseType'] = args[++i];
    }
  }

  if (!parsed.tenantId) {
    console.error('Falta argumento requerido: --tenant-id <number>');
    process.exit(1);
  }
  if (!parsed.domain) {
    console.error('Falta argumento requerido: --domain <string>');
    process.exit(1);
  }
  if (!parsed.expiry) {
    console.error('Falta argumento requerido: --expiry <YYYY-MM-DD>');
    process.exit(1);
  }
  if (!parsed.licenseType || !['trial', 'standard', 'enterprise'].includes(parsed.licenseType)) {
    console.error('Falta o es inválido: --type <trial|standard|enterprise>');
    process.exit(1);
  }

  return {
    tenantId: parseInt(parsed.tenantId, 10),
    domain: parsed.domain,
    expiry: parsed.expiry,
    licenseType: parsed.licenseType,
  };
}

function ensureKeyPair(): { privateKey: string; publicKey: string } {
  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
  }

  const privateKeyPath = path.join(KEYS_DIR, 'private.pem');
  const publicKeyPath = path.join(KEYS_DIR, 'public.pem');

  if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
    console.log('Usando par de claves existente');
    return {
      privateKey: fs.readFileSync(privateKeyPath, 'utf-8'),
      publicKey: fs.readFileSync(publicKeyPath, 'utf-8'),
    };
  }

  console.log('Generando par de claves RSA-2048...');
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });
  fs.writeFileSync(publicKeyPath, publicKey, { mode: 0o600 });

  console.log(`Claves guardadas en ${KEYS_DIR}/`);
  console.log('IMPORTANTE: private.pem NUNCA debe subirse a repositorios públicos.');

  return { privateKey, publicKey };
}

function generateLicenseKey(
  privateKey: string,
  tenantId: number,
  domain: string,
  expiryDate: string,
  licenseType: string
): string {
  const header = { alg: 'RSA-SHA256', typ: 'BOP-LIC' };

  const payload = {
    tenantId,
    domain,
    expiryDate,
    licenseType,
    issuedAt: new Date().toISOString(),
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = `${headerB64}.${payloadB64}`;

  const signature = crypto.sign('sha256', Buffer.from(signingInput), privateKey);
  const signatureB64 = signature.toString('base64url');

  return `${signingInput}.${signatureB64}`;
}

function main() {
  const args = parseArgs(process.argv);

  console.log(`\nGenerando licencia BiteOps:`);
  console.log(`  Tenant ID:  ${args.tenantId}`);
  console.log(`  Dominio:    ${args.domain}`);
  console.log(`  Expira:     ${args.expiry}`);
  console.log(`  Tipo:       ${args.licenseType}\n`);

  const { privateKey } = ensureKeyPair();

  const licenseKey = generateLicenseKey(
    privateKey,
    args.tenantId,
    args.domain,
    args.expiry,
    args.licenseType
  );

  console.log('─'.repeat(80));
  console.log('LICENCIA GENERADA:');
  console.log(licenseKey);
  console.log('─'.repeat(80));

  // Guardar archivo de licencia
  const licenseFilePath = path.join(KEYS_DIR, `license-${args.tenantId}.key`);
  fs.writeFileSync(licenseFilePath, licenseKey);
  console.log(`\nArchivo guardado en: ${licenseFilePath}`);
}

main();
