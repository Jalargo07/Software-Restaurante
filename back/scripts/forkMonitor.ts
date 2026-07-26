/**
 * Monitor de forks del repositorio en GitHub.
 * Compara el estado actual con un checkpoint previo e identifica nuevos forks.
 *
 * Uso: npx ts-node back/scripts/forkMonitor.ts
 * Requiere: GitHub CLI (gh) autenticado.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const REPO = 'Jalargo07/Software-Restaurante';
const CHECKPOINT_PATH = path.resolve(__dirname, '../data/fork-checkpoint.json');

interface ForkInfo {
  id: number;
  owner: string;
  url: string;
  createdAt: string;
}

interface Checkpoint {
  lastCheck: string;
  forks: ForkInfo[];
}

function checkGhCli(): boolean {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function fetchForks(): ForkInfo[] {
  try {
    const raw = execSync(`gh api repos/${REPO}/forks --paginate`, {
      encoding: 'utf-8',
      timeout: 30000,
    });

    const data = JSON.parse(raw);

    return data.map((fork: any) => ({
      id: fork.id,
      owner: fork.owner.login,
      url: fork.html_url,
      createdAt: fork.created_at,
    }));
  } catch (error: any) {
    console.error('Error al obtener forks:', error.message);
    return [];
  }
}

function loadCheckpoint(): Checkpoint | null {
  try {
    if (fs.existsSync(CHECKPOINT_PATH)) {
      const raw = fs.readFileSync(CHECKPOINT_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (error: any) {
    console.warn('No se pudo leer checkpoint, empezando desde cero:', error.message);
  }
  return null;
}

function saveCheckpoint(checkpoint: Checkpoint): void {
  const dir = path.dirname(CHECKPOINT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), 'utf-8');
  console.log(`Checkpoint guardado en: ${CHECKPOINT_PATH}`);
}

function main() {
  if (!checkGhCli()) {
    console.error('────────────────────────────────────────────────────');
    console.error('ERROR: GitHub CLI (gh) no está instalado o no está en PATH.');
    console.error('');
    console.error('Instálalo desde: https://cli.github.com/');
    console.error('Luego autentícate con: gh auth login');
    console.error('────────────────────────────────────────────────────');
    process.exit(1);
  }

  console.log(`\nMonitoreando forks de ${REPO}...`);

  const currentForks = fetchForks();
  if (currentForks.length === 0) {
    console.log('No se encontraron forks (o hubo un error de conexión).');
    return;
  }

  console.log(`Forks actuales: ${currentForks.length}`);

  const checkpoint = loadCheckpoint();
  const previousIds = new Set((checkpoint?.forks ?? []).map((f) => f.id));

  const newForks = currentForks.filter((f) => !previousIds.has(f.id));

  if (newForks.length > 0) {
    console.log(`\n🆕 ${newForks.length} fork(s) nuevo(s) detectado(s):\n`);
    for (const fork of newForks) {
      console.log(`  Owner:   ${fork.owner}`);
      console.log(`  URL:     ${fork.url}`);
      console.log(`  Creado:  ${fork.createdAt}`);
      console.log('');
    }
  } else {
    console.log('\nNo hay forks nuevos desde el último checkpoint.');
  }

  const newCheckpoint: Checkpoint = {
    lastCheck: new Date().toISOString(),
    forks: currentForks,
  };

  saveCheckpoint(newCheckpoint);
}

main();
